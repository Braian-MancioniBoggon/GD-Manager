const bcrypt = require("bcrypt");

const Usuario =
require("../models/Usuario");

const {
Rol,
permisosDisponibles,
} =
require("../models/Usuario");

const {
obtenerPermisosEfectivos,
} =
require("../middlewares/autorizacion");

// =====================================================
// UTILIDADES
// =====================================================

function respuestaUsuario(
usuario,
permisosEfectivos = []
) {

const respuesta =
usuario.toObject();

delete respuesta.password;

respuesta.permisosEfectivos =
permisosEfectivos;

return respuesta;

}

async function obtenerRolUsuario(usuario) {

  return await Rol.findById(
    usuario.rol
  );

}

// =====================================================
// OBTENER USUARIOS
// =====================================================

exports.obtenerUsuarios =
async (
req,
res
) => {

try {

const usuarios =
  await Usuario.find()
    .select("-password")
    .populate(
      "rol",
      "nombre descripcion permisos activo"
    )
    .sort({
      nombre: 1,
    });

const usuariosConPermisos =
  await Promise.all(
    usuarios.map(
      async (usuario) => {

        const rol =
          await obtenerRolUsuario(
            usuario
          );

        const permisosEfectivos =
          obtenerPermisosEfectivos(
            usuario,
            rol
          );

        return {
          ...usuario.toObject(),
          permisosEfectivos,
        };

      }
    )
  );

res.json(
  usuariosConPermisos
);

} catch (error) {

res.status(500).json({
  mensaje:
    error.message,
});

}

};

// =====================================================
// OBTENER USUARIOS LOGIN
// =====================================================

// exports.obtenerUsuariosLogin = async (req, res) => {
//   try {
//     const usuarios = await Usuario.find({
//       activo: true,
//     })
//       .select("_id nombre color avatar")
//       .sort({
//         nombre: 1,
//       });
// 
//     res.json(usuarios);
// 
//   } catch (error) {
// 
//     res.status(500).json({
//       mensaje: error.message,
//     });
// 
//   }
// };

// =====================================================
// CREAR USUARIO
// =====================================================

exports.crearUsuario =
async (
req,
res
) => {

try {

const {
  nombre,
  password,
  color,
  avatar,
  rol,
  permisosOtorgados,
  permisosRevocados,
} = req.body;

if (
  !nombre ||
  !password
) {

  return res.status(400).json({
    mensaje:
      "Nombre y contraseña son obligatorios",
  });

}

const nombreNormalizado =
  nombre.trim();

const existe =
  await Usuario.findOne({
    nombre:
      nombreNormalizado,
  });

if (existe) {

  return res.status(400).json({
    mensaje:
      "Ya existe un usuario con ese nombre",
  });

}

const rolUsuario =
  await Rol.findOne({
    nombre:
      rol ||
      "guillotinista",
    activo: true,
  });

if (!rolUsuario) {

  return res.status(400).json({
    mensaje:
      "El rol seleccionado no existe",
  });

}

const passwordHash =
  await bcrypt.hash(
    password,
    10
  );

const nuevo =
  new Usuario({

    nombre:
      nombreNormalizado,

    password:
      passwordHash,

    color:
      color ||
      "#E20A19",

    avatar:
      avatar ||
      "logo",

    rol:
      rolUsuario._id,

    permisosOtorgados:
      permisosOtorgados || [],

    permisosRevocados:
      permisosRevocados || [],

  });

await nuevo.save();

const permisosEfectivos =
  obtenerPermisosEfectivos(
    nuevo,
    rolUsuario
  );

res.json(
  respuestaUsuario(
    nuevo,
    permisosEfectivos
  )
);

} catch (error) {

res.status(500).json({
  mensaje:
    error.message,
});

}

};

// =====================================================
// LOGIN
// =====================================================

exports.login =
async (
req,
res
) => {

try {

const {
  nombre,
  password,
} = req.body;

const usuario =
  await Usuario.findOne({
    nombre:
      nombre.trim(),
    activo: true,
  });

if (!usuario) {

  return res.status(401).json({
    mensaje:
      "Usuario no encontrado",
  });

}

const coincide =
  await bcrypt.compare(
    password,
    usuario.password
  );

if (!coincide) {

  return res.status(401).json({
    mensaje:
      "Contraseña incorrecta",
  });

}

usuario.ultimoIngreso =
  new Date();

await usuario.save();

const rol =
  await obtenerRolUsuario(
    usuario
  );

const permisosEfectivos =
  obtenerPermisosEfectivos(
    usuario,
    rol
  );

res.json(
  respuestaUsuario(
    usuario,
    permisosEfectivos
  )
);

} catch (error) {

res.status(500).json({
  mensaje:
    error.message,
});

}

};

exports.obtenerUsuariosLogin = async (
  req,
  res
) => {
  try {

    const usuarios =
      await Usuario.find({
        activo: true,
      })
        .select(
          "_id nombre color avatar rol"
        )
        .sort({
          nombre: 1,
        });

    res.json(usuarios);

  } catch (error) {

    res.status(500).json({
      mensaje: error.message,
    });

  }
};

// =====================================================
// EDITAR MI PERFIL
// =====================================================

exports.editarMiPerfil =
async (
req,
res
) => {

try {

const {
  nombre,
  color,
  avatar,
} = req.body;

const usuario =
  await Usuario.findById(
    req.usuario._id
  );

if (!usuario) {

  return res.status(404).json({
    mensaje:
      "Usuario no encontrado",
  });

}

if (nombre) {

  const nombreNormalizado =
    nombre.trim();

  const existe =
    await Usuario.findOne({
      nombre:
        nombreNormalizado,

      _id: {
        $ne:
          usuario._id,
      },
    });

  if (existe) {

    return res.status(400).json({
      mensaje:
        "Ese nombre ya está en uso",
    });

  }

  usuario.nombre =
    nombreNormalizado;

}

if (
  color !== undefined
) {

  usuario.color =
    color;

}

if (
  avatar !== undefined
) {

  usuario.avatar =
    avatar;

}

await usuario.save();

const rol =
  await obtenerRolUsuario(
    usuario
  );

const permisosEfectivos =
  obtenerPermisosEfectivos(
    usuario,
    rol
  );

res.json(
  respuestaUsuario(
    usuario,
    permisosEfectivos
  )
);

} catch (error) {

res.status(500).json({
  mensaje:
    error.message,
});

}

};

// =====================================================
// CAMBIAR MI CONTRASEÑA
// =====================================================

exports.cambiarMiPassword =
async (
req,
res
) => {

try {

const {
  passwordActual,
  nuevaPassword,
} = req.body;

if (
  !passwordActual ||
  !nuevaPassword
) {

  return res.status(400).json({
    mensaje:
      "Debés completar ambas contraseñas",
  });

}

const usuario =
  await Usuario.findById(
    req.usuario._id
  );

if (!usuario) {

  return res.status(404).json({
    mensaje:
      "Usuario no encontrado",
  });

}

const coincide =
  await bcrypt.compare(
    passwordActual,
    usuario.password
  );

if (!coincide) {

  return res.status(400).json({
    mensaje:
      "La contraseña actual es incorrecta",
  });

}

usuario.password =
  await bcrypt.hash(
    nuevaPassword,
    10
  );

await usuario.save();

res.json({
  mensaje:
    "Contraseña actualizada correctamente",
});

} catch (error) {

res.status(500).json({
  mensaje:
    error.message,
});

}

};

// =====================================================
// EDITAR USUARIO - ADMIN
// =====================================================

exports.editarUsuario =
async (
req,
res
) => {

try {

const {
  nombre,
  color,
  avatar,
  rol,
  permisosOtorgados,
  permisosRevocados,
  password,
} = req.body;

const usuario =
  await Usuario.findById(
    req.params.id
  );

if (!usuario) {

  return res.status(404).json({
    mensaje:
      "Usuario no encontrado",
  });

}

if (nombre) {

  const nombreNormalizado =
    nombre.trim();

  const existe =
    await Usuario.findOne({
      nombre:
        nombreNormalizado,

      _id: {
        $ne:
          usuario._id,
      },
    });

  if (existe) {

    return res.status(400).json({
      mensaje:
        "Ese nombre ya está en uso",
    });

  }

  usuario.nombre =
    nombreNormalizado;

}

if (
  color !== undefined
) {

  usuario.color =
    color;

}

if (
  avatar !== undefined
) {

  usuario.avatar =
    avatar;

}

if (rol) {

  const rolExiste =
    await Rol.findOne({
      nombre: rol,
      activo: true,
    });

  if (!rolExiste) {

    return res.status(400).json({
      mensaje:
        "El rol seleccionado no existe",
    });

  }

  usuario.rol =
    rolExiste._id;

}

if (
  permisosOtorgados !==
  undefined
) {

  usuario.permisosOtorgados =
    permisosOtorgados;

}

if (
  permisosRevocados !==
  undefined
) {

  usuario.permisosRevocados =
    permisosRevocados;

}

if (password) {

  usuario.password =
    await bcrypt.hash(
      password,
      10
    );

}

await usuario.save();

const rolUsuario =
  await obtenerRolUsuario(
    usuario
  );

const permisosEfectivos =
  obtenerPermisosEfectivos(
    usuario,
    rolUsuario
  );

res.json(
  respuestaUsuario(
    usuario,
    permisosEfectivos
  )
);

} catch (error) {

res.status(500).json({
  mensaje:
    error.message,
});

}

};

// =====================================================
// ACTIVAR / DESACTIVAR USUARIO
// =====================================================

exports.cambiarEstadoUsuario =
async (
req,
res
) => {

try {

const usuario =
  await Usuario.findById(
    req.params.id
  );

if (!usuario) {

  return res.status(404).json({
    mensaje:
      "Usuario no encontrado",
  });

}

if (
  usuario._id.toString() ===
  req.usuario._id.toString()
) {

  return res.status(400).json({
    mensaje:
      "No podés desactivar tu propio usuario",
  });

}

usuario.activo =
  !usuario.activo;

await usuario.save();

res.json({
  mensaje:
    usuario.activo
      ? "Usuario activado"
      : "Usuario desactivado",

  activo:
    usuario.activo,
});

} catch (error) {

res.status(500).json({
  mensaje:
    error.message,
});

}

};

// =====================================================
// OBTENER PERMISOS
// =====================================================

exports.obtenerPermisos =
async (
req,
res
) => {

res.json(
permisosDisponibles
);

};

// =====================================================
// OBTENER ROLES
// =====================================================

exports.obtenerRoles =
async (
req,
res
) => {

try {

const roles =
  await Rol.find({}).sort({
    nombre: 1,
  });

res.json(
  roles
);

} catch (error) {

res.status(500).json({
  mensaje:
    error.message,
});

}

};

exports.obtenerRol =
async (
  req,
  res
) => {

  try {

    const rol =
      await Rol.findById(
        req.params.id
      );

    if (!rol) {

      return res.status(404).json({
        mensaje:
          "Rol no encontrado",
      });

    }

    res.json(rol);

  } catch (error) {

    res.status(500).json({
      mensaje:
        error.message,
    });

  }

};

// =====================================================
// CREAR ROL
// =====================================================

exports.crearRol =
async (
req,
res
) => {

try {

const {
  nombre,
  descripcion,
  permisos,
} = req.body;

if (!nombre) {

  return res.status(400).json({
    mensaje:
      "El nombre del rol es obligatorio",
  });

}

const existe =
  await Rol.findOne({
    nombre:
      nombre.trim(),
  });

if (existe) {

  return res.status(400).json({
    mensaje:
      "Ya existe un rol con ese nombre",
  });

}

const nuevo =
  new Rol({

    nombre:
      nombre.trim(),

    descripcion:
      descripcion ||
      "",

    permisos:
      permisos || [],

  });

await nuevo.save();

res.json(
  nuevo
);

} catch (error) {

res.status(500).json({
  mensaje:
    error.message,
});

}

};

// =====================================================
// EDITAR ROL
// =====================================================

exports.editarRol =
async (
req,
res
) => {

try {

const {
  nombre,
  descripcion,
  permisos,
} = req.body;

const rol =
  await Rol.findById(
    req.params.id
  );

if (!rol) {

  return res.status(404).json({
    mensaje:
      "Rol no encontrado",
  });

}

if (nombre) {

  const existe =
    await Rol.findOne({
      nombre:
        nombre.trim(),

      _id: {
        $ne:
          rol._id,
      },
    });

  if (existe) {

    return res.status(400).json({
      mensaje:
        "Ya existe un rol con ese nombre",
    });

  }

  rol.nombre =
    nombre.trim();

}

if (
  descripcion !==
  undefined
) {

  rol.descripcion =
    descripcion;

}

if (
  permisos !==
  undefined
) {

  rol.permisos =
    permisos;

}

await rol.save();

res.json(
  rol
);

} catch (error) {

res.status(500).json({
  mensaje:
    error.message,
});

}

};

// =====================================================
// ACTIVAR / DESACTIVAR ROL
// =====================================================

exports.cambiarEstadoRol =
async (
req,
res
) => {

try {

const rol =
  await Rol.findById(
    req.params.id
  );

if (!rol) {

  return res.status(404).json({
    mensaje:
      "Rol no encontrado",
  });

}

rol.activo =
  !rol.activo;


await rol.save();


res.json({

  mensaje:
    rol.activo
      ? "Rol activado"
      : "Rol desactivado",

  activo:
    rol.activo,

});


} catch(error) {

res.status(500).json({

  mensaje:
    error.message,

});

}

};