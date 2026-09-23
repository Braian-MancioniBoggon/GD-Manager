const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Producto",
      required: true,
      unique: true,
    },

    hojas: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

//stockSchema.index({productoId: 1,});

module.exports = mongoose.model("Stock", stockSchema);