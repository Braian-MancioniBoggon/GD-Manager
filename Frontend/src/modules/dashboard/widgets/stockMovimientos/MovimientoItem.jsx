import {
  Badge,
  Flex,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";

import {
  FiArrowDown,
  FiArrowUp,
  FiEdit,
} from "react-icons/fi";

import { titulo } from "../../../../shared/utils/formatoTexto";

export default function MovimientoItem({
  movimiento,
}) {

  const obtenerDatos = () => {

    switch (movimiento.tipo) {

      case "INGRESO":
        return {
          color: "green",
          icono: FiArrowDown,
        };

      case "EGRESO":
        return {
          color: "red",
          icono: FiArrowUp,
        };

      default:
        return {
          color: "yellow",
          icono: FiEdit,
        };

    }

  };

  const datos = obtenerDatos();

  return (

    <Flex
      justify="space-between"
      align="center"
      py={2}
      borderBottom="1px solid"
      borderColor="gray.100"
    >

      <VStack
        align="start"
        spacing={0}
      >

        <HStack>

          <Badge
            colorScheme={datos.color}
          >
            {movimiento.tipo}
          </Badge>

          <Text
            fontWeight="600"
          >
            {titulo(movimiento.productoId.tipo)}
          </Text>

        </HStack>

        <Text
          fontSize="sm"
          color="gray.500"
        >
          {movimiento.productoId.gramaje} gr •{" "}
          {movimiento.productoId.anchoCm}×
          {movimiento.productoId.altoCm} cm
        </Text>

      </VStack>

      <Text
        fontWeight="700"
        color={`${datos.color}.500`}
      >
        {movimiento.valorMostradoWidget}
      </Text>

    </Flex>

  );

}