const mongoose = require("mongoose");

// ========================================
// INGRESO
// ========================================

const ingresoSchema = new mongoose.Schema(
  {
    cliente: {
      type: String,
      required: true,
      trim: true,
    },

    contable: {
      type: Date,
      default: null,
    },

    importe: {
      type: Number,
      required: true,
      min: 0,
    },

    cuenta: {
      type: String,
      enum: ["V", "B"],
      required: true,
    },
  },
  {
    _id: true,
  }
);

// ========================================
// CHEQUE DENTRO DE CAJA
// ========================================

const chequeCajaSchema = new mongoose.Schema(
  {
    chequeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cheque",
      required: true,
    },
  },
  {
    _id: true,
  }
);

// ========================================
// EGRESO
// ========================================

const egresoSchema = new mongoose.Schema(
  {
    proveedor: {
      type: String,
      required: true,
      trim: true,
    },

    detalle: {
      type: String,
      required: true,
      trim: true,
    },

    importe: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
  }
);

// ========================================
// GASTOS POR BANCO
// ========================================

const gastoBancoSchema = new mongoose.Schema(
  {
    detalle: {
      type: String,
      required: true,
      trim: true,
    },

    medio: {
      type: String,
      required: true,
      trim: true,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
  }
);

// ========================================
// CAJA
// ========================================

const cajaSchema = new mongoose.Schema(
  {
    fecha: {
      type: Date,
      required: true,
    },

    saldoInicial: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    ingreso: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    ingresos: {
      type: [ingresoSchema],
      default: [],
    },

    cheques: {
      type: [chequeCajaSchema],
      default: [],
    },

    egresos: {
      type: [egresoSchema],
      default: [],
    },

    egresosBanco: {
      type: [egresoSchema],
      default: [],
    },

    retirosAdelantos: {
      type: [egresoSchema],
      default: [],
    },

    fletes: {
      type: [egresoSchema],
      default: [],
    },

    gastosPorBanco: {
      type: [gastoBancoSchema],
      default: [],
    },

    aCajaFuerte: {
      type: Number,
      min: 0,
      default: 0,
    },

    cajaChica: {
      type: Number,
      min: 0,
      default: 0,
    },

    estado: {
      type: String,
      enum: ["ABIERTA", "CERRADA"],
      default: "ABIERTA",
      required: true,
    },

    usuarioApertura: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },

    usuarioCierre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      default: null,
    },

    fechaApertura: {
      type: Date,
      default: Date.now,
    },

    fechaCierre: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ========================================
// ÍNDICES
// ========================================

cajaSchema.index({
  fecha: 1,
});

cajaSchema.index({
  estado: 1,
});

cajaSchema.index({
  fecha: -1,
});

module.exports = mongoose.model(
  "Caja",
  cajaSchema
);