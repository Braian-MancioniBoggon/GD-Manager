const Usuario = require("../models/Usuario");

module.exports = async (
req,
res,
next
) => {

try {

const usuarioId =
  req.headers["x-usuario-id"];

if (!usuarioId) {

  return res.status(401).json({
    mensaje:
      "Usuario no autenticado",
  });

}

const usuario =
  await Usuario.findOne({
    _id: usuarioId,
    activo: true,
  });

if (!usuario) {

  return res.status(401).json({
    mensaje:
      "Usuario no encontrado o inactivo",
  });

}

req.usuario = usuario;

next();

} catch (error) {

console.error(
  "Error en autenticación:",
  error
);

return res.status(401).json({
  mensaje:
    "No se pudo autenticar al usuario",
});

}

};