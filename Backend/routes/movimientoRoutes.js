const express = require("express");
const auth = require("../middlewares/auth");

const router = express.Router();

const {
  ingreso,
  egreso,
  ajuste,
  obtenerMovimientos,
} = require("../controllers/movimientoController");

router.get("/", auth, obtenerMovimientos);

router.post("/ingreso", auth, ingreso);

router.post("/egreso", auth, egreso);

router.post("/ajuste", auth, ajuste);

module.exports = router;