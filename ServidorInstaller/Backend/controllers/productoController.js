const Producto = require("../models/Producto");
const Stock = require("../models/Stock");

// Crear uno o varios productos
const crearProducto = async (req, res) => {
  try {
    // Si recibimos un array, cargamos varios productos
    if (Array.isArray(req.body)) {
      const productos = req.body;

      const productosParaCrear = [];
      const duplicados = [];

      for (const producto of productos) {
        const {
          tipo,
          prioridad,
          gramaje,
          anchoCm,
          altoCm,
          stockMinimo,
          activo = true,
        } = producto;

        // Normalizar tipo
        const tipoNormalizado = tipo
          .trim()
          .toUpperCase();

        // Normalizar formato
        const anchoNormalizado = Math.min(
          Number(anchoCm),
          Number(altoCm)
        );

        const altoNormalizado = Math.max(
          Number(anchoCm),
          Number(altoCm)
        );

        // Verificar si ya existe
        const existe = await Producto.findOne({
          tipo: tipoNormalizado,
          gramaje: Number(gramaje),
          anchoCm: anchoNormalizado,
          altoCm: altoNormalizado,
        });

        if (existe) {
          duplicados.push({
            tipo: tipoNormalizado,
            gramaje,
            anchoCm: anchoNormalizado,
            altoCm: altoNormalizado,
          });

          continue;
        }

        productosParaCrear.push({
          tipo: tipoNormalizado,
          prioridad,
          gramaje: Number(gramaje),
          anchoCm: anchoNormalizado,
          altoCm: altoNormalizado,
          stockMinimo: Number(stockMinimo) || 0,
          activo,
        });
      }

      // Crear productos
      let productosCreados = [];

      if (productosParaCrear.length > 0) {
        productosCreados =
          await Producto.insertMany(
            productosParaCrear
          );
      }

      // Crear Stock para cada producto
      if (productosCreados.length > 0) {
        const stocks = productosCreados.map(
          (producto) => ({
            productoId: producto._id,
            hojas: 0,
          })
        );

        await Stock.insertMany(stocks);
      }

      return res.status(201).json({
        mensaje:
          "Carga de productos completada",
        creados: productosCreados.length,
        duplicados: duplicados.length,
        productosCreados,
        duplicados,
      });
    }

    // --------------------------------
    // CREAR UN SOLO PRODUCTO
    // --------------------------------

    const {
      tipo,
      prioridad,
      gramaje,
      anchoCm,
      altoCm,
      stockMinimo,
      activo = true,
    } = req.body;

    const anchoNormalizado = Math.min(
      Number(anchoCm),
      Number(altoCm)
    );

    const altoNormalizado = Math.max(
      Number(anchoCm),
      Number(altoCm)
    );

    const tipoNormalizado = tipo
      .trim()
      .toUpperCase();

    const existe = await Producto.findOne({
      tipo: tipoNormalizado,
      gramaje: Number(gramaje),
      anchoCm: anchoNormalizado,
      altoCm: altoNormalizado,
    });

    if (existe) {
      return res.status(400).json({
        mensaje: "Ese producto ya existe",
      });
    }

    const producto =
      await Producto.create({
        tipo: tipoNormalizado,
        prioridad,
        gramaje: Number(gramaje),
        anchoCm: anchoNormalizado,
        altoCm: altoNormalizado,
        stockMinimo:
          Number(stockMinimo) || 0,
        activo,
      });

    await Stock.create({
      productoId: producto._id,
      hojas: 0,
    });

    res.status(201).json(producto);

  } catch (error) {
    console.error(
      "Error al crear producto:",
      error
    );

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

// Obtener productos
const obtenerProductos = async (
  req,
  res
) => {
  try {
    const {
      tipo,
      prioridad,
      gramaje,
      anchoCm,
      altoCm,
    } = req.query;

    const filtros = {
      activo: true,
    };

    if (tipo) {
      filtros.tipo = tipo
        .trim()
        .toUpperCase();
    }

    if (gramaje) {
      filtros.gramaje = Number(
        gramaje
      );
    }

    if (anchoCm) {
      filtros.anchoCm = Number(
        anchoCm
      );
    }

    if (altoCm) {
      filtros.altoCm = Number(
        altoCm
      );
    }

    const productos =
      await Producto.find(filtros).sort({
        tipo: 1,
        prioridad: 1,
        gramaje: 1,
        anchoCm: 1,
        altoCm: 1,
      });

    res.json(productos);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const obtenerProductoPorId = async (
  req,
  res
) => {
  try {
    const producto =
      await Producto.findById(
        req.params.id
      );

    if (!producto) {
      return res.status(404).json({
        mensaje:
          "Producto no encontrado",
      });
    }

    res.json(producto);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const desactivarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findById(id);

    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado",
      });
    }

    producto.activo = false;

    await producto.save();

    res.json({
      mensaje: "Producto desactivado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

async function cambiarEstadoTipo(req, res) {

  try {

    const { tipo } = req.params;

    const { activo } = req.body;


    await Producto.updateMany(
      {
        tipo: tipo,
      },
      {
        $set: {
          activo,
        },
      }
    );


    res.json({
      mensaje:
        "Estado actualizado correctamente",
    });


  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje:
        "Error actualizando estado",
    });

  }

}

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      gramaje,
      anchoCm,
      altoCm,
      stockMinimo,
      prioridad,
      activo,
    } = req.body;

    const producto = await Producto.findById(id);

    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado",
      });
    }

    producto.gramaje = gramaje;
    producto.anchoCm = anchoCm;
    producto.altoCm = altoCm;
    producto.stockMinimo = stockMinimo;
    producto.prioridad = prioridad;
    producto.activo = activo;

    const actualizado =
      await producto.save();

    res.json(actualizado);

  } catch (error) {

    console.error(
      "Error al actualizar producto:",
      error
    );

    res.status(500).json({
      mensaje: error.message,
    });

  }
};

module.exports = {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  desactivarProducto,
  actualizarProducto,
  cambiarEstadoTipo,
};