const express = require("express");

const {
    obtenerStock, 
    obtenerStockBajoMinimo,
    obtenerStockCompleto,
} = require("../controllers/stockController");

const router = express.Router();

router.get("/bajo-minimo", obtenerStockBajoMinimo);

router.get("/", obtenerStock);

router.get("/completo", obtenerStockCompleto);

module.exports = router;