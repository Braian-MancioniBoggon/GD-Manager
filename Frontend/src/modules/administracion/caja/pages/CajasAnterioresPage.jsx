import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  useToast,
} from "@chakra-ui/react";
import { FiEye, FiRefreshCw } from "react-icons/fi";
import api from "../../../../shared/services/api";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function fechaLocal(fecha) {
  if (!fecha) return "—";
  const valor = typeof fecha === "string" ? fecha.slice(0, 10) : new Date(fecha).toISOString().slice(0, 10);
  const [anio, mes, dia] = valor.split("-");
  return `${dia}/${mes}/${anio}`;
}

function moneda(valor) {
  return Number(valor || 0).toLocaleString("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0,
  });
}

export default function CajasAnterioresPage({ onSeleccionarCaja }) {
  const hoy = new Date();
  const [anio, setAnio] = useState(String(hoy.getFullYear()));
  const [mes, setMes] = useState(String(hoy.getMonth() + 1));
  const [cajas, setCajas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const toast = useToast();

  const cargarCajas = async () => {
    try {
      setCargando(true);
      setError("");
      const respuesta = await api.get("/caja");
      setCajas(respuesta.data.cajas || []);
    } catch (e) {
      console.error("Error cargando cajas anteriores:", e);
      setError(e.response?.data?.mensaje || "No se pudieron cargar las cajas anteriores.");
      toast({ title: "Error al cargar las cajas", status: "error", duration: 4000, isClosable: true });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarCajas(); }, []);

  // Solo se consideran las cajas cerradas para construir el historial.
  const cajasCerradas = useMemo(
    () => cajas.filter((caja) => String(caja.estado || "").toUpperCase() === "CERRADA"),
    [cajas]
  );

  const anios = useMemo(() => [...new Set(
    cajasCerradas.filter((caja) => caja.fecha).map((caja) => Number(String(caja.fecha).slice(0, 4)))
  )].sort((a, b) => b - a), [cajasCerradas]);

  const mesesDisponibles = useMemo(() => [...new Set(
    cajasCerradas
      .filter((caja) => caja.fecha && Number(String(caja.fecha).slice(0, 4)) === Number(anio))
      .map((caja) => Number(String(caja.fecha).slice(5, 7)))
  )].sort((a, b) => a - b), [cajasCerradas, anio]);

  // Mantiene el mes/año actual si hay cajas cerradas; si no, elige el registro más reciente.
  useEffect(() => {
    if (!anios.length) return;
    if (!anios.includes(Number(anio))) {
      setAnio(String(anios.includes(hoy.getFullYear()) ? hoy.getFullYear() : anios[0]));
    }
  }, [anios]);

  useEffect(() => {
    if (!mesesDisponibles.length) return;
    if (!mesesDisponibles.includes(Number(mes))) {
      const mesActual = Number(anio) === hoy.getFullYear() ? hoy.getMonth() + 1 : null;
      setMes(String(mesActual && mesesDisponibles.includes(mesActual) ? mesActual : mesesDisponibles[mesesDisponibles.length - 1]));
    }
  }, [mesesDisponibles, anio]);

  const cajasDelMes = useMemo(() => cajasCerradas.filter((caja) => {
    if (!caja.fecha) return false;
    const valor = String(caja.fecha).slice(0, 10);
    const [anioCaja, mesCaja] = valor.split("-");
    return Number(anioCaja) === Number(anio) && Number(mesCaja) === Number(mes);
  }).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))), [cajasCerradas, anio, mes]);

  return (
    <Flex direction="column" minH="100vh" bg="gray.100">
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200" px={8} py={6}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
          <Box>
            <Text fontSize="2xl" fontWeight="700" color="gray.800">Cajas anteriores</Text>
            <Text mt={1} color="gray.500" fontSize="sm">Consultá las cajas guardadas por año y mes.</Text>
          </Box>
          <Button leftIcon={<FiRefreshCw />} variant="outline" onClick={cargarCajas} isLoading={cargando}>Actualizar</Button>
        </Flex>
      </Box>

      <Box p={{ base: 4, md: 8 }}>
        <Flex bg="white" p={5} borderRadius="xl" border="1px solid" borderColor="gray.200" gap={4} wrap="wrap" mb={6}>
          <Box minW="180px" flex="1">
            <Text fontSize="sm" fontWeight="600" mb={2}>Año</Text>
            <Select value={anio} onChange={(e) => setAnio(e.target.value)} isDisabled={!anios.length}>
              {anios.map((valor) => <option key={valor} value={valor}>{valor}</option>)}
            </Select>
          </Box>
          <Box minW="180px" flex="1">
            <Text fontSize="sm" fontWeight="600" mb={2}>Mes</Text>
            <Select value={mes} onChange={(e) => setMes(e.target.value)} isDisabled={!mesesDisponibles.length}>
              {mesesDisponibles.map((numero) => <option key={numero} value={String(numero)}>{MESES[numero - 1]}</option>)}
            </Select>
          </Box>
        </Flex>

        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" overflowX="auto">
          {cargando ? (
            <Center p={12}><Spinner size="lg" /></Center>
          ) : error ? (
            <Center p={10}><Text color="red.500">{error}</Text></Center>
          ) : cajasDelMes.length === 0 ? (
            <Center p={12}><Text color="gray.500">{cajasCerradas.length ? `No hay cajas cerradas para ${MESES[Number(mes) - 1] || ""} de ${anio}.` : "Todavía no hay cajas cerradas en el historial."}</Text></Center>
          ) : (
            <Table variant="simple">
              <Thead bg="gray.50"><Tr><Th>Fecha</Th><Th>Estado</Th><Th isNumeric>Saldo inicial</Th><Th isNumeric>Ingresos</Th><Th isNumeric>Caja chica</Th><Th textAlign="right">Acción</Th></Tr></Thead>
              <Tbody>
                {cajasDelMes.map((caja) => (
                  <Tr key={caja._id}>
                    <Td fontWeight="600">{fechaLocal(caja.fecha)}</Td>
                    <Td><Badge colorScheme="gray">Cerrada</Badge></Td>
                    <Td isNumeric>{moneda(caja.saldoInicial)}</Td>
                    <Td isNumeric>{moneda(caja.totalIngresos ?? caja.ingreso)}</Td>
                    <Td isNumeric>{moneda(caja.cajaChica)}</Td>
                    <Td textAlign="right"><Button size="sm" leftIcon={<FiEye />} colorScheme="red" variant="outline" onClick={() => onSeleccionarCaja(caja._id)}>Ver caja</Button></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </Box>
    </Flex>
  );
}
