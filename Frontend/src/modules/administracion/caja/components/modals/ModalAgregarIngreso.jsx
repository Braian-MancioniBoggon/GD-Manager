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

import {
  useEffect,
  useState,
} from "react";

import api from "../../../../../shared/services/api";

export default function ModalAgregarIngreso({
  isOpen,
  onClose,
  caja,
  onAgregado,
}) {

  const [
    cliente,
    setCliente,
  ] = useState("");

  const [
    contable,
    setContable,
  ] = useState("");

  const [
    importe,
    setImporte,
  ] = useState("");

  const [
    cuenta,
    setCuenta,
  ] = useState("V");

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  // ========================================
  // LIMPIAR FORMULARIO
  // ========================================

  useEffect(() => {

    if (isOpen) {

      setCliente("");
      setContable("");
      setImporte("");
      setCuenta("V");
      setError("");

    }

  }, [
    isOpen,
  ]);


  // ========================================
  // CERRAR
  // ========================================

  const cerrar = () => {

    if (guardando) {
      return;
    }

    onClose();

  };


  // ========================================
  // AGREGAR INGRESO
  // ========================================

  const agregarIngreso = async () => {

    setError("");

    if (!caja?._id) {

      setError(
        "No hay una caja disponible."
      );

      return;

    }

    if (!cliente.trim()) {

      setError(
        "Ingresá el cliente."
      );

      return;

    }

    if (
      importe === "" ||
      Number(importe) <= 0
    ) {

      setError(
        "Ingresá un importe válido."
      );

      return;

    }

    try {

      setGuardando(true);

      const respuesta =
        await api.post(
          `/caja/${caja._id}/ingresos`,
          {
            cliente:
              cliente.trim(),

            contable:
              contable || null,

            importe:
              Number(importe),

            cuenta,
          }
        );

      if (onAgregado) {

        onAgregado(
          respuesta.data.caja
        );

      }

      onClose();

    } catch (error) {

      console.error(
        "Error agregando ingreso:",
        error
      );

      setError(
        error.response?.data?.mensaje ||
        "No se pudo agregar el ingreso."
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

        {/* ================================== */}
        {/* CABECERA */}
        {/* ================================== */}

        <ModalHeader>
          Agregar ingreso
        </ModalHeader>


        {/* ================================== */}
        {/* CONTENIDO */}
        {/* ================================== */}

        <ModalBody>

          <VStack
            spacing={4}
            align="stretch"
          >

            {/* CLIENTE */}

            <FormControl isRequired>

              <FormLabel>
                Cliente
              </FormLabel>

              <Input
                placeholder="Nombre del cliente"
                value={cliente}
                onChange={(e) =>
                  setCliente(
                    e.target.value
                  )
                }
                autoFocus
              />

            </FormControl>


            {/* CONTABLE */}

            <FormControl>

              <FormLabel>
                Fecha contable
              </FormLabel>

              <Input
                type="date"
                value={contable}
                onChange={(e) =>
                  setContable(
                    e.target.value
                  )
                }
              />

              <Text
                mt={1}
                fontSize="xs"
                color="gray.500"
              >
                Puede completarse posteriormente.
              </Text>

            </FormControl>


            {/* IMPORTE */}

            <FormControl isRequired>

              <FormLabel>
                Importe
              </FormLabel>

              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="0"
                value={importe}
                onChange={(e) =>
                  setImporte(
                    e.target.value
                  )
                }
              />

            </FormControl>


            {/* CUENTA */}

            <FormControl isRequired>

              <FormLabel>
                Cuenta
              </FormLabel>

              <Select
                value={cuenta}
                onChange={(e) =>
                  setCuenta(
                    e.target.value
                  )
                }
              >

                <option value="V">
                  V
                </option>

                <option value="B">
                  B
                </option>

              </Select>

            </FormControl>


            {/* ERROR */}

            {error && (

              <Text
                fontSize="sm"
                color="red.500"
                fontWeight="500"
              >
                {error}
              </Text>

            )}

          </VStack>

        </ModalBody>


        {/* ================================== */}
        {/* FOOTER */}
        {/* ================================== */}

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
            colorScheme="blue"
            onClick={agregarIngreso}
            isLoading={guardando}
            loadingText="Guardando"
          >
            Agregar ingreso
          </Button>

        </ModalFooter>

      </ModalContent>

    </Modal>
  );
}