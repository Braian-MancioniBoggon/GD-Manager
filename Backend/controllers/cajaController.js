const Caja = require("../models/Caja");
const Cheque = require("../models/Cheque");
const MovimientoCaja = require("../models/MovimientoCaja");

// ========================================
// UTILIDADES
// ========================================

function obtenerFechaCaja(fecha) {
  if (!fecha) {
    return new Date();
  }

  if (
    typeof fecha === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(fecha)
  ) {
    return new Date(`${fecha}T12:00:00`);
  }

  return new Date(fecha);
}

function obtenerRangoDia(fecha) {
  const dia = obtenerFechaCaja(fecha);

  const inicio = new Date(dia);
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(dia);
  fin.setHours(23, 59, 59, 999);

  return {
    inicio,
    fin,
  };
}

function calcularTotales(caja) {
  const totalIngresosV =
    caja.ingresos
      .filter((item) => item.cuenta === "V")
      .reduce(
        (total, item) =>
          total + Number(item.importe || 0),
        0
      );

  const totalIngresosB =
    caja.ingresos
      .filter((item) => item.cuenta === "B")
      .reduce(
        (total, item) =>
          total + Number(item.importe || 0),
        0
      );

  const totalIngresos =
    totalIngresosV +
    totalIngresosB;

  const totalCheques =
    caja.cheques.reduce(
      (total, item) =>
        total + Number(
          item.chequeId?.importe || 0
        ),
      0
    );

  const totalEgresos =
    caja.egresos.reduce(
      (total, item) =>
        total + Number(item.importe || 0),
      0
    );

  const totalEgresosBanco =
    caja.egresosBanco.reduce(
      (total, item) =>
        total + Number(item.importe || 0),
      0
    );

  const totalRetirosAdelantos =
    caja.retirosAdelantos.reduce(
      (total, item) =>
        total + Number(item.importe || 0),
      0
    );

  const totalFletes =
    caja.fletes.reduce(
      (total, item) =>
        total + Number(item.importe || 0),
      0
    );

  const totalEgresosTodos =
    totalEgresos +
    totalEgresosBanco +
    totalRetirosAdelantos +
    totalFletes;

  const efectivo =
    Number(caja.saldoInicial || 0) +
    Number(caja.ingreso || 0) +
    totalIngresos -
    totalEgresosTodos;

  const cajaChica =
    efectivo -
    Number(caja.aCajaFuerte || 0);

  return {
    totalIngresosV,
    totalIngresosB,
    totalIngresos,
    totalCheques,

    totalEgresos,
    totalEgresosBanco,
    totalRetirosAdelantos,
    totalFletes,

    totalEgresosTodos,

    efectivo,

    cajaChica,
  };
}

function prepararCaja(caja) {
  const objeto =
    caja.toObject
      ? caja.toObject()
      : caja;

  return {
    ...objeto,
    ...calcularTotales(caja),
  };
}

// ========================================
// OBTENER CAJA DEL DÍA
// ========================================

async function obtenerCajaActual(
  req,
  res
) {
  try {
    const fecha =
      req.query.fecha ||
      new Date();

    const {
      inicio,
      fin,
    } = obtenerRangoDia(fecha);

    const caja =
      await Caja.findOne({
        fecha: {
          $gte: inicio,
          $lte: fin,
        },
      })
        .populate({
          path: "cheques.chequeId",
        })
        .populate(
          "usuarioApertura",
          "nombre color avatar"
        )
        .populate(
          "usuarioCierre",
          "nombre color avatar"
        );

    if (!caja) {
      return res.json({
        caja: null,
      });
    }

    return res.json({
      caja: prepararCaja(caja),
    });

  } catch (error) {

    console.error(
      "Error obteniendo caja:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo obtener la caja",
    });
  }
}

// ========================================
// OBTENER HISTORIAL DE CAJAS
// ========================================

async function obtenerCajas(
  req,
  res
) {
  try {

    const cajas =
      await Caja.find()
        .sort({
          fecha: -1,
        })
        .populate(
          "usuarioApertura",
          "nombre color avatar"
        )
        .populate(
          "usuarioCierre",
          "nombre color avatar"
        );

    return res.json({
      cajas: cajas.map(
        prepararCaja
      ),
    });

  } catch (error) {

    console.error(
      "Error obteniendo cajas:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudieron obtener las cajas",
    });
  }
}

// ========================================
// OBTENER CAJA POR ID
// ========================================

async function obtenerCajaPorId(
  req,
  res
) {
  try {

    const caja =
      await Caja.findById(
        req.params.id
      )
        .populate({
          path: "cheques.chequeId",
        })
        .populate(
          "usuarioApertura",
          "nombre color avatar"
        )
        .populate(
          "usuarioCierre",
          "nombre color avatar"
        );

    if (!caja) {
      return res.status(404).json({
        mensaje:
          "Caja no encontrada",
      });
    }

    return res.json({
      caja: prepararCaja(caja),
    });

  } catch (error) {

    console.error(
      "Error obteniendo caja:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo obtener la caja",
    });
  }
}

// ========================================
// CREAR CAJA
// ========================================

async function crearCaja(
  req,
  res
) {
  try {

    const {
      fecha,
      saldoInicial,
    } = req.body;

    const fechaCaja =
      obtenerFechaCaja(fecha);

    const {
      inicio,
      fin,
    } = obtenerRangoDia(
      fechaCaja
    );

    const cajaExistente =
      await Caja.findOne({
        fecha: {
          $gte: inicio,
          $lte: fin,
        },
      });

    if (cajaExistente) {
      return res.status(400).json({
        mensaje:
          "Ya existe una caja para esa fecha",
      });
    }

    let saldo = 0;

    // ========================================
    // BUSCAR CAJA ANTERIOR
    // ========================================

    const cajaAnterior =
      await Caja.findOne({
        fecha: {
          $lt: inicio,
        },
      })
        .sort({
          fecha: -1,
        });

    if (cajaAnterior) {

      const datosAnterior =
        prepararCaja(
          cajaAnterior
        );

      saldo =
        Number(
          datosAnterior.cajaChica || 0
        );

    } else {

      saldo =
        Number(
          saldoInicial || 0
        );
    }

    const caja =
      await Caja.create({
        fecha: fechaCaja,

        saldoInicial: saldo,

        ingreso: 0,

        ingresos: [],
        cheques: [],

        egresos: [],
        egresosBanco: [],
        retirosAdelantos: [],
        fletes: [],

        gastosPorBanco: [],

        aCajaFuerte: 0,

        cajaChica: saldo,

        estado: "ABIERTA",

        usuarioApertura:
          req.usuario._id,

        fechaApertura:
          new Date(),
      });

    await MovimientoCaja.create({
      cajaId: caja._id,
      usuarioId: req.usuario._id,
      tipo: "APERTURA",
      detalle:
        "Apertura de caja",
      datos: {
        saldoInicial: saldo,
      },
    });

    const cajaCompleta =
      await Caja.findById(
        caja._id
      )
        .populate({
          path: "cheques.chequeId",
        })
        .populate(
          "usuarioApertura",
          "nombre color avatar"
        );

    return res.status(201).json({
      mensaje:
        "Caja creada correctamente",
      caja:
        prepararCaja(
          cajaCompleta
        ),
    });

  } catch (error) {

    console.error(
      "Error creando caja:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo crear la caja",
    });
  }
}

// ========================================
// AGREGAR INGRESO MANUAL
// ========================================

async function actualizarIngresoManual(
  req,
  res
) {
  try {

    const caja =
      await Caja.findById(
        req.params.id
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
          "La caja está cerrada",
      });
    }

    const importe =
      Number(
        req.body.importe
      );

    if (
      Number.isNaN(importe) ||
      importe < 0
    ) {
      return res.status(400).json({
        mensaje:
          "El importe no es válido",
      });
    }

    caja.ingreso =
      importe;

    await caja.save();

    await MovimientoCaja.create({
      cajaId: caja._id,
      usuarioId: req.usuario._id,
      tipo: "INGRESO_MANUAL",
      detalle:
        "Actualización del ingreso manual",
      datos: {
        importe,
      },
    });

    return res.json({
      mensaje:
        "Ingreso actualizado",
      caja:
        prepararCaja(caja),
    });

  } catch (error) {

    console.error(
      "Error actualizando ingreso:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo actualizar el ingreso",
    });
  }
}

// ========================================
// AGREGAR INGRESO
// ========================================

async function agregarIngreso(
  req,
  res
) {
  try {

    const caja =
      await Caja.findById(
        req.params.id
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
          "La caja está cerrada",
      });
    }

    const {
      cliente,
      contable,
      importe,
      cuenta,
    } = req.body;

    if (
      !cliente ||
      importe === undefined ||
      !["V", "B"].includes(cuenta)
    ) {
      return res.status(400).json({
        mensaje:
          "Faltan datos del ingreso",
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

    const nuevoIngreso = {
      cliente,
      contable:
        contable || null,
      importe:
        importeNumero,
      cuenta,
    };

    caja.ingresos.push(
      nuevoIngreso
    );

    await caja.save();

    await MovimientoCaja.create({
      cajaId: caja._id,
      usuarioId: req.usuario._id,
      tipo: "INGRESO",
      referenciaId:
        nuevoIngreso._id,
      detalle:
        "Nuevo ingreso",
      datos: {
        cliente,
        contable:
          contable || null,
        importe:
          importeNumero,
        cuenta,
      },
    });

    return res.status(201).json({
      mensaje:
        "Ingreso agregado",
      caja:
        prepararCaja(caja),
    });

  } catch (error) {

    console.error(
      "Error agregando ingreso:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo agregar el ingreso",
    });
  }
}

// ========================================
// ACTUALIZAR CONTABLE
// ========================================

async function actualizarContable(
  req,
  res
) {
  try {

    const caja =
      await Caja.findById(
        req.params.id
      );

    if (!caja) {
      return res.status(404).json({
        mensaje:
          "Caja no encontrada",
      });
    }

    const ingreso =
      caja.ingresos.id(
        req.params.ingresoId
      );

    if (!ingreso) {
      return res.status(404).json({
        mensaje:
          "Ingreso no encontrado",
      });
    }

    const fechaAnterior =
      ingreso.contable;

    ingreso.contable =
      req.body.contable || null;

    await caja.save();

    await MovimientoCaja.create({
      cajaId: caja._id,
      usuarioId: req.usuario._id,
      tipo:
        "ACTUALIZACION_CONTABLE",
      referenciaId:
        ingreso._id,
      detalle:
        "Actualización de fecha contable",
      datos: {
        cliente:
          ingreso.cliente,
        fechaAnterior,
        fechaNueva:
          ingreso.contable,
      },
    });

    return res.json({
      mensaje:
        "Fecha contable actualizada",
      caja:
        prepararCaja(caja),
    });

  } catch (error) {

    console.error(
      "Error actualizando contable:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo actualizar la fecha contable",
    });
  }
}

// ========================================
// AGREGAR EGRESO A UNA CATEGORÍA
// ========================================

async function agregarEgreso(
  req,
  res
) {
  try {

    const caja =
      await Caja.findById(
        req.params.id
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
          "La caja está cerrada",
      });
    }

    const {
      proveedor,
      detalle,
      importe,
    } = req.body;

    if (
      !proveedor ||
      !detalle ||
      importe === undefined
    ) {
      return res.status(400).json({
        mensaje:
          "Faltan datos del egreso",
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

    const categoriasPermitidas = [
      "egresos",
      "egresosBanco",
      "retirosAdelantos",
      "fletes",
    ];

    const categoria =
      req.params.categoria;

    if (
      !categoriasPermitidas.includes(
        categoria
      )
    ) {
      return res.status(400).json({
        mensaje:
          "Categoría de egreso inválida",
      });
    }

    const nuevoEgreso = {
      proveedor,
      detalle,
      importe:
        importeNumero,
    };

    caja[categoria].push(
      nuevoEgreso
    );

    await caja.save();

    const tipos = {
      egresos: "EGRESO",
      egresosBanco: "EGRESO_BANCO",
      retirosAdelantos:
        "RETIRO_ADELANTO",
      fletes: "FLETE",
    };

    await MovimientoCaja.create({
      cajaId: caja._id,
      usuarioId: req.usuario._id,
      tipo: tipos[categoria],
      referenciaId:
        nuevoEgreso._id,
      detalle,
      datos: {
        proveedor,
        importe:
          importeNumero,
      },
    });

    return res.status(201).json({
      mensaje:
        "Egreso agregado",
      caja:
        prepararCaja(caja),
    });

  } catch (error) {

    console.error(
      "Error agregando egreso:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo agregar el egreso",
    });
  }
}

// ========================================
// AGREGAR GASTO POR BANCO
// ========================================

async function agregarGastoBanco(
  req,
  res
) {
  try {

    const caja =
      await Caja.findById(
        req.params.id
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
          "La caja está cerrada",
      });
    }

    const {
      detalle,
      medio,
      total,
    } = req.body;

    const totalNumero =
      Number(total);

    if (
      !detalle ||
      !medio ||
      Number.isNaN(
        totalNumero
      ) ||
      totalNumero <= 0
    ) {
      return res.status(400).json({
        mensaje:
          "Datos de gasto por banco inválidos",
      });
    }

    const nuevoGasto = {
      detalle,
      medio,
      total:
        totalNumero,
    };

    caja.gastosPorBanco.push(
      nuevoGasto
    );

    await caja.save();

    await MovimientoCaja.create({
      cajaId: caja._id,
      usuarioId: req.usuario._id,
      tipo: "GASTO_BANCO",
      referenciaId:
        nuevoGasto._id,
      detalle,
      datos: {
        medio,
        total:
          totalNumero,
      },
    });

    return res.status(201).json({
      mensaje:
        "Gasto por banco agregado",
      caja:
        prepararCaja(caja),
    });

  } catch (error) {

    console.error(
      "Error agregando gasto por banco:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo agregar el gasto por banco",
    });
  }
}

// ========================================
// ACTUALIZAR CAJA FUERTE
// ========================================

async function actualizarCajaFuerte(
  req,
  res
) {
  try {

    const caja =
      await Caja.findById(
        req.params.id
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
          "La caja está cerrada",
      });
    }

    const importe =
      Number(
        req.body.importe
      );

    if (
      Number.isNaN(importe) ||
      importe < 0
    ) {
      return res.status(400).json({
        mensaje:
          "El importe no es válido",
      });
    }

    const datos =
      prepararCaja(caja);

    if (
      importe >
      datos.efectivo
    ) {
      return res.status(400).json({
        mensaje:
          "No se puede enviar a caja fuerte más efectivo del disponible",
      });
    }

    caja.aCajaFuerte =
      importe;

    caja.cajaChica =
      datos.efectivo -
      importe;

    await caja.save();

    await MovimientoCaja.create({
      cajaId: caja._id,
      usuarioId: req.usuario._id,
      tipo: "CAJA_FUERTE",
      detalle:
        "Actualización de importe enviado a caja fuerte",
      datos: {
        importe,
        efectivo:
          datos.efectivo,
        cajaChica:
          caja.cajaChica,
      },
    });

    return res.json({
      mensaje:
        "Caja fuerte actualizada",
      caja:
        prepararCaja(caja),
    });

  } catch (error) {

    console.error(
      "Error actualizando caja fuerte:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo actualizar caja fuerte",
    });
  }
}

// ========================================
// CERRAR CAJA
// ========================================

async function cerrarCaja(
  req,
  res
) {
  try {

    const caja =
      await Caja.findById(
        req.params.id
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
          "La caja ya está cerrada",
      });
    }

    const datos =
      prepararCaja(caja);

    caja.cajaChica =
      datos.cajaChica;

    caja.estado =
      "CERRADA";

    caja.usuarioCierre =
      req.usuario._id;

    caja.fechaCierre =
      new Date();

    await caja.save();

    await MovimientoCaja.create({
      cajaId: caja._id,
      usuarioId: req.usuario._id,
      tipo: "CIERRE",
      detalle:
        "Cierre de caja",
      datos: {
        efectivo:
          datos.efectivo,
        totalCheques:
          datos.totalCheques,
        aCajaFuerte:
          caja.aCajaFuerte,
        cajaChica:
          caja.cajaChica,
      },
    });

    return res.json({
      mensaje:
        "Caja cerrada correctamente",
      caja:
        prepararCaja(caja),
    });

  } catch (error) {

    console.error(
      "Error cerrando caja:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo cerrar la caja",
    });
  }
}

module.exports = {
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
};