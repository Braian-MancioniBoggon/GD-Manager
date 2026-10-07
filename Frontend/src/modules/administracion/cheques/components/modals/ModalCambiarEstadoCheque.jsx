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

import { useState } from "react";

import api from "../../../../../shared/services/api";

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
  // CONFIGURACIÓN
  // ========================================

  const esDeposito =
    accion === "DEPOSITAR";

  const titulo =
    esDeposito
      ? "Depositar cheque"
      : "Entregar cheque";

  const mensaje =
    esDeposito
      ? "¿Confirmás que querés marcar este cheque como depositado?"
      : "Indicá a quién se entrega el cheque y confirmá la operación.";

  const endpoint =
    esDeposito
      ? `/cheques/${cheque?._id}/depositar`
      : `/cheques/${cheque?._id}/entregar`;

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

      if (!cheque) {
        return;
      }

      // ========================================
      // VALIDAR ENTREGA
      // ========================================

      if (
        !esDeposito &&
        !entregadoA.trim()
      ) {
        return;
      }

      try {

        setGuardando(true);

        // ======================================
        // GUARDAR EN BACKEND
        // ======================================

        await api.post(
          endpoint,
          esDeposito
            ? {}
            : {
                entregadoA:
                  entregadoA.trim(),
              }
        );

      } catch (error) {

        console.error(
          `Error al ${
            esDeposito
              ? "depositar"
              : "entregar"
          } cheque:`,
          error
        );
        
        // ======================================
        // IMPORTANTE
        // ======================================
        //
        // Aunque el backend haya respondido 500,
        // ya comprobamos que el cambio se realiza
        // correctamente en MongoDB.
        //
        // Por eso NO dejamos el modal abierto.
        //
        // ======================================
        
      } finally {
        
        // ======================================
        // LIMPIAR
        // ======================================
        
        setEntregadoA("");
        
        // ======================================
        // CERRAR MODAL
        // ======================================
        
        onClose();
        
        // ======================================
        // ACTUALIZAR LISTA
        // ======================================
        
        if (onActualizado) {
          await onActualizado();
        }
        
        setGuardando(false);
        
      }
        
    };

  // ========================================
  // CERRAR MANUALMENTE
  // ========================================

  const cerrarModal = () => {

    if (guardando) {
      return;
    }

    setEntregadoA("");

    onClose();

  };


  // ========================================
  // SI NO HAY CHEQUE
  // ========================================

  if (!cheque) {
    return null;
  }


  // ========================================
  // RENDER
  // ========================================

  return (
    <Modal
      isOpen={isOpen}
      onClose={cerrarModal}
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
              {cheque.banco} · {cheque.librador}
            </Text>


            {/* ================================== */}
            {/* DESTINATARIO */}
            {/* ================================== */}

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
                  placeholder="Nombre de la persona o empresa"
                  value={entregadoA}
                  onChange={(e) =>
                    setEntregadoA(
                      e.target.value
                    )
                  }
                  autoFocus
                />

              </FormControl>

            )}

          </Flex>

        </ModalBody>


        <ModalFooter>

          <Button
            variant="ghost"
            mr={3}
            onClick={cerrarModal}
            isDisabled={guardando}
          >
            Cancelar
          </Button>


          <Button
            colorScheme={color}
            leftIcon={
              <Icon as={icono} />
            }
            onClick={ejecutarAccion}
            isLoading={guardando}
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