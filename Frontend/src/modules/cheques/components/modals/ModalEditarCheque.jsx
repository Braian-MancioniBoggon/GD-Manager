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
  Textarea,
  SimpleGrid,
  Text,
  useToast,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";

import api from "../../../../shared/services/api";

export default function ModalEditarCheque({
  isOpen,
  onClose,
  cheque,
  onActualizado,
}) {

  const toast =
    useToast();

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    formulario,
    setFormulario,
  ] = useState({
    numero: "",
    banco: "",
    librador: "",
    importe: "",
    fechaEmision: "",
    fechaVencimiento: "",
    observaciones: "",
  });

  // ========================================
  // CARGAR CHEQUE
  // ========================================

  useEffect(() => {

    if (!cheque) {
      return;
    }

    const convertirFechaInput = (
      fecha
    ) => {

      if (!fecha) {
        return "";
      }

      return new Date(
        fecha
      )
        .toISOString()
        .split("T")[0];

    };

    setFormulario({
      numero:
        cheque.numero || "",

      banco:
        cheque.banco || "",

      librador:
        cheque.librador || "",

      importe:
        cheque.importe ?? "",

      fechaEmision:
        convertirFechaInput(
          cheque.fechaEmision
        ),

      fechaVencimiento:
        convertirFechaInput(
          cheque.fechaVencimiento
        ),

      observaciones:
        cheque.observaciones || "",
    });

  }, [
    cheque,
    isOpen,
  ]);

  // ========================================
  // CAMBIAR CAMPO
  // ========================================

  const cambiarCampo = (
    campo,
    valor
  ) => {

    setFormulario(
      (actual) => ({
        ...actual,
        [campo]: valor,
      })
    );

  };

  // ========================================
  // GUARDAR
  // ========================================

  const guardar = async () => {

    if (!cheque) {
      return;
    }

    if (
      !formulario.numero.trim() ||
      !formulario.banco.trim() ||
      !formulario.librador.trim()
    ) {

      toast({
        title:
          "Faltan datos",
        description:
          "Completá número, banco y librador.",
        status:
          "warning",
        duration:
          3000,
        isClosable:
          true,
      });

      return;

    }

    const importe =
      Number(
        formulario.importe
      );

    if (
      Number.isNaN(
        importe
      ) ||
      importe <= 0
    ) {

      toast({
        title:
          "Importe inválido",
        description:
          "El importe debe ser mayor a cero.",
        status:
          "warning",
        duration:
          3000,
        isClosable:
          true,
      });

      return;

    }

    if (
      !formulario.fechaEmision ||
      !formulario.fechaVencimiento
    ) {

      toast({
        title:
          "Faltan fechas",
        description:
          "Completá la fecha de emisión y vencimiento.",
        status:
          "warning",
        duration:
          3000,
        isClosable:
          true,
      });

      return;

    }

    try {

      setGuardando(
        true
      );

      const respuesta =
        await api.put(
          `/cheques/${cheque._id}`,
          {
            numero:
              formulario.numero.trim(),

            banco:
              formulario.banco.trim(),

            librador:
              formulario.librador.trim(),

            importe,

            fechaEmision:
              formulario.fechaEmision,

            fechaVencimiento:
              formulario.fechaVencimiento,

            observaciones:
              formulario.observaciones.trim(),
          }
        );

      toast({
        title:
          "Cheque actualizado",
        description:
          "Los datos del cheque fueron actualizados correctamente.",
        status:
          "success",
        duration:
          3000,
        isClosable:
          true,
      });

      if (
        onActualizado
      ) {

        onActualizado(
          respuesta.data.cheque
        );

      }

      onClose();

    } catch (error) {

      console.error(
        "Error editando cheque:",
        error
      );

      toast({
        title:
          "No se pudo actualizar",
        description:
          error.response?.data?.mensaje ||
          "Ocurrió un error al actualizar el cheque.",
        status:
          "error",
        duration:
          4000,
        isClosable:
          true,
      });

    } finally {

      setGuardando(
        false
      );

    }

  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="lg"
    >

      <ModalOverlay />

      <ModalContent>

        {/* ================================== */}
        {/* HEADER */}
        {/* ================================== */}

        <ModalHeader
          borderBottom="1px solid"
          borderColor="gray.100"
        >

          <Text
            fontSize="xl"
            fontWeight="700"
            color="gray.800"
          >
            Editar cheque
          </Text>

          <Text
            mt={1}
            fontSize="sm"
            fontWeight="400"
            color="gray.500"
          >
            Modificar los datos del cheque #{cheque?.numero}
          </Text>

        </ModalHeader>

        {/* ================================== */}
        {/* BODY */}
        {/* ================================== */}

        <ModalBody
          py={6}
        >

          <SimpleGrid
            columns={{
              base: 1,
              md: 2,
            }}
            spacing={5}
          >

            {/* NÚMERO */}

            <FormControl
              isRequired
            >

              <FormLabel
                fontSize="sm"
              >
                Número
              </FormLabel>

              <Input
                value={
                  formulario.numero
                }
                onChange={(e) =>
                  cambiarCampo(
                    "numero",
                    e.target.value
                  )
                }
              />

            </FormControl>

            {/* BANCO */}

            <FormControl
              isRequired
            >

              <FormLabel
                fontSize="sm"
              >
                Banco
              </FormLabel>

              <Input
                value={
                  formulario.banco
                }
                onChange={(e) =>
                  cambiarCampo(
                    "banco",
                    e.target.value
                  )
                }
              />

            </FormControl>

            {/* LIBRADOR */}

            <FormControl
              isRequired
            >

              <FormLabel
                fontSize="sm"
              >
                Librador
              </FormLabel>

              <Input
                value={
                  formulario.librador
                }
                onChange={(e) =>
                  cambiarCampo(
                    "librador",
                    e.target.value
                  )
                }
              />

            </FormControl>

            {/* IMPORTE */}

            <FormControl
              isRequired
            >

              <FormLabel
                fontSize="sm"
              >
                Importe
              </FormLabel>

              <Input
                type="number"
                min="0"
                step="0.01"
                value={
                  formulario.importe
                }
                onChange={(e) =>
                  cambiarCampo(
                    "importe",
                    e.target.value
                  )
                }
              />

            </FormControl>

            {/* FECHA EMISIÓN */}

            <FormControl
              isRequired
            >

              <FormLabel
                fontSize="sm"
              >
                Fecha de emisión
              </FormLabel>

              <Input
                type="date"
                value={
                  formulario.fechaEmision
                }
                onChange={(e) =>
                  cambiarCampo(
                    "fechaEmision",
                    e.target.value
                  )
                }
              />

            </FormControl>

            {/* FECHA VENCIMIENTO */}

            <FormControl
              isRequired
            >

              <FormLabel
                fontSize="sm"
              >
                Fecha de vencimiento
              </FormLabel>

              <Input
                type="date"
                value={
                  formulario.fechaVencimiento
                }
                onChange={(e) =>
                  cambiarCampo(
                    "fechaVencimiento",
                    e.target.value
                  )
                }
              />

            </FormControl>

          </SimpleGrid>

          {/* OBSERVACIONES */}

          <FormControl
            mt={5}
          >

            <FormLabel
              fontSize="sm"
            >
              Observaciones
            </FormLabel>

            <Textarea
              value={
                formulario.observaciones
              }
              onChange={(e) =>
                cambiarCampo(
                  "observaciones",
                  e.target.value
                )
              }
              placeholder="Observaciones del cheque..."
              resize="vertical"
              rows={4}
            />

          </FormControl>

        </ModalBody>

        {/* ================================== */}
        {/* FOOTER */}
        {/* ================================== */}

        <ModalFooter
          borderTop="1px solid"
          borderColor="gray.100"
          gap={3}
        >

          <Button
            variant="ghost"
            onClick={onClose}
            isDisabled={
              guardando
            }
          >
            Cancelar
          </Button>

          <Button
            colorScheme="blue"
            onClick={guardar}
            isLoading={
              guardando
            }
            loadingText="Guardando"
          >
            Guardar cambios
          </Button>

        </ModalFooter>

      </ModalContent>

    </Modal>
  );
}