const MovimientoCheque =
  require("../models/MovimientoCheque");

async function obtenerMovimientosCheque(
  req,
  res
) {
  try {

    const movimientos =
      await MovimientoCheque.find({
        chequeId:
          req.params.chequeId,
      })
        .populate(
          "usuarioId",
          "nombre color avatar"
        )
        .sort({
          createdAt: 1,
        });

    return res.json({
      movimientos,
    });

  } catch (error) {

    console.error(
      "Error obteniendo historial de cheque:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo obtener el historial del cheque",
    });
  }
}

module.exports = {
  obtenerMovimientosCheque,
};