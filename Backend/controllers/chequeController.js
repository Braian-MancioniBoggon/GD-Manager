const Cheque = require("../models/Cheque");
const Caja = require("../models/Caja");
const MovimientoCheque = require("../models/MovimientoCheque");
const MovimientoCaja = require("../models/MovimientoCaja");

// ========================================
// CREAR CHEQUE
// ========================================

async function crearCheque(
  req,
  res
) {
  try {

    const {
      cajaId,
      numero,
      banco,
      librador,
      importe,
      fechaEmision,
      fechaVencimiento,
      observaciones,
    } = req.body;

    if (
      !cajaId ||
      !numero ||
      !banco ||
      !librador ||
      importe === undefined ||
      !fechaEmision ||
      !fechaVencimiento
    ) {
      return res.status(400).json({
        mensaje:
          "Faltan datos del cheque",
      });
    }

    const caja =
      await Caja.findById(
        cajaId
      );

    if (!caja) {
      return res.status(404).json({
        mensaje:
          "Caja no encontrada",
      });
    }

    if (caja.estado === "CERRADA") {
      return res.status(400).json({
        mensaje:
          "No se pueden agregar cheques a una caja cerrada",
      });
    }

    const importeNumero =
      Number(importe);

    if (
      Number.isNaN(
        importeNumero
      ) ||
      importeNumero <= 0
    ) {
      return res.status(400).json({
        mensaje:
          "El importe no es válido",
      });
    }

    const cheque =
      await Cheque.create({
        numero,
        banco,
        librador,
        importe:
          importeNumero,

        fechaEmision,
        fechaVencimiento,

        estado: "PENDIENTE",

        fechaDeposito: null,
        fechaEntrega: null,

        observaciones:
          observaciones || "",

        creadoPor:
          req.usuario._id,
      });

    caja.cheques.push({
      chequeId:
        cheque._id,
    });

    await caja.save();

    await MovimientoCheque.create({
      chequeId:
        cheque._id,

      usuarioId:
        req.usuario._id,

      tipo: "CREADO",

      estadoAnterior: null,
      estadoNuevo: "PENDIENTE",

      detalle:
        "Cheque creado",
    });

    await MovimientoCaja.create({
      cajaId:
        caja._id,

      usuarioId:
        req.usuario._id,

      tipo: "CHEQUE",

      referenciaId:
        cheque._id,

      detalle:
        `Ingreso de cheque #${numero}`,

      datos: {
        numero,
        banco,
        librador,
        importe:
          importeNumero,
      },
    });

    return res.status(201).json({
      mensaje:
        "Cheque creado correctamente",
      cheque,
    });

  } catch (error) {

    console.error(
      "Error creando cheque:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo crear el cheque",
    });
  }
}

// ========================================
// OBTENER CHEQUES
// ========================================

async function obtenerCheques(
  req,
  res
) {
  try {

    const {
      estado,
    } = req.query;

    const filtro = {};

    if (
      estado &&
      [
        "PENDIENTE",
        "DEPOSITADO",
        "ENTREGADO",
      ].includes(estado)
    ) {
      filtro.estado =
        estado;
    }

    const cheques =
      await Cheque.find(filtro)
        .populate(
          "creadoPor",
          "nombre color avatar"
        )
        .sort({
          fechaVencimiento: 1,
        });

    return res.json({
      cheques,
    });

  } catch (error) {

    console.error(
      "Error obteniendo cheques:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudieron obtener los cheques",
    });
  }
}

// ========================================
// OBTENER CHEQUE
// ========================================

async function obtenerCheque(
  req,
  res
) {
  try {

    const cheque =
      await Cheque.findById(
        req.params.id
      ).populate(
        "creadoPor",
        "nombre color avatar"
      );

    if (!cheque) {
      return res.status(404).json({
        mensaje:
          "Cheque no encontrado",
      });
    }

    return res.json({
      cheque,
    });

  } catch (error) {

    console.error(
      "Error obteniendo cheque:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo obtener el cheque",
    });
  }
}

// ========================================
// EDITAR CHEQUE
// ========================================

async function editarCheque(
  req,
  res
) {
  try {

    const cheque =
      await Cheque.findById(
        req.params.id
      );

    if (!cheque) {
      return res.status(404).json({
        mensaje:
          "Cheque no encontrado",
      });
    }

    const camposPermitidos = [
      "numero",
      "banco",
      "librador",
      "importe",
      "fechaEmision",
      "fechaVencimiento",
      "observaciones",
    ];

    const cambios = {};

    camposPermitidos.forEach(
      (campo) => {

        if (
          req.body[campo] !==
          undefined
        ) {
          cambios[campo] =
            req.body[campo];
        }

      }
    );

    if (
      cambios.importe !==
      undefined
    ) {

      cambios.importe =
        Number(
          cambios.importe
        );

      if (
        Number.isNaN(
          cambios.importe
        ) ||
        cambios.importe <= 0
      ) {
        return res.status(400).json({
          mensaje:
            "El importe no es válido",
        });
      }
    }

    Object.assign(
      cheque,
      cambios
    );

    await cheque.save();

    await MovimientoCheque.create({
      chequeId:
        cheque._id,

      usuarioId:
        req.usuario._id,

      tipo: "EDITADO",

      estadoAnterior:
        cheque.estado,

      estadoNuevo:
        cheque.estado,

      detalle:
        "Cheque editado",

    });

    return res.json({
      mensaje:
        "Cheque actualizado",
      cheque,
    });

  } catch (error) {

    console.error(
      "Error editando cheque:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo editar el cheque",
    });
  }
}

// ========================================
// DEPOSITAR CHEQUE
// ========================================

async function depositarCheque(
  req,
  res
) {
  try {

    const cheque =
      await Cheque.findById(
        req.params.id
      );

    if (!cheque) {
      return res.status(404).json({
        mensaje:
          "Cheque no encontrado",
      });
    }

    if (
      cheque.estado !==
      "PENDIENTE"
    ) {
      return res.status(400).json({
        mensaje:
          "El cheque no está pendiente",
      });
    }

    // ========================================
    // BUSCAR LA CAJA QUE CONTIENE EL CHEQUE
    // ========================================

    const caja =
      await Caja.findOne({
        "cheques.chequeId":
          cheque._id,
      });

    if (!caja) {
      return res.status(404).json({
        mensaje:
          "No se encontró la caja asociada al cheque",
      });
    }

    const estadoAnterior =
      cheque.estado;

    // ========================================
    // ACTUALIZAR CHEQUE
    // ========================================

    cheque.estado =
      "DEPOSITADO";

    cheque.fechaDeposito =
      new Date();

    await cheque.save();

    // ========================================
    // HISTORIAL DEL CHEQUE
    // ========================================

    await MovimientoCheque.create({
      chequeId:
        cheque._id,

      usuarioId:
        req.usuario._id,

      tipo:
        "DEPOSITADO",

      estadoAnterior,

      estadoNuevo:
        "DEPOSITADO",

      detalle:
        "Cheque depositado",
    });

    // ========================================
    // HISTORIAL DE LA CAJA
    // ========================================

    await MovimientoCaja.create({
      cajaId:
        caja._id,

      usuarioId:
        req.usuario._id,

      tipo:
        "CHEQUE_DEPOSITADO",

      referenciaId:
        cheque._id,

      detalle:
        `Cheque depositado #${cheque.numero}`,

      datos: {
        numero:
          cheque.numero,

        banco:
          cheque.banco,

        librador:
          cheque.librador,

        importe:
          cheque.importe,

        fechaVencimiento:
          cheque.fechaVencimiento,

        fechaDeposito:
          cheque.fechaDeposito,
      },
    });

    return res.json({
      mensaje:
        "Cheque marcado como depositado",
      cheque,
    });

  } catch (error) {

    console.error(
      "Error depositando cheque:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo depositar el cheque",
    });
  }
}

// ========================================
// ENTREGAR CHEQUE
// ========================================

async function entregarCheque(
  req,
  res
) {
  try {

    const cheque =
      await Cheque.findById(
        req.params.id
      );

    if (!cheque) {
      return res.status(404).json({
        mensaje:
          "Cheque no encontrado",
      });
    }

    if (
      cheque.estado !==
      "PENDIENTE"
    ) {
      return res.status(400).json({
        mensaje:
          "El cheque no está pendiente",
      });
    }

    // ========================================
    // BUSCAR LA CAJA QUE CONTIENE EL CHEQUE
    // ========================================

    const caja =
      await Caja.findOne({
        "cheques.chequeId":
          cheque._id,
      });

    if (!caja) {
      return res.status(404).json({
        mensaje:
          "No se encontró la caja asociada al cheque",
      });
    }

    const estadoAnterior =
      cheque.estado;

    // ========================================
    // ACTUALIZAR CHEQUE
    // ========================================

    cheque.estado =
      "ENTREGADO";

    cheque.fechaEntrega =
      new Date();

    await cheque.save();

    // ========================================
    // HISTORIAL DEL CHEQUE
    // ========================================

    await MovimientoCheque.create({
      chequeId:
        cheque._id,

      usuarioId:
        req.usuario._id,

      tipo:
        "ENTREGADO",

      estadoAnterior,

      estadoNuevo:
        "ENTREGADO",

      detalle:
        "Cheque entregado",
    });

    // ========================================
    // HISTORIAL DE LA CAJA
    // ========================================

    await MovimientoCaja.create({
      cajaId:
        caja._id,

      usuarioId:
        req.usuario._id,

      tipo:
        "CHEQUE_ENTREGADO",

      referenciaId:
        cheque._id,

      detalle:
        `Cheque entregado #${cheque.numero}`,

      datos: {
        numero:
          cheque.numero,

        banco:
          cheque.banco,

        librador:
          cheque.librador,

        importe:
          cheque.importe,

        fechaVencimiento:
          cheque.fechaVencimiento,

        fechaEntrega:
          cheque.fechaEntrega,
      },
    });

    return res.json({
      mensaje:
        "Cheque marcado como entregado",
      cheque,
    });

  } catch (error) {

    console.error(
      "Error entregando cheque:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo entregar el cheque",
    });
  }
}

module.exports = {
  crearCheque,
  obtenerCheques,
  obtenerCheque,
  editarCheque,
  depositarCheque,
  entregarCheque,
};