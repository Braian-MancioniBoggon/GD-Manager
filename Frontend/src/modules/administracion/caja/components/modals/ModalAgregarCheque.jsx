import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Button,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";

import {
  useState,
} from "react";

import api from "../../../../../shared/services/api";

export default function ModalAgregarCheque({
  isOpen,
  onClose,
  caja,
  onAgregado,
}) {

  const toast =
    useToast();

  const [
    numero,
    setNumero,
  ] = useState("");

  const [
    banco,
    setBanco,
  ] = useState("");

  const [
    librador,
    setLibrador,
  ] = useState("");

  const [
    importe,
    setImporte,
  ] = useState("");

  const [
    fechaEmision,
    setFechaEmision,
  ] = useState("");

  const [
    fechaVencimiento,
    setFechaVencimiento,
  ] = useState("");

  const [
    observaciones,
    setObservaciones,
  ] = useState("");

  const [
    guardando,
    setGuardando,
  ] = useState(false);


  // ========================================
  // LIMPIAR FORMULARIO
  // ========================================

  const limpiar =
    () => {

      setNumero("");
      setBanco("");
      setLibrador("");
      setImporte("");
      setFechaEmision("");
      setFechaVencimiento("");
      setObservaciones("");

    };


  // ========================================
  // CERRAR
  // ========================================

  const cerrar =
    () => {

      if (guardando) {
        return;
      }

      limpiar();
      onClose();

    };


  // ========================================
  // GUARDAR
  // ========================================

  const guardar =
    async () => {

      if (!caja?._id) {
        return;
      }

      if (
        !numero.trim() ||
        !banco.trim() ||
        !librador.trim() ||
        !importe ||
        !fechaEmision ||
        !fechaVencimiento
      ) {

        toast({
          title:
            "Completá los datos del cheque.",
          status:
            "warning",
          duration:
            3000,
          isClosable:
            true,
        });

        return;
      }

      const importeNumero =
        Number(importe);

      if (
        Number.isNaN(
          importeNumero
        ) ||
        importeNumero <= 0
      ) {

        toast({
          title:
            "El importe no es válido.",
          status:
            "warning",
          duration:
            3000,
          isClosable:
            true,
        });

        return;
      }

      setGuardando(true);

      try {

        const respuesta =
          await api.post(
            `/caja/${caja._id}/cheques`,
            {
              numero:
                numero.trim(),

              banco:
                banco.trim(),

              librador:
                librador.trim(),

              importe:
                importeNumero,

              fechaEmision,

              fechaVencimiento,

              observaciones:
                observaciones.trim(),
            }
          );

        if (
          respuesta.data?.caja
        ) {

          onAgregado(
            respuesta.data.caja
          );

        }

        toast({
          title:
            "Cheque agregado correctamente.",
          status:
            "success",
          duration:
            3000,
          isClosable:
            true,
        });

        limpiar();
        onClose();

      } catch (error) {

        console.error(
          "Error agregando cheque:",
          error
        );

        toast({
          title:
            "No se pudo agregar el cheque.",
          description:
            error.response?.data?.mensaje ||
            "Ocurrió un error inesperado.",
          status:
            "error",
          duration:
            4000,
          isClosable:
            true,
        });

      } finally {

        setGuardando(false);

      }

    };


  return (

    <Modal
      isOpen={isOpen}
      onClose={cerrar}
      size="lg"
      isCentered
    >

      <ModalOverlay />

      <ModalContent>

        <ModalHeader>
          Agregar cheque
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody>

          <Text
            mb={5}
            fontSize="sm"
            color="gray.500"
          >
            Registrá el cheque recibido para
            incorporarlo a la caja del día.
          </Text>

          <SimpleGrid
            columns={{
              base: 1,
              md: 2,
            }}
            spacing={4}
          >

            {/* NÚMERO */}

            <FormControl
              isRequired
            >

              <FormLabel>
                Número
              </FormLabel>

              <Input
                value={numero}
                onChange={(e) =>
                  setNumero(
                    e.target.value
                  )
                }
                placeholder=""
              />

            </FormControl>


            {/* BANCO */}

            <FormControl
              isRequired
            >

              <FormLabel>
                Banco
              </FormLabel>

              <Input
                value={banco}
                onChange={(e) =>
                  setBanco(
                    e.target.value
                  )
                }
                placeholder=""
              />

            </FormControl>


            {/* CLIENTE */}

            <FormControl
              isRequired
            >

              <FormLabel>
                Cliente
              </FormLabel>

              <Input
                value={librador}
                onChange={(e) =>
                  setLibrador(
                    e.target.value
                  )
                }
                placeholder=""
              />

            </FormControl>


            {/* IMPORTE */}

            <FormControl
              isRequired
            >

              <FormLabel>
                Importe
              </FormLabel>

              <Input
                type="number"
                min="0"
                value={importe}
                onChange={(e) =>
                  setImporte(
                    e.target.value
                  )
                }
                placeholder=""
              />

            </FormControl>


            {/* FECHA EMISIÓN */}

            <FormControl
              isRequired
            >

              <FormLabel>
                Fecha de emisión
              </FormLabel>

              <Input
                type="date"
                value={
                  fechaEmision
                }
                onChange={(e) =>
                  setFechaEmision(
                    e.target.value
                  )
                }
              />

            </FormControl>


            {/* FECHA VENCIMIENTO */}

            <FormControl
              isRequired
            >

              <FormLabel>
                Fecha de vencimiento
              </FormLabel>

              <Input
                type="date"
                value={
                  fechaVencimiento
                }
                onChange={(e) =>
                  setFechaVencimiento(
                    e.target.value
                  )
                }
              />

            </FormControl>

          </SimpleGrid>


          {/* OBSERVACIONES */}

          <FormControl
            mt={4}
          >

            <FormLabel>
              Observaciones
            </FormLabel>

            <Textarea
              value={
                observaciones
              }
              onChange={(e) =>
                setObservaciones(
                  e.target.value
                )
              }
              placeholder="Observaciones del cheque..."
              resize="vertical"
            />

          </FormControl>

        </ModalBody>


        <ModalFooter
          gap={3}
        >

          <Button
            variant="ghost"
            onClick={cerrar}
            isDisabled={
              guardando
            }
          >
            Cancelar
          </Button>

          <Button
            colorScheme="red"
            onClick={guardar}
            isLoading={
              guardando
            }
            loadingText="Guardando..."
          >
            Agregar cheque
          </Button>

        </ModalFooter>

      </ModalContent>

    </Modal>

  );

}