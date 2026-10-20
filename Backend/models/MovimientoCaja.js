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
        "ACTUALIZACION_INGRESO",
        "ELIMINACION_INGRESO",

        "CHEQUE",
        "CHEQUE_DEPOSITADO",
        "CHEQUE_ENTREGADO",
        "ACTUALIZACION_CHEQUE",
        "ELIMINACION_CHEQUE",

        "EGRESO",
        "ACTUALIZACION_EGRESO",
        "ELIMINACION_EGRESO",

        "EGRESO_BANCO",
        "ACTUALIZACION_EGRESO_BANCO",
        "ELIMINACION_EGRESO_BANCO",

        "RETIRO_ADELANTO",
        "ACTUALIZACION_RETIRO_ADELANTO",
        "ELIMINACION_RETIRO_ADELANTO",

        "FLETE",
        "ACTUALIZACION_FLETE",
        "ELIMINACION_FLETE",

        "GASTO_BANCO",
        "ACTUALIZACION_GASTO_BANCO",
        "ELIMINACION_GASTO_BANCO",

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