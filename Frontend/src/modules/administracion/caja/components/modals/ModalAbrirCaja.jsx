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
  Text,
} from "@chakra-ui/react";

import {
  useEffect,
  useState,
} from "react";

export default function ModalAbrirCaja({
  isOpen,
  onClose,
  onConfirmar,
  abriendo,
}) {

  const [
    importe,
    setImporte,
  ] = useState("");


  // ========================================
  // LIMPIAR AL ABRIR
  // ========================================

  useEffect(() => {

    if (isOpen) {
      setImporte("");
    }

  }, [isOpen]);


  // ========================================
  // CONFIRMAR
  // ========================================

  const confirmar = () => {

    const numero =
      Number(importe);

    if (
      Number.isNaN(numero) ||
      numero <= 0
    ) {
      return;
    }

    onConfirmar(numero);

  };


  // ========================================
  // RENDER
  // ========================================

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >

      <ModalOverlay />

      <ModalContent>

        <ModalHeader>
          Abrir primera caja
        </ModalHeader>


        <ModalBody>

          <Text
            mb={5}
            fontSize="sm"
            color="gray.500"
          >
            Ingresá el efectivo con el que
            comienza esta primera caja.
          </Text>


          <FormControl>

            <FormLabel>
              Efectivo inicial
            </FormLabel>

            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={importe}
              onChange={(e) =>
                setImporte(
                  e.target.value
                )
              }
              autoFocus
            />

          </FormControl>


          <Text
            mt={3}
            fontSize="xs"
            color="gray.500"
          >
            Este importe será utilizado como
            saldo inicial de la primera caja.
          </Text>

        </ModalBody>


        <ModalFooter>

          <Button
            variant="ghost"
            mr={3}
            onClick={onClose}
            isDisabled={abriendo}
          >
            Cancelar
          </Button>

          <Button
            colorScheme="blue"
            onClick={confirmar}
            isLoading={abriendo}
            isDisabled={
              !importe ||
              Number(importe) <= 0
            }
          >
            Abrir caja
          </Button>

        </ModalFooter>

      </ModalContent>

    </Modal>
  );
}