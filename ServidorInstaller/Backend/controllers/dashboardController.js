const Stock = require("../models/Stock");

const obtenerStockCritico = async (req, res) => {
  try {

    const stock = await Stock.find()
      .populate("productoId")
      .lean();

    const resultado = stock
      .filter((item) => {

        if (!item.productoId) return false;

        if (!item.productoId.activo) return false;

        return item.hojas <= item.productoId.stockMinimo;

      })
      .map((item) => ({

        _id: item._id,

        tipo: item.productoId.tipo,

        gramaje: item.productoId.gramaje,

        anchoCm: item.productoId.anchoCm,

        altoCm: item.productoId.altoCm,

        stock: item.hojas,

        stockMinimo: item.productoId.stockMinimo,

      }))
      .sort((a, b) => a.stock - b.stock);

    res.json(resultado);

  } catch (error) {

    res.status(500).json({
      mensaje: error.message,
    });

  }
};

const stockProximo = async (req, res) => {

  try {

    const stock = await Stock.find()
      .populate("productoId");

    const proximos = stock
      .filter(item => {

        if (!item.productoId) return false;

        const minimo =
          item.productoId.stockMinimo;

        return (
          item.hojas > minimo &&
          item.hojas <= minimo * 1.3
        );

      })
      .map(item => ({
        _id: item.productoId._id,
        tipo: item.productoId.tipo,
        gramaje: item.productoId.gramaje,
        anchoCm: item.productoId.anchoCm,
        altoCm: item.productoId.altoCm,
        stock: item.hojas,
      }));

    res.json(proximos);

  } catch (err) {

    res.status(500).json({
      mensaje: err.message,
    });

  }

};

const Movimiento = require("../models/Movimiento");

const ultimosMovimientos = async (req, res) => {

  try {

    const movimientos = await Movimiento.find()
      .populate("productoId")
      .populate("usuario", "nombre color")
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();

    res.json(movimientos);

  } catch (error) {

    res.status(500).json({
      mensaje: error.message,
    });

  }

};

module.exports = {
  obtenerStockCritico,
  stockProximo,
  ultimosMovimientos,
};