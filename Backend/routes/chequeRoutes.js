const express = require("express");

const auth =
  require("../middlewares/auth");

const requierePermiso =
  require("../middlewares/autorizacion");

const {
  crearCheque,
  obtenerCheques,
  obtenerCheque,
  editarCheque,
  depositarCheque,
  entregarCheque,
} =
  require("../controllers/chequeController");

const {
  obtenerMovimientosCheque,
} =
  require(
    "../controllers/movimientoChequeController"
  );

const router =
  express.Router();

// ========================================
// CONSULTAS
// ========================================

router.get(
  "/",
  auth,
  requierePermiso("ver_cheques"),
  obtenerCheques
);

// ========================================
// HISTORIAL
// ========================================

router.get(
  "/:chequeId/historial",
  auth,
  requierePermiso("ver_cheques"),
  obtenerMovimientosCheque
);

// ========================================
// CHEQUE POR ID
// ========================================

router.get(
  "/:id",
  auth,
  requierePermiso("ver_cheques"),
  obtenerCheque
);

// ========================================
// CREAR
// ========================================

router.post(
  "/",
  auth,
  requierePermiso("crear_cheque"),
  crearCheque
);

// ========================================
// EDITAR
// ========================================

router.put(
  "/:id",
  auth,
  requierePermiso("editar_cheque"),
  editarCheque
);

// ========================================
// ESTADOS
// ========================================

router.post(
  "/:id/depositar",
  auth,
  requierePermiso(
    "cambiar_estado_cheque"
  ),
  depositarCheque
);

router.post(
  "/:id/entregar",
  auth,
  requierePermiso(
    "cambiar_estado_cheque"
  ),
  entregarCheque
);

module.exports =
  router;