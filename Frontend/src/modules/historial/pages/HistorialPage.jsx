import {
  Box,
  Heading,
} from "@chakra-ui/react";

import {
  useEffect,
  useState,
} from "react";

import HistorialTable from "../components/tables/HistorialTable";

import { obtenerMovimientos } from "../../stock/services/movimientoService";

export default function HistorialPage() {

  const [movimientos, setMovimientos] =
    useState([]);

  const cargarMovimientos =
    async () => {
      try {
        const data =
          await obtenerMovimientos();

        setMovimientos(data);
      } catch (error) {
        console.error(error);
      }
    };

  useEffect(() => {
    cargarMovimientos();
  }, []);

  return (
    <Box flex={1} p={6}>
      <Heading mb={6}>
        Historial de Movimientos
      </Heading>

      <HistorialTable
        movimientos={movimientos}
      />
    </Box>
  );
}