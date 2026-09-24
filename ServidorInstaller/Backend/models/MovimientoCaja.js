const mongoose = require("mongoose");

const movimientoCajaSchema = new mongoose.Schema(
  {
    cajaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caja",
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
        "APERTURA",

        "INGRESO_MANUAL",
        "INGRESO",
        "CHEQUE",

        "EGRESO",
        "EGRESO_BANCO",
        "RETIRO_ADELANTO",
        "FLETE",

        "GASTO_BANCO",

        "CAJA_FUERTE",

        "ACTUALIZACION_CONTABLE",

        "CIERRE",
      ],
      required: true,
    },

    detalle: {
      type: String,
      default: "",
    },

    referenciaId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    datos: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

movimientoCajaSchema.index({
  cajaId: 1,
  createdAt: 1,
});

movimientoCajaSchema.index({
  usuarioId: 1,
});

module.exports = mongoose.model(
  "MovimientoCaja",
  movimientoCajaSchema
);