import {
  Button,
  Spinner,
  Text,
} from "@chakra-ui/react";

import {
  FiInfo,
} from "react-icons/fi";

import WidgetCard from "../../../shared/components/dashboard/WidgetCard";

import StockCriticoItem from "./stockCritico/StockCriticoItem";

import { titulo } from "../../../shared/utils/formatoTexto";

import { useStock } from "../../stock/context/StockContext";


export default function StockProximoWidget({
  onIrStock,
}) {

  const {
    stockProximo,
    cargando,
  } = useStock();


  return (

    <WidgetCard

      title="Próximos al mínimo"

      icon={FiInfo}

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


      {cargando && (

        <Spinner />

      )}


      {!cargando &&
        stockProximo.length === 0 && (

          <Text color="gray.500">

            No hay productos próximos al mínimo.

          </Text>

        )}


      {!cargando &&

        stockProximo.map(
          (item) => (

            <StockCriticoItem

              key={item._id}

              nombre={`
                ${titulo(item.tipo)}
                ${item.gramaje}gr
                ${item.anchoCm}×${item.altoCm}
              `}

              stock={item.stock}

            />

          )

        )

      }


    </WidgetCard>

  );

}