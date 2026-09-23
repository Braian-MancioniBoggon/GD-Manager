const express = require("express");

const router =
express.Router();

const {
obtenerUsuarios,
obtenerUsuariosLogin,
crearUsuario,
login,

editarMiPerfil,
cambiarMiPassword,

editarUsuario,
cambiarEstadoUsuario,

obtenerPermisos,

obtenerRoles,
obtenerRol,
crearRol,
editarRol,
cambiarEstadoRol,

} =
require(
"../controllers/usuarioController"
);

const auth =
require(
"../middlewares/auth"
);

const requierePermiso =
require(
"../middlewares/autorizacion"
);

// =====================================================
// LOGIN
// =====================================================

router.get(
  "/login-lista",
  obtenerUsuariosLogin
);

router.post(
"/login",
login
);

// =====================================================
// MI PERFIL
// =====================================================

router.put(
"/perfil",
auth,
editarMiPerfil
);

router.put(
"/perfil/password",
auth,
cambiarMiPassword
);

// =====================================================
// RUTAS AUTENTICADAS
// =====================================================

router.get(
  "/",
  auth,
  requierePermiso(
    "administrar_usuarios"
  ),
  obtenerUsuarios
);

// =====================================================
// USUARIOS
// =====================================================

router.get(
"/",
auth,
requierePermiso(
"administrar_usuarios"
),
obtenerUsuarios
);

router.get(
  "/login/usuarios",
  obtenerUsuariosLogin
);

router.post(
"/",
auth,
requierePermiso(
"crear_usuarios"
),
crearUsuario
);

router.get(
  "/roles/:id",
  auth,
  requierePermiso("administrar_roles"),
  obtenerRol
);

router.put(
"/:id",
auth,
requierePermiso(
"editar_usuarios"
),
editarUsuario
);

router.put(
"/:id/estado",
auth,
requierePermiso(
"desactivar_usuarios"
),
cambiarEstadoUsuario
);

// =====================================================
// PERMISOS
// =====================================================

router.get(
"/permisos",
auth,
requierePermiso(
"administrar_roles"
),
obtenerPermisos
);

// =====================================================
// ROLES
// =====================================================

router.get(
"/roles",
auth,
requierePermiso(
"administrar_roles"
),
obtenerRoles
);

router.post(
"/roles",
auth,
requierePermiso(
"administrar_roles"
),
crearRol
);

router.put(
"/roles/:id",
auth,
requierePermiso(
"administrar_roles"
),
editarRol
);

router.put(
  "/roles/:id/estado",
  auth,
  requierePermiso(
    "administrar_roles"
  ),
  cambiarEstadoRol
);

module.exports =
router;