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

async function cerrarCajaInterna(caja, usuarioId) {
  if (!caja || caja.estado === "CERRADA") {
    return caja;
  }

  const datos = prepararCaja(caja);

  caja.cajaChica = datos.cajaChica;
  caja.estado = "CERRADA";
  caja.usuarioCierre = usuarioId;
  caja.fechaCierre = new Date();

  await caja.save();

  await MovimientoCaja.create({
    cajaId: caja._id,
    usuarioId,
    tipo: "CIERRE",
    detalle: "Cierre automático de caja por cambio de día",
    datos: {
      efectivo: datos.efectivo,
      totalCheques: datos.totalCheques,
      aCajaFuerte: caja.aCajaFuerte,
      cajaChica: caja.cajaChica,
    },
  });

  return caja;
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

        // Solo cerrar automáticamente cuando se consulta
      // la caja del día actual, sin una fecha histórica.
      if (!req.query.fecha) {
        const cajasAbiertasAnteriores = await Caja.find({
          fecha: { $lt: inicio },
          estado: "ABIERTA",
        });
      
        for (const cajaAnterior of cajasAbiertasAnteriores) {
          await cerrarCajaInterna(
            cajaAnterior,
            req.usuario._id
          );
        }
      }

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
      await Caja.find({ estado: "CERRADA", })
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

    // ========================================
    // LA FECHA SE GENERA AUTOMÁTICAMENTE
    // ========================================

    const fechaCaja =
      obtenerFechaCaja();

    const {
      inicio,
      fin,
    } = obtenerRangoDia(
      fechaCaja
    );

    // ========================================
    // VERIFICAR SI YA EXISTE CAJA
    // ========================================

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

    const cajasAbiertasAnteriores = await Caja.find({
      fecha: { $lt: inicio },
      estado: "ABIERTA",
    });

    for (const cajaAnterior of cajasAbiertasAnteriores) {
      await cerrarCajaInterna(
        cajaAnterior,
        req.usuario._id
      );
    }

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

    // ========================================
    // SI EXISTE UNA CAJA ANTERIOR
    // ========================================
    //
    // El saldo inicial es automáticamente
    // la caja chica del día anterior.
    //
    // ========================================

    if (cajaAnterior) {

      const datosAnterior =
        prepararCaja(
          cajaAnterior
        );

      const saldo =
        Number(
          datosAnterior.cajaChica || 0
        );

      const caja =
        await Caja.create({

          fecha:
            fechaCaja,

          saldoInicial:
            saldo,

          ingreso: 0,

          ingresos: [],
          cheques: [],

          egresos: [],
          egresosBanco: [],
          retirosAdelantos: [],
          fletes: [],

          gastosPorBanco: [],

          aCajaFuerte: 0,

          cajaChica:
            saldo,

          estado:
            "ABIERTA",

          usuarioApertura:
            req.usuario._id,

          fechaApertura:
            new Date(),

        });

      await MovimientoCaja.create({

        cajaId:
          caja._id,

        usuarioId:
          req.usuario._id,

        tipo:
          "APERTURA",

        detalle:
          "Apertura de caja",

        datos: {
          saldoInicial:
            saldo,
        },

      });

      const cajaCompleta =
        await Caja.findById(
          caja._id
        )
          .populate({
            path:
              "cheques.chequeId",
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

    }

    // ========================================
    // NO EXISTE CAJA ANTERIOR
    // ========================================
    //
    // NO asumimos saldo 0.
    //
    // El frontend deberá consultar al usuario
    // cuánto efectivo tiene para comenzar.
    //
    // ========================================

    return res.status(200).json({

      requiereSaldoInicial:
        true,

      mensaje:
        "No existe una caja anterior. Debe indicar el saldo inicial.",

    });

  } catch (error) {

    console.error(
      "========================================"
    );

    console.error(
      "ERROR CREANDO CAJA:"
    );

    console.error(
      error
    );

    console.error(
      "========================================"
    );

    return res.status(500).json({

      mensaje:
        "No se pudo crear la caja",

      error:
        error.message,

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
// ACTUALIZAR INGRESO
// ========================================

async function actualizarIngreso(
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
      Number.isNaN(importeNumero) ||
      importeNumero <= 0
    ) {
      return res.status(400).json({
        mensaje:
          "El importe no es válido",
      });
    }

    const datosAnteriores = {
      cliente: ingreso.cliente,
      contable: ingreso.contable,
      importe: ingreso.importe,
      cuenta: ingreso.cuenta,
    };

    ingreso.cliente =
      cliente.trim();

    ingreso.contable =
      contable || null;

    ingreso.importe =
      importeNumero;

    ingreso.cuenta =
      cuenta;

    await caja.save();

    await MovimientoCaja.create({
      cajaId:
        caja._id,

      usuarioId:
        req.usuario._id,

      tipo:
        "ACTUALIZACION_INGRESO",

      referenciaId:
        ingreso._id,

      detalle:
        "Ingreso actualizado",

      datos: {
        anterior:
          datosAnteriores,

        nuevo: {
          cliente:
            ingreso.cliente,

          contable:
            ingreso.contable,

          importe:
            ingreso.importe,

          cuenta:
            ingreso.cuenta,
        },
      },
    });

    return res.json({
      mensaje:
        "Ingreso actualizado correctamente",

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
// ELIMINAR INGRESO
// ========================================

async function eliminarIngreso(
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

    const datosIngreso = {
      cliente:
        ingreso.cliente,

      contable:
        ingreso.contable,

      importe:
        ingreso.importe,

      cuenta:
        ingreso.cuenta,
    };

    caja.ingresos.pull(
      req.params.ingresoId
    );

    await caja.save();

    await MovimientoCaja.create({
      cajaId:
        caja._id,

      usuarioId:
        req.usuario._id,

      tipo:
        "ELIMINACION_INGRESO",

      referenciaId:
        req.params.ingresoId,

      detalle:
        "Ingreso eliminado",

      datos:
        datosIngreso,
    });

    return res.json({
      mensaje:
        "Ingreso eliminado correctamente",

      caja:
        prepararCaja(caja),
    });

  } catch (error) {

    console.error(
      "Error eliminando ingreso:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo eliminar el ingreso",
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
// ACTUALIZAR EGRESO
// ========================================

async function actualizarEgreso(
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

    const egreso =
      caja[categoria].id(
        req.params.egresoId
      );

    if (!egreso) {
      return res.status(404).json({
        mensaje:
          "Egreso no encontrado",
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
      Number.isNaN(importeNumero) ||
      importeNumero <= 0
    ) {
      return res.status(400).json({
        mensaje:
          "El importe no es válido",
      });
    }

    const datosAnteriores = {
      proveedor:
        egreso.proveedor,

      detalle:
        egreso.detalle,

      importe:
        egreso.importe,
    };

    egreso.proveedor =
      proveedor.trim();

    egreso.detalle =
      detalle.trim();

    egreso.importe =
      importeNumero;

    await caja.save();

    const tipos = {
      egresos:
        "ACTUALIZACION_EGRESO",

      egresosBanco:
        "ACTUALIZACION_EGRESO_BANCO",

      retirosAdelantos:
        "ACTUALIZACION_RETIRO_ADELANTO",

      fletes:
        "ACTUALIZACION_FLETE",
    };

    await MovimientoCaja.create({
      cajaId:
        caja._id,

      usuarioId:
        req.usuario._id,

      tipo:
        tipos[categoria],

      referenciaId:
        egreso._id,

      detalle:
        "Egreso actualizado",

      datos: {
        categoria,

        anterior:
          datosAnteriores,

        nuevo: {
          proveedor:
            egreso.proveedor,

          detalle:
            egreso.detalle,

          importe:
            egreso.importe,
        },
      },
    });

    return res.json({
      mensaje:
        "Egreso actualizado correctamente",

      caja:
        prepararCaja(caja),
    });

  } catch (error) {

    console.error(
      "Error actualizando egreso:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo actualizar el egreso",
    });
  }
}


// ========================================
// ELIMINAR EGRESO
// ========================================

async function eliminarEgreso(
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

    const egreso =
      caja[categoria].id(
        req.params.egresoId
      );

    if (!egreso) {
      return res.status(404).json({
        mensaje:
          "Egreso no encontrado",
      });
    }

    const datosEgreso = {
      proveedor:
        egreso.proveedor,

      detalle:
        egreso.detalle,

      importe:
        egreso.importe,
    };

    caja[categoria].pull(
      req.params.egresoId
    );

    await caja.save();

    const tipos = {
      egresos:
        "ELIMINACION_EGRESO",

      egresosBanco:
        "ELIMINACION_EGRESO_BANCO",

      retirosAdelantos:
        "ELIMINACION_RETIRO_ADELANTO",

      fletes:
        "ELIMINACION_FLETE",
    };

    await MovimientoCaja.create({
      cajaId:
        caja._id,

      usuarioId:
        req.usuario._id,

      tipo:
        tipos[categoria],

      referenciaId:
        req.params.egresoId,

      detalle:
        "Egreso eliminado",

      datos: {
        categoria,

        ...datosEgreso,
      },
    });

    return res.json({
      mensaje:
        "Egreso eliminado correctamente",

      caja:
        prepararCaja(caja),
    });

  } catch (error) {

    console.error(
      "Error eliminando egreso:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo eliminar el egreso",
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
// ACTUALIZAR GASTO POR BANCO
// ========================================

async function actualizarGastoBanco(
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

    const gasto =
      caja.gastosPorBanco.id(
        req.params.gastoId
      );

    if (!gasto) {
      return res.status(404).json({
        mensaje:
          "Gasto por banco no encontrado",
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
      Number.isNaN(totalNumero) ||
      totalNumero <= 0
    ) {
      return res.status(400).json({
        mensaje:
          "Datos de gasto por banco inválidos",
      });
    }

    const datosAnteriores = {
      detalle:
        gasto.detalle,

      medio:
        gasto.medio,

      total:
        gasto.total,
    };

    gasto.detalle =
      detalle.trim();

    gasto.medio =
      medio;

    gasto.total =
      totalNumero;

    await caja.save();

    await MovimientoCaja.create({
      cajaId:
        caja._id,

      usuarioId:
        req.usuario._id,

      tipo:
        "ACTUALIZACION_GASTO_BANCO",

      referenciaId:
        gasto._id,

      detalle:
        "Gasto por banco actualizado",

      datos: {
        anterior:
          datosAnteriores,

        nuevo: {
          detalle:
            gasto.detalle,

          medio:
            gasto.medio,

          total:
            gasto.total,
        },
      },
    });

    return res.json({
      mensaje:
        "Gasto por banco actualizado correctamente",

      caja:
        prepararCaja(caja),
    });

  } catch (error) {

    console.error(
      "Error actualizando gasto por banco:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo actualizar el gasto por banco",
    });
  }
}


// ========================================
// ELIMINAR GASTO POR BANCO
// ========================================

async function eliminarGastoBanco(
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

    const gasto =
      caja.gastosPorBanco.id(
        req.params.gastoId
      );

    if (!gasto) {
      return res.status(404).json({
        mensaje:
          "Gasto por banco no encontrado",
      });
    }

    const datosGasto = {
      detalle:
        gasto.detalle,

      medio:
        gasto.medio,

      total:
        gasto.total,
    };

    caja.gastosPorBanco.pull(
      req.params.gastoId
    );

    await caja.save();

    await MovimientoCaja.create({
      cajaId:
        caja._id,

      usuarioId:
        req.usuario._id,

      tipo:
        "ELIMINACION_GASTO_BANCO",

      referenciaId:
        req.params.gastoId,

      detalle:
        "Gasto por banco eliminado",

      datos:
        datosGasto,
    });

    return res.json({
      mensaje:
        "Gasto por banco eliminado correctamente",

      caja:
        prepararCaja(caja),
    });

  } catch (error) {

    console.error(
      "Error eliminando gasto por banco:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo eliminar el gasto por banco",
    });
  }
}

// ========================================
// AGREGAR CHEQUE A LA CAJA
// ========================================

async function agregarCheque(
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
      numero,
      banco,
      librador,
      importe,
      fechaEmision,
      fechaVencimiento,
      observaciones,
    } = req.body;

    // ========================================
    // VALIDACIONES
    // ========================================

    if (
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

    const importeNumero =
      Number(importe);

    if (
      Number.isNaN(importeNumero) ||
      importeNumero <= 0
    ) {
      return res.status(400).json({
        mensaje:
          "El importe no es válido",
      });
    }

    // ========================================
    // CREAR CHEQUE
    // ========================================

    const cheque =
      await Cheque.create({
        numero:
          String(numero).trim(),

        banco:
          String(banco).trim(),

        librador:
          String(librador).trim(),

        importe:
          importeNumero,

        fechaEmision:
          new Date(fechaEmision),

        fechaVencimiento:
          new Date(fechaVencimiento),

        estado:
          "PENDIENTE",

        observaciones:
          observaciones || "",

        creadoPor:
          req.usuario._id,
      });

    // ========================================
    // ASOCIAR CHEQUE A LA CAJA
    // ========================================

    caja.cheques.push({
      chequeId:
        cheque._id,
    });

    await caja.save();

    // ========================================
    // REGISTRAR MOVIMIENTO
    // ========================================

    await MovimientoCaja.create({
      cajaId:
        caja._id,

      usuarioId:
        req.usuario._id,

      tipo:
        "CHEQUE",

      referenciaId:
        cheque._id,

      detalle:
        "Nuevo cheque agregado a la caja",

      datos: {
        numero:
          cheque.numero,

        banco:
          cheque.banco,

        librador:
          cheque.librador,

        importe:
          cheque.importe,

        fechaEmision:
          cheque.fechaEmision,

        fechaVencimiento:
          cheque.fechaVencimiento,
      },
    });

    // ========================================
    // OBTENER CAJA ACTUALIZADA
    // ========================================

    const cajaCompleta =
      await Caja.findById(
        caja._id
      )
        .populate({
          path:
            "cheques.chequeId",
        })
        .populate(
          "usuarioApertura",
          "nombre color avatar"
        )
        .populate(
          "usuarioCierre",
          "nombre color avatar"
        );

    return res.status(201).json({
      mensaje:
        "Cheque agregado correctamente",

      cheque,

      caja:
        prepararCaja(
          cajaCompleta
        ),
    });

  } catch (error) {

    console.error(
      "Error agregando cheque:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo agregar el cheque",
    });
  }
}

// ========================================
// ACTUALIZAR CHEQUE
// ========================================

async function actualizarCheque(
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

    const referencia =
      caja.cheques.find(
        (item) =>
          String(item.chequeId) ===
          String(req.params.chequeId)
      );

    if (!referencia) {
      return res.status(404).json({
        mensaje:
          "El cheque no pertenece a esta caja",
      });
    }

    const cheque =
      await Cheque.findById(
        req.params.chequeId
      );

    if (!cheque) {
      return res.status(404).json({
        mensaje:
          "Cheque no encontrado",
      });
    }

    if (
      cheque.estado !== "PENDIENTE"
    ) {
      return res.status(400).json({
        mensaje:
          "Solo se pueden editar cheques pendientes",
      });
    }

    const {
      numero,
      banco,
      librador,
      importe,
      fechaEmision,
      fechaVencimiento,
      observaciones,
    } = req.body;

    if (
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

    const importeNumero =
      Number(importe);

    if (
      Number.isNaN(importeNumero) ||
      importeNumero <= 0
    ) {
      return res.status(400).json({
        mensaje:
          "El importe no es válido",
      });
    }

    const datosAnteriores = {
      numero:
        cheque.numero,

      banco:
        cheque.banco,

      librador:
        cheque.librador,

      importe:
        cheque.importe,

      fechaEmision:
        cheque.fechaEmision,

      fechaVencimiento:
        cheque.fechaVencimiento,

      observaciones:
        cheque.observaciones,
    };

    cheque.numero =
      String(numero).trim();

    cheque.banco =
      String(banco).trim();

    cheque.librador =
      String(librador).trim();

    cheque.importe =
      importeNumero;

    cheque.fechaEmision =
      new Date(fechaEmision);

    cheque.fechaVencimiento =
      new Date(fechaVencimiento);

    cheque.observaciones =
      observaciones || "";

    await cheque.save();

    await MovimientoCaja.create({
      cajaId:
        caja._id,

      usuarioId:
        req.usuario._id,

      tipo:
        "ACTUALIZACION_CHEQUE",

      referenciaId:
        cheque._id,

      detalle:
        "Cheque actualizado",

      datos: {
        anterior:
          datosAnteriores,

        nuevo: {
          numero:
            cheque.numero,

          banco:
            cheque.banco,

          librador:
            cheque.librador,

          importe:
            cheque.importe,

          fechaEmision:
            cheque.fechaEmision,

          fechaVencimiento:
            cheque.fechaVencimiento,

          observaciones:
            cheque.observaciones,
        },
      },
    });

    const cajaCompleta =
      await Caja.findById(
        caja._id
      )
        .populate({
          path:
            "cheques.chequeId",
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
      mensaje:
        "Cheque actualizado correctamente",

      caja:
        prepararCaja(
          cajaCompleta
        ),
    });

  } catch (error) {

    console.error(
      "Error actualizando cheque:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo actualizar el cheque",
    });
  }
}

// ========================================
// ELIMINAR CHEQUE DE LA CAJA
// ========================================

async function eliminarCheque(
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

    const chequeId =
      req.params.chequeId;

    const referencia =
      caja.cheques.find(
        (item) =>
          String(item.chequeId) ===
          String(chequeId)
      );

    if (!referencia) {
      return res.status(404).json({
        mensaje:
          "El cheque no pertenece a esta caja",
      });
    }

    const cheque =
      await Cheque.findById(
        chequeId
      );

    if (!cheque) {
      return res.status(404).json({
        mensaje:
          "Cheque no encontrado",
      });
    }

    // ========================================
    // SOLO SE PUEDEN ELIMINAR CHEQUES PENDIENTES
    // ========================================

    if (
      cheque.estado !== "PENDIENTE"
    ) {
      return res.status(400).json({
        mensaje:
          "No se puede eliminar un cheque que ya fue depositado o entregado",
      });
    }

    // ========================================
    // GUARDAR DATOS PARA HISTORIAL
    // ========================================

    const datosCheque = {
      numero:
        cheque.numero,

      banco:
        cheque.banco,

      librador:
        cheque.librador,

      importe:
        cheque.importe,

      fechaEmision:
        cheque.fechaEmision,

      fechaVencimiento:
        cheque.fechaVencimiento,
    };

    // ========================================
    // QUITAR CHEQUE DE LA CAJA
    // ========================================

    caja.cheques =
      caja.cheques.filter(
        (item) =>
          String(item.chequeId) !==
          String(chequeId)
      );

    await caja.save();

    // ========================================
    // ELIMINAR DOCUMENTO CHEQUE
    // ========================================

    await Cheque.findByIdAndDelete(
      chequeId
    );

    // ========================================
    // REGISTRAR MOVIMIENTO
    // ========================================

    await MovimientoCaja.create({
      cajaId:
        caja._id,

      usuarioId:
        req.usuario._id,

      tipo:
        "ELIMINACION_CHEQUE",

      referenciaId:
        chequeId,

      detalle:
        "Cheque eliminado de la caja",

      datos:
        datosCheque,
    });

    // ========================================
    // OBTENER CAJA ACTUALIZADA
    // ========================================

    const cajaCompleta =
      await Caja.findById(
        caja._id
      )
        .populate({
          path:
            "cheques.chequeId",
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
      mensaje:
        "Cheque eliminado correctamente",

      caja:
        prepararCaja(
          cajaCompleta
        ),
    });

  } catch (error) {

    console.error(
      "Error eliminando cheque:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo eliminar el cheque",
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
  actualizarIngreso,
  eliminarIngreso,

  actualizarContable,

  agregarEgreso,
  actualizarEgreso,
  eliminarEgreso,

  agregarGastoBanco,
  actualizarGastoBanco,
  eliminarGastoBanco,

  agregarCheque,
  actualizarCheque,
  eliminarCheque,

  actualizarCajaFuerte,

  cerrarCaja,
};