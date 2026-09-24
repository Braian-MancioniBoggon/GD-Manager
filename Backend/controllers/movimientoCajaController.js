const MovimientoCaja =
  require("../models/MovimientoCaja");

async function obtenerMovimientosCaja(
  req,
  res
) {
  try {

    const movimientos =
      await MovimientoCaja.find({
        cajaId:
          req.params.cajaId,
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
      "Error obteniendo historial de caja:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo obtener el historial de caja",
    });
  }
}

module.exports = {
  obtenerMovimientosCaja,
};