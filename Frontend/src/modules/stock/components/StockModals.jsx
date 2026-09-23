import StockIngresoModal from "./modals/StockIngresoModal";
import StockIngresoMasivoModal from "./modals/StockIngresoMasivoModal";
import StockEgresoModal from "./modals/StockEgresoModal";
import StockAjusteModal from "./modals/StockAjusteModal";
import StockNuevoProductoModal from "./modals/StockNuevoProductoModal";

import { useStockModal } from "../context/StockModalContext";

export default function StockModals({
  onActualizado,
}) {

  const {

    ingreso,
    ingresoMasivo,
    egreso,
    ajuste,
    nuevoProducto,

    productoRapido,

    cerrarIngreso,
    cerrarEgreso,
    cerrarAjuste,

  } = useStockModal();

  return (
    <>

      <StockNuevoProductoModal
        isOpen={nuevoProducto.isOpen}
        onClose={nuevoProducto.onClose}
      />

      <StockIngresoModal
        productoRapido={productoRapido}
        isOpen={ingreso.isOpen}
        onClose={cerrarIngreso}
        onActualizado={onActualizado}
      />

      <StockIngresoMasivoModal
        isOpen={ingresoMasivo.isOpen}
        onClose={ingresoMasivo.onClose}
      />

      <StockEgresoModal
        productoRapido={productoRapido}
        isOpen={egreso.isOpen}
        onClose={cerrarEgreso}
      />

      <StockAjusteModal
        productoRapido={productoRapido}
        isOpen={ajuste.isOpen}
        onClose={cerrarAjuste}
      />

    </>
  );

}