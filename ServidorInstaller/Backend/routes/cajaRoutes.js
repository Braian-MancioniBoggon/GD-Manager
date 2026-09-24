const express = require("express");

const auth =
  require("../middlewares/auth");

const requierePermiso =
  require("../middlewares/autorizacion");

const {
  obtenerCajaActual,
  obtenerCajas,
  obtenerCajaPorId,
  crearCaja,

  actualizarIngresoManual,
  agregarIngreso,
  actualizarContable,

  agregarEgreso,
  agregarGastoBanco,

  actualizarCajaFuerte,

  cerrarCaja,
} =
  require("../controllers/cajaController");

const {
  obtenerMovimientosCaja,
} =
  require("../controllers/movimientoCajaController");

const router =
  express.Router();

// ========================================
// CONSULTAS
// ========================================

router.get(
  "/actual",
  auth,
  requierePermiso("ver_caja"),
  obtenerCajaActual
);

router.get(
  "/",
  auth,
  requierePermiso("ver_caja"),
  obtenerCajas
);

// ========================================
// HISTORIAL DE UNA CAJA
// ========================================

router.get(
  "/:cajaId/historial",
  auth,
  requierePermiso("ver_caja"),
  obtenerMovimientosCaja
);

// ========================================
// CAJA POR ID
// ========================================

router.get(
  "/:id",
  auth,
  requierePermiso("ver_caja"),
  obtenerCajaPorId
);

// ========================================
// CREAR CAJA
// ========================================

router.post(
  "/",
  auth,
  requierePermiso("crear_caja"),
  crearCaja
);

// ========================================
// INGRESO MANUAL
// ========================================

router.put(
  "/:id/ingreso-manual",
  auth,
  requierePermiso("editar_caja"),
  actualizarIngresoManual
);

// ========================================
// INGRESOS
// ========================================

router.post(
  "/:id/ingresos",
  auth,
  requierePermiso("editar_caja"),
  agregarIngreso
);

// ========================================
// CONTABLE
// ========================================

router.put(
  "/:id/ingresos/:ingresoId/contable",
  auth,
  requierePermiso("editar_caja"),
  actualizarContable
);

// ========================================
// EGRESOS
// ========================================

router.post(
  "/:id/egresos/:categoria",
  auth,
  requierePermiso("editar_caja"),
  agregarEgreso
);

// ========================================
// GASTOS POR BANCO
// ========================================

router.post(
  "/:id/gastos-banco",
  auth,
  requierePermiso("editar_caja"),
  agregarGastoBanco
);

// ========================================
// CAJA FUERTE
// ========================================

router.put(
  "/:id/caja-fuerte",
  auth,
  requierePermiso("editar_caja"),
  actualizarCajaFuerte
);

// ========================================
// CERRAR CAJA
// ========================================

router.post(
  "/:id/cerrar",
  auth,
  requierePermiso("cerrar_caja"),
  cerrarCaja
);

module.exports =
  router;