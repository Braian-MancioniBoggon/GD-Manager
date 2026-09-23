const Movimiento = require("../models/Movimiento");
const Stock = require("../models/Stock");
const Producto = require("../models/Producto");

const ingreso = async (req, res) => {
  try {
    const {
      productoId,
      cantidad,
      observacion,
    } = req.body;

    const usuario = req.usuario;

    if (!usuario) {

      return res.status(401).json({
        mensaje: "Usuario no autenticado",
      });
    
    }
    

    if (cantidad <= 0) {
      return res.status(400).json({
        mensaje: "La cantidad debe ser mayor a cero",
      });
    }

    const producto = await Producto.findById(
      productoId
    );

    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado",
      });
    }

    if (!producto.activo) {
      return res.status(400).json({
        mensaje: "El producto está desactivado",
      });
    }

    const stock = await Stock.findOne({
      productoId,
    });

    if (!stock) {
      return res.status(404).json({
        mensaje: "Stock no encontrado",
      });
    }

    stock.hojas += cantidad;

    await stock.save();

    const movimiento = await Movimiento.create({
      productoId,
      usuario,
      tipo: "INGRESO",
      cantidad,
      valorMostradoWidget: `+${cantidad} hojas`,
      observacion,
    });

    res.status(201).json(movimiento);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const egreso = async (req, res) => {
  try {
    const {
      productoId,
      cantidad,
      observacion,
    } = req.body;

    const usuario = req.headers["x-usuario-id"];

    if (!usuario) {

      return res.status(401).json({
        mensaje: "Usuario no autenticado",
      });
    
    }
    

    if (cantidad <= 0) {
      return res.status(400).json({
        mensaje: "La cantidad debe ser mayor a cero",
      });
    }

    const producto = await Producto.findById(
      productoId
    );
    
    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado",
      });
    }
    
    if (!producto.activo) {
      return res.status(400).json({
        mensaje: "El producto está desactivado",
      });
    }

    const stock = await Stock.findOne({
      productoId,
    });

    if (!stock) {
      return res.status(404).json({
        mensaje: "Stock no encontrado",
      });
    }

    if (stock.hojas < cantidad) {
      return res.status(400).json({
        mensaje: "Stock insuficiente",
      });
    }

    stock.hojas -= cantidad;

    await stock.save();

    const movimiento = await Movimiento.create({
      productoId,
      usuario,
      tipo: "EGRESO",
      cantidad,
      valorMostradoWidget: `-${cantidad}  hojas`,
      observacion,
    });

    res.status(201).json(movimiento);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const ajuste = async (req, res) => {
  try {
    const {
      productoId,
      nuevoStock,
      observacion,
    } = req.body;
    
    const usuario = req.headers["x-usuario-id"];

    if (!usuario) {

      return res.status(401).json({
        mensaje: "Usuario no autenticado",
      });
    
    }
    
    if (nuevoStock < 0) {
      return res.status(400).json({
        mensaje: "El stock no puede ser negativo",
      });
    }

    const producto = await Producto.findById(
      productoId
    );
    
    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado",
      });
    }
    
    if (!producto.activo) {
      return res.status(400).json({
        mensaje: "El producto está desactivado",
      });
    }

    const stock = await Stock.findOne({
      productoId,
    });

    if (!stock) {
      return res.status(404).json({
        mensaje: "Stock no encontrado",
      });
    }

    const stockAnterior = stock.hojas;

    stock.hojas = nuevoStock;

    await stock.save();

    const movimiento = await Movimiento.create({
      productoId,
      usuario,
      tipo: "AJUSTE",
      cantidad: 0,
      stockAnterior,
      stockNuevo: nuevoStock,
      valorMostradoWidget: `${stockAnterior} → ${nuevoStock} hojas`,
      observacion,
    });

    res.status(201).json(movimiento);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const obtenerMovimientos = async (
  req,
  res
) => {
  try {
    const {
      productoId,
      tipo,
      fechaDesde,
      fechaHasta,
    } = req.query;

    const filtros = {};

    if (productoId) {
      filtros.productoId = productoId;
    }

    if (tipo) {
      filtros.tipo = tipo;
    }

    if (fechaDesde || fechaHasta) {
      filtros.createdAt = {};

      if (fechaDesde) {
        filtros.createdAt.$gte =
          new Date(fechaDesde);
      }

      if (fechaHasta) {
        filtros.createdAt.$lte =
          new Date(fechaHasta);
      }
    }

    const movimientos =
      await Movimiento.find(filtros)
        .populate("productoId")
        .populate("usuario", "nombre color")
        .sort({
          createdAt: -1,
        });

    res.json(movimientos);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

module.exports = {
  ingreso,
  egreso,
  ajuste,
  obtenerMovimientos,
};