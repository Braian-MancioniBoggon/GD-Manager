
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

    // CHEQUE = cheque físico; ECHEQ = cheque electrónico.
    tipo: {
      type: String,
      enum: ["CHEQUE", "ECHEQ"],
      default: "CHEQUE",
      required: true,
    },

    // Los E-cheq no tienen cuenta B/V.
    cuenta: {
      type: String,
      enum: ["B", "V", null],
      default: null,
    },

    estado: {
      type: String,
      enum: ["PENDIENTE", "DEPOSITADO", "ENTREGADO"],
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

    entregadoA: {
      type: String,
      default: "",
      trim: true,
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

chequeSchema.index({ estado: 1 });
chequeSchema.index({ fechaVencimiento: 1 });
chequeSchema.index({ estado: 1, fechaVencimiento: 1 });
chequeSchema.index({ creadoPor: 1 });
chequeSchema.index({ tipo: 1, cuenta: 1 });

module.exports = mongoose.model("Cheque", chequeSchema);