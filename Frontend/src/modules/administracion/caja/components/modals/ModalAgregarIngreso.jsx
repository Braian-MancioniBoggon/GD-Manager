
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Text,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import api from "../../../../../shared/services/api";

export default function ModalAgregarIngreso({
  isOpen,
  onClose,
  caja,
  onAgregado,
  ingresoEditar,
}) {
  const [cliente, setCliente] = useState("");
  const [contable, setContable] = useState("");
  const [importe, setImporte] = useState("");
  const [cuenta, setCuenta] = useState("V");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const esEdicion = Boolean(ingresoEditar?._id);

  // ========================================
  // CARGAR O LIMPIAR FORMULARIO
  // ========================================

  useEffect(() => {
    if (!isOpen) return;

    if (ingresoEditar) {
      setCliente(ingresoEditar.cliente || "");

      // Evita que la fecha cambie por la zona horaria.
      const fecha = ingresoEditar.contable
        ? (() => {
            const d = new Date(ingresoEditar.contable);
            const anio = d.getUTCFullYear();
            const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
            const dia = String(d.getUTCDate()).padStart(2, "0");
            return `${anio}-${mes}-${dia}`;
          })()
        : "";

      setContable(fecha);
      setImporte(ingresoEditar.importe ?? "");
      setCuenta(ingresoEditar.cuenta || "V");
    } else {
      setCliente("");
      setContable("");
      setImporte("");
      setCuenta("V");
    }

    setError("");
  }, [isOpen, ingresoEditar]);

  // ========================================
  // CERRAR
  // ========================================

  const cerrar = () => {
    if (guardando) return;
    onClose();
  };

  // ========================================
  // CREAR O MODIFICAR INGRESO
  // ========================================

  const guardarIngreso = async () => {
    if (guardando) return;

    setError("");

    if (!caja?._id) {
      setError("No hay una caja disponible.");
      return;
    }

    if (!cliente.trim()) {
      setError("Ingresá el cliente.");
      return;
    }

    if (
      importe === "" ||
      !Number.isFinite(Number(importe)) ||
      Number(importe) <= 0
    ) {
      setError("Ingresá un importe válido.");
      return;
    }

    const datos = {
      cliente: cliente.trim(),
      contable: contable || null,
      importe: Number(importe),
      cuenta,
    };

    try {
      setGuardando(true);

      let respuesta;

      if (esEdicion) {
        respuesta = await api.put(
          `/caja/${caja._id}/ingresos/${ingresoEditar._id}`,
          datos
        );
      } else {
        respuesta = await api.post(
          `/caja/${caja._id}/ingresos`,
          datos
        );
      }

      if (onAgregado) {
        onAgregado(respuesta.data.caja);
      }

      onClose();
    } catch (err) {
      console.error(
        esEdicion
          ? "Error modificando ingreso:"
          : "Error agregando ingreso:",
        err
      );

      setError(
        err.response?.data?.mensaje ||
          (esEdicion
            ? "No se pudo modificar el ingreso."
            : "No se pudo agregar el ingreso.")
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={cerrar}
      isCentered
      size="md"
    >
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>
          {esEdicion ? "Editar ingreso" : "Agregar ingreso"}
        </ModalHeader>

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Cliente</FormLabel>
              <Input
                placeholder="Nombre del cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                autoFocus
              />
            </FormControl>

            <FormControl>
              <FormLabel>Fecha contable</FormLabel>
              <Input
                type="date"
                value={contable}
                onChange={(e) => setContable(e.target.value)}
              />
              <Text mt={1} fontSize="xs" color="gray.500">
                Puede completarse posteriormente.
              </Text>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Importe</FormLabel>
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="0"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Cuenta</FormLabel>
              <Select
                value={cuenta}
                onChange={(e) => setCuenta(e.target.value)}
              >
                <option value="V">V</option>
                <option value="B">B</option>
              </Select>
            </FormControl>

            {error && (
              <Text fontSize="sm" color="red.500" fontWeight="500">
                {error}
              </Text>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={cerrar}
            isDisabled={guardando}
          >
            Cancelar
          </Button>

          <Button
            colorScheme="red"
            onClick={guardarIngreso}
            isLoading={guardando}
            loadingText={esEdicion ? "Guardando..." : "Agregando..."}
          >
            {esEdicion ? "Guardar cambios" : "Agregar ingreso"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
