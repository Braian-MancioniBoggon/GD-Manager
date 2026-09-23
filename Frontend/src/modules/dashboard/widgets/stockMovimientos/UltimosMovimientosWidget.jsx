import {
  Button,
  Spinner,
  Text,
} from "@chakra-ui/react";

import {
  FiClock,
} from "react-icons/fi";

import {
  useEffect,
  useState,
} from "react";

import WidgetCard from "../../../../shared/components/dashboard/WidgetCard";
import MovimientoItem from "./MovimientoItem";
import { obtenerUltimosMovimientos, } from "../../services/dashboardService";
import { useStock } from "../../../stock/context/StockContext";

export default function
UltimosMovimientosWidget({
  onIrHistorial,
}) {

  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { stockRevision } = useStock();

  useEffect(() => {

    cargar();

  }, [stockRevision]);

  async function cargar() {

    try {

      const data =
        await obtenerUltimosMovimientos();

      setMovimientos(data);

    } finally {

      setLoading(false);

    }

  }

  return (

    <WidgetCard
      title="Últimos movimientos"
      icon={FiClock}
      footer={
        <Button
          size="sm"
          variant="ghost"
          colorScheme="red"
          onClick={onIrHistorial}
        >
          Ver historial →
        </Button>
      }
    >

      {loading && <Spinner />}

      {!loading &&
        movimientos.length === 0 && (

        <Text>

          No hay movimientos.

        </Text>

      )}

      {!loading &&
        movimientos.map(m => (

          <MovimientoItem
            key={m._id}
            movimiento={m}
          />

        ))}

    </WidgetCard>

  );

}