const mongoose = require("mongoose");

const chequeSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      required: true,
      trim: true,
    },

    banco: {
      type: String,
      required: true,
      trim: true,
    },

    librador: {
      type: String,
      required: true,
      trim: true,
    },

    importe: {
      type: Number,
      required: true,
      min: 0,
    },

    fechaEmision: {
      type: Date,
      required: true,
    },

    fechaVencimiento: {
      type: Date,
      required: true,
    },

    estado: {
      type: String,
      enum: [
        "PENDIENTE",
        "DEPOSITADO",
        "ENTREGADO",
      ],
      default: "PENDIENTE",
      required: true,
    },

    fechaDeposito: {
      type: Date,
      default: null,
    },

    fechaEntrega: {
      type: Date,
      default: null,
    },

    observaciones: {
      type: String,
      default: "",
      trim: true,
    },

    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ========================================
// ÍNDICES
// ========================================

chequeSchema.index({
  estado: 1,
});

chequeSchema.index({
  fechaVencimiento: 1,
});

chequeSchema.index({
  estado: 1,
  fechaVencimiento: 1,
});

chequeSchema.index({
  creadoPor: 1,
});

module.exports = mongoose.model(
  "Cheque",
  chequeSchema
);