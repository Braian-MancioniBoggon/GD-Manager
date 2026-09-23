import {
  Box,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Button,
  Divider,
  Wrap,
  WrapItem,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import {
  useEffect,
  useState,
} from "react";

import {
  cambiarEstadoRol,
  obtenerRol,
} from "../../../auth/services/usuarioService";

import {
  nombrePermiso,
} from "../../../../shared/utils/formatoTexto";

import ModalEditarRol from "./ModalEditarRol";

export default function RolDetalle({

  rolId,

  onActualizado,

}) {

  const toast =
    useToast();

  const [
    rol,
    setRol,
  ] = useState(null);

  const {
    isOpen,
    onOpen,
    onClose,
  } = useDisclosure();

  // =====================================================
  // CARGAR ROL DESDE BACKEND
  // =====================================================

  useEffect(() => {

    if (!rolId) {

      setRol(null);

      return;

    }

    cargarRol();

  }, [rolId]);

  async function cargarRol() {

    try {

      const data =
        await obtenerRol(
          rolId
        );

      setRol(data);

    } catch (error) {

      console.error(
        error
      );

      setRol(null);

    }

  }

  // =====================================================
  // CAMBIAR ESTADO
  // =====================================================

  async function cambiarEstado() {

    try {

      await cambiarEstadoRol(
        rolId
      );

      toast({

        title:
          rol.activo
            ? "Rol desactivado"
            : "Rol activado",

        status:
          "success",

      });

      // Volvemos a pedir el rol
      // directamente al backend

      await cargarRol();

      // Actualizamos también
      // la lista lateral

      if (onActualizado) {

        await onActualizado();

      }

    } catch (error) {

      toast({

        title:
          "Error",

        description:
          error.response
            ?.data
            ?.mensaje ||
          "No se pudo cambiar el estado",

        status:
          "error",

      });

    }

  }

  // =====================================================
  // SIN ROL SELECCIONADO
  // =====================================================

  if (!rolId) {

    return (

      <Box p={8}>

        <Text>

          Seleccione un Rol

        </Text>

      </Box>

    );

  }

  // =====================================================
  // CARGANDO
  // =====================================================

  if (!rol) {

    return (

      <Box p={8}>

        <Text>

          Cargando rol...

        </Text>

      </Box>

    );

  }

  // =====================================================
  // DETALLE
  // =====================================================

  return (

    <Box p={8}>

      <VStack
        align="start"
        spacing={6}
      >

        <Box>

          <Heading>

            {rol.nombre}

          </Heading>

          <Badge

            mt={2}

            colorScheme={
              rol.activo
                ? "green"
                : "red"
            }

          >

            {rol.activo
              ? "Activo"
              : "Inactivo"}

          </Badge>

        </Box>

        <Divider />

        <Box>

          <Text
            fontWeight="bold"
          >

            Descripción

          </Text>

          <Text mt={2}>

            {rol.descripcion ||
              "Sin descripción"}

          </Text>

        </Box>

        <Divider />

        <Box w="100%">

          <Text
            fontWeight="bold"
            mb={3}
          >

            Permisos

          </Text>

          <Wrap>

            {rol.permisos?.length
              ? (

                rol.permisos.map(
                  (permiso) => (

                    <WrapItem
                      key={permiso}
                    >

                      <Badge
                        colorScheme="blue"
                      >

                        {nombrePermiso(
                          permiso
                        )}

                      </Badge>

                    </WrapItem>

                  )
                )

              )
              : (

                <Text
                  color="gray.500"
                >

                  Este Rol no posee permisos.

                </Text>

              )}

          </Wrap>

        </Box>

        <Divider />

        <HStack>

          <Button

            colorScheme="blue"

            onClick={
              onOpen
            }

          >

            Editar

          </Button>

          <Button

            colorScheme={
              rol.activo
                ? "red"
                : "green"
            }

            onClick={
              cambiarEstado
            }

          >

            {rol.activo
              ? "Desactivar"
              : "Activar"}

          </Button>

        </HStack>

      </VStack>

      <ModalEditarRol

        isOpen={
          isOpen
        }

        onClose={
          onClose
        }

        rol={
          rol
        }

        onGuardado={async () => {

          onClose();

          await cargarRol();

          if (onActualizado) {

            await onActualizado();

          }

        }}

      />

    </Box>

  );

}