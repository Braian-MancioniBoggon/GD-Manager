import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
} from "@chakra-ui/react";

import { titulo } from "../../../../shared/utils/formatoTexto";

export default function HistorialTable({
  movimientos,
}) {
  return (
    <Table
      bg="white"
      borderRadius="lg"
      overflow="hidden"
    >
      <Thead>
        <Tr>
          <Th>Fecha</Th>
          <Th>Usuario</Th>
          <Th>Papel</Th>
          <Th>Movimiento</Th>
          <Th>Cantidad</Th>
        </Tr>
      </Thead>

      <Tbody>
        {movimientos.map(
          (movimiento) => (
            <Tr key={movimiento._id}>
              <Td>
                {new Date(
                  movimiento.createdAt
                ).toLocaleString()}
              </Td>

              <Td>
                {movimiento.usuario?.nombre}
              </Td>

              <Td>
                {titulo(
                  movimiento.productoId
                    ?.tipo
                )}
                <br />
              
                <Text
                  fontSize="sm"
                  color="gray.500"
                >
                  {movimiento.productoId
                    ?.gramaje}g
                  {" • "}
                  {movimiento.productoId
                    ?.anchoCm} x
                  {" "}
                  {movimiento.productoId
                    ?.altoCm}
                </Text>
              </Td>

              <Td>
                <Badge
                  colorScheme={
                    movimiento.tipo ===
                    "INGRESO"
                      ? "green"
                      : movimiento.tipo ===
                        "EGRESO"
                      ? "red"
                      : "yellow"
                  }
                >
                  {movimiento.tipo}
                </Badge>
              </Td>

              <Td>
                {movimiento.tipo === "AJUSTE" ? (
                  <Text>
                    {movimiento.stockAnterior}
                    {" → "}
                    {movimiento.stockNuevo}
                  </Text>
                ) : (
                  <Text>
                    {movimiento.cantidad}
                  </Text>
                )}
              </Td>
            </Tr>
          )
        )}
      </Tbody>
    </Table>
  );
}