import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Flex,
  Icon,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";

import {
  FiUpload,
  FiSend,
} from "react-icons/fi";

import {
  useEffect,
  useState,
} from "react";

import api from "../../../../shared/services/api";

export default function ModalCambiarEstadoCheque({
  isOpen,
  onClose,
  cheque,
  accion,
  onActualizado,
}) {

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    entregadoA,
    setEntregadoA,
  ] = useState("");

  // ========================================
  // REINICIAR CAMPO
  // ========================================

  useEffect(() => {

    if (isOpen) {

      setEntregadoA(
        cheque?.entregadoA || ""
      );

    }

  }, [
    isOpen,
    cheque,
  ]);

  if (!cheque) {
    return null;
  }

  const esDeposito =
    accion === "DEPOSITAR";

  const titulo =
    esDeposito
      ? "Depositar cheque"
      : "Entregar cheque";

  const mensaje =
    esDeposito
      ? "¿Confirmás que querés marcar este cheque como depositado?"
      : "¿Confirmás que querés marcar este cheque como entregado?";

  const endpoint =
    esDeposito
      ? `/cheques/${cheque._id}/depositar`
      : `/cheques/${cheque._id}/entregar`;

  const icono =
    esDeposito
      ? FiUpload
      : FiSend;

  const color =
    esDeposito
      ? "blue"
      : "green";

  // ========================================
  // EJECUTAR ACCIÓN
  // ========================================

  const ejecutarAccion = async () => {

    if (
      !esDeposito &&
      !entregadoA.trim()
    ) {
      return;
    }

    try {

      setGuardando(true);

      const respuesta =
        await api.post(
          endpoint,
          esDeposito
            ? {}
            : {
                entregadoA:
                  entregadoA.trim(),
              }
        );

      const chequeActualizado =
        respuesta.data.cheque;

      if (onActualizado) {

        onActualizado(
          chequeActualizado
        );

      }

      onClose();

    } catch (error) {

      console.error(
        `Error al ${
          esDeposito
            ? "depositar"
            : "entregar"
        } cheque:`,
        error
      );

    } finally {

      setGuardando(false);

    }

  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={
        guardando
          ? () => {}
          : onClose
      }
      isCentered
    >

      <ModalOverlay />

      <ModalContent>

        <ModalHeader>
          {titulo}
        </ModalHeader>

        <ModalBody>

          <Flex
            direction="column"
            align="center"
            textAlign="center"
            py={4}
          >

            {/* ================================ */}
            {/* ICONO */}
            {/* ================================ */}

            <Flex
              w="56px"
              h="56px"
              borderRadius="full"
              bg={`${color}.50`}
              align="center"
              justify="center"
              mb={4}
            >

              <Icon
                as={icono}
                boxSize={6}
                color={`${color}.500`}
              />

            </Flex>

            {/* ================================ */}
            {/* CHEQUE */}
            {/* ================================ */}

            <Text
              fontSize="md"
              fontWeight="600"
              color="gray.800"
            >
              Cheque #{cheque.numero}
            </Text>

            <Text
              mt={2}
              fontSize="sm"
              color="gray.500"
              maxW="360px"
            >
              {mensaje}
            </Text>

            <Text
              mt={4}
              fontSize="sm"
              color="gray.600"
            >
              {cheque.banco} ·{" "}
              {cheque.librador}
            </Text>

            {/* ================================ */}
            {/* ENTREGADO A */}
            {/* ================================ */}

            {!esDeposito && (

              <FormControl
                mt={6}
                textAlign="left"
                isRequired
              >

                <FormLabel
                  fontSize="sm"
                  fontWeight="600"
                  color="gray.700"
                >
                  Entregado a
                </FormLabel>

                <Input
                  placeholder="Nombre de quien recibe"
                  value={entregadoA}
                  onChange={(e) =>
                    setEntregadoA(
                      e.target.value
                    )
                  }
                  isDisabled={
                    guardando
                  }
                  autoFocus
                />

                <Text
                  mt={1}
                  fontSize="xs"
                  color="gray.400"
                >
                  Indicá a quién se entrega
                  el cheque.
                </Text>

              </FormControl>

            )}

          </Flex>

        </ModalBody>

        <ModalFooter>

          <Button
            variant="ghost"
            mr={3}
            onClick={onClose}
            isDisabled={guardando}
          >
            Cancelar
          </Button>

          <Button
            colorScheme={color}
            leftIcon={
              <Icon as={icono} />
            }
            onClick={
              ejecutarAccion
            }
            isLoading={
              guardando
            }
            loadingText={
              esDeposito
                ? "Depositando..."
                : "Entregando..."
            }
            isDisabled={
              !esDeposito &&
              !entregadoA.trim()
            }
          >
            {esDeposito
              ? "Depositar"
              : "Entregar"}
          </Button>

        </ModalFooter>

      </ModalContent>

    </Modal>
  );
}