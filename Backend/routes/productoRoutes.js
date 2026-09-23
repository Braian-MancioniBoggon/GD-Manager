const express = require("express");

const {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  desactivarProducto,
  actualizarProducto,
  cambiarEstadoTipo,
} = require("../controllers/productoController");

const router = express.Router();

router.get("/", obtenerProductos);

router.get("/:id", obtenerProductoPorId);

router.post("/", crearProducto);

router.put("/:id/desactivar", desactivarProducto);

router.put("/:id", actualizarProducto);

router.put( "/tipo/:tipo/estado", cambiarEstadoTipo);

module.exports = router;