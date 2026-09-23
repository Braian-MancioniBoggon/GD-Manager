const {
Rol,
} = require("../models/Usuario");

function obtenerPermisosEfectivos(
usuario,
rol
) {

const permisosRol =
rol?.permisos || [];

const otorgados =
usuario.permisosOtorgados || [];

const revocados =
usuario.permisosRevocados || [];

const permisos = new Set(
permisosRol
);

otorgados.forEach(
(permiso) => {
permisos.add(permiso);
}
);

revocados.forEach(
(permiso) => {
permisos.delete(permiso);
}
);

return [
...permisos,
];

}

function requierePermiso(
permiso
) {

return async (
req,
res,
next
) => {

try {

  if (!req.usuario) {

    return res.status(401).json({
      mensaje:
        "Usuario no autenticado",
    });

  }

  const rol =
    await Rol.findOne({
      _id: req.usuario.rol,
  });

  const permisosEfectivos =
    obtenerPermisosEfectivos(
      req.usuario,
      rol
    );

  req.permisosEfectivos =
    permisosEfectivos;

  if (
    !permisosEfectivos.includes(
      permiso
    )
  ) {

    return res.status(403).json({
      mensaje:
        "No tenés permiso para realizar esta acción",
    });

  }

  next();

} catch (error) {

  console.error(
    "Error de autorización:",
    error
  );

  return res.status(500).json({
    mensaje:
      "Error al comprobar permisos",
  });

}

};

}

module.exports =
requierePermiso;

module.exports.obtenerPermisosEfectivos =
obtenerPermisosEfectivos;