const mongoose = require("mongoose");

const movimientoSchema = new mongoose.Schema(
  {
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Producto",
      required: true,
    },

    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },

    tipo: {
      type: String,
      enum: ["INGRESO", "EGRESO", "AJUSTE"],
      required: true,
    },

    cantidad: {
      type: Number,
      required: true,
    },

    valorMostradoWidget: {
        type: String,
        default: "",
    },

    observacion: {
      type: String,
      default: "",
    },

    stockAnterior: {
      type: Number,
    },

    stockNuevo: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

movimientoSchema.index({
  productoId: 1,
});

movimientoSchema.index({
  tipo: 1,
});

movimientoSchema.index({
  createdAt: -1,
});

module.exports = mongoose.model(
  "Movimiento",
  movimientoSchema
);