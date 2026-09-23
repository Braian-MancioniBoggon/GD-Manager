const mongoose = require("mongoose");

const productoSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      required: true,
      trim: true,
    },

    prioridad: {
      type: Number,
      required: true,
    },

    gramaje: {
      type: Number,
      required: true,
    },

    anchoCm: {
      type: Number,
      required: true,
    },

    altoCm: {
      type: Number,
      required: true,
    },

    stockMinimo: {
      type: Number,
      default: 0,
    },

    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

productoSchema.index(
  {
    tipo: 1,
    gramaje: 1,
    anchoCm: 1,
    altoCm: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Producto", productoSchema);