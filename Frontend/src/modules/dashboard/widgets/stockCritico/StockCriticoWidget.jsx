import {
  Button,
  Spinner,
  Text,
} from "@chakra-ui/react";

import {
  FiAlertTriangle,
} from "react-icons/fi";

import WidgetCard from "../../../../shared/components/dashboard/WidgetCard";
import StockCriticoItem from "./StockCriticoItem";
import { titulo } from "../../../../shared/utils/formatoTexto";
import { useStock } from "../../../stock/context/StockContext";

export default function StockCriticoWidget({
  onIrStock,
}) {

  const { stockCritico, cargando, } = useStock();

  return (
    <WidgetCard
      title="Stock crítico"
      icon={FiAlertTriangle}
      footer={
        <Button
          size="sm"
          variant="ghost"
          colorScheme="red"
          onClick={onIrStock}
        >
          Ver stock →
        </Button>
      }
    >
      {cargando ? (
        <Spinner />
      ) : stockCritico.length === 0 ? (
        <Text color="gray.500">
          No hay productos en stock crítico.
        </Text>
      ) : (
        stockCritico.map((item) => (
          <StockCriticoItem
            key={item._id}
            nombre={`${titulo(item.tipo)} ${item.gramaje}gr ${item.anchoCm}×${item.altoCm} cm`}
            stock={item.stock}
          />
        ))
      )}
    </WidgetCard>
  );
}