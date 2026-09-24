const mongoose = require("mongoose");

const movimientoChequeSchema = new mongoose.Schema(
  {
    chequeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cheque",
      required: true,
    },

    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },

    tipo: {
      type: String,
      enum: [
        "CREADO",
        "EDITADO",
        "DEPOSITADO",
        "ENTREGADO",
      ],
      required: true,
    },

    estadoAnterior: {
      type: String,
      default: null,
    },

    estadoNuevo: {
      type: String,
      default: null,
    },

    detalle: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

movimientoChequeSchema.index({
  chequeId: 1,
  createdAt: -1,
});

movimientoChequeSchema.index({
  usuarioId: 1,
});

movimientoChequeSchema.index({
  createdAt: -1,
});

module.exports = mongoose.model(
  "MovimientoCheque",
  movimientoChequeSchema
);