const Stock = require("../models/Stock");

const obtenerStock = async (req, res) => {
  try {
    const stock = await Stock.find()
      .populate("productoId")
      .sort({ hojas: 1 });

    res.json(stock);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const obtenerStockBajoMinimo = async (req, res) => {
  try {
    const stock =
      await Stock.find()
        .populate("productoId");
    const stockBajo =
      stock.filter(
        (item) =>
          item.hojas <=
          item.productoId
            .stockMinimo
      );
    res.json(stockBajo);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

obtenerStockCompleto = async (req, res) => {

  try {

    const stock = await Stock.find()
      .populate("productoId")
      .lean();

    const resultado = stock
      .filter(item => item.productoId);

    res.json(resultado);

  } catch (err) {

    res.status(500).json({
      mensaje: err.message,
    });

  }

};

module.exports = {
  obtenerStock,
  obtenerStockBajoMinimo,
  obtenerStockCompleto,
};