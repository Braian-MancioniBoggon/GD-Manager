const express = require("express");

const router = express.Router();

const { obtenerStockCritico, stockProximo, ultimosMovimientos, } = require("../controllers/dashboardController");

router.get( "/stock-critico", obtenerStockCritico );
router.get( "/stock-proximo", stockProximo );
router.get( "/ultimos-movimientos", ultimosMovimientos );

module.exports = router;