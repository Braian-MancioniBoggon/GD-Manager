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
  Text,
  VStack,
} from "@chakra-ui/react";

import {
  useEffect,
  useState,
} from "react";

import api from "../../../../../shared/services/api";

export default function ModalAgregarGastoBanco({
  isOpen,
  onClose,
  caja,
  onAgregado,
}) {

  const [
    detalle,
    setDetalle,
  ] = useState("");

  const [
    medio,
    setMedio,
  ] = useState("");

  const [
    total,
    setTotal,
  ] = useState("");

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  // ========================================
  // REINICIAR
  // ========================================

  useEffect(() => {

    if (!isOpen) {
      return;
    }

    setDetalle("");
    setMedio("");
    setTotal("");
    setError("");

  }, [isOpen]);


  // ========================================
  // CERRAR
  // ========================================

  const cerrar = () => {

    if (guardando) {
      return;
    }

    setDetalle("");
    setMedio("");
    setTotal("");
    setError("");

    onClose();

  };


  // ========================================
  // GUARDAR
  // ========================================

  const guardar = async () => {

    setError("");

    const detalleLimpio =
      detalle.trim();

    const totalNumero =
      Number(total);

    if (!detalleLimpio) {

      setError(
        "Ingresá el detalle del gasto."
      );

      return;

    }

    if (!medio) {

      setError(
        "Seleccioná el medio."
      );

      return;

    }

    if (
      !total ||
      Number.isNaN(totalNumero) ||
      totalNumero <= 0
    ) {

      setError(
        "Ingresá un importe válido."
      );

      return;

    }

    if (!caja?._id) {

      setError(
        "No hay una caja abierta."
      );

      return;

    }

    try {

      setGuardando(true);

      const respuesta =
        await api.post(
          `/caja/${caja._id}/gastos-banco`,
          {
            detalle:
              detalleLimpio,

            medio,

            total:
              totalNumero,
          }
        );

      if (onAgregado) {

        onAgregado(
          respuesta.data.caja
        );

      }

      cerrar();

    } catch (error) {

      console.error(
        "Error agregando gasto por banco:",
        error
      );

      setError(
        error.response?.data?.mensaje ||
        "No se pudo agregar el gasto."
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
    >

      <ModalOverlay />

      <ModalContent>

        <ModalHeader>
          Agregar gasto por banco
        </ModalHeader>


        <ModalBody>

          <Text
            mb={5}
            fontSize="sm"
            color="gray.500"
          >
            Registrá un gasto realizado mediante
            una cuenta bancaria.
          </Text>


          <VStack
            spacing={4}
            align="stretch"
          >

            {/* DETALLE */}

            <FormControl>

              <FormLabel
                fontSize="sm"
                fontWeight="600"
              >
                Detalle
              </FormLabel>

              <Input
                value={detalle}
                onChange={(e) =>
                  setDetalle(
                    e.target.value
                  )
                }
                placeholder="Detalle del gasto"
                autoFocus
              />

            </FormControl>


            {/* MEDIO */}

            <FormControl>

              <FormLabel
                fontSize="sm"
                fontWeight="600"
              >
                Medio
              </FormLabel>

              <Select
                value={medio}
                onChange={(e) =>
                  setMedio(
                    e.target.value
                  )
                }
                placeholder="Seleccionar medio"
              >

                <option value="TRANSFERENCIA">
                  Transferencia
                </option>

                <option value="CHEQUE">
                  Cheque
                </option>

                <option value="DEBITO">
                  Débito
                </option>

                <option value="OTRO">
                  Otro
                </option>

              </Select>

            </FormControl>


            {/* TOTAL */}

            <FormControl>

              <FormLabel
                fontSize="sm"
                fontWeight="600"
              >
                Total
              </FormLabel>

              <Input
                type="number"
                min="0"
                step="0.01"
                value={total}
                onChange={(e) =>
                  setTotal(
                    e.target.value
                  )
                }
                placeholder="0"
              />

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
            onClick={guardar}
            isLoading={guardando}
          >
            Guardar gasto
          </Button>

        </ModalFooter>

      </ModalContent>

    </Modal>

  );

}