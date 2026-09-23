import {
  Box,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Button,
  Divider,
  Image,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import { nombrePermiso } from "../../../../shared/utils/formatoTexto";

import { cambiarEstadoUsuario, } from "../../../auth/services/usuarioService";

import ModalEditarUsuario from "./ModalEditarUsuario";

import { imgUsuario, logo } from "../../../../shared/assets";

export default function UsuarioDetalle({

  usuario,

  onActualizado,

}) {

  const toast =
    useToast();

  const {
    isOpen,
    onOpen,
    onClose,
  } = useDisclosure();

  if (!usuario) {

    return (

      <Box p={8}>

        <Text>

          Seleccione un usuario

        </Text>

      </Box>

    );

  }

  async function cambiarEstado() {

    try {

      await cambiarEstadoUsuario(
        usuario._id
      );

      toast({

        title:
          usuario.activo
            ? "Usuario desactivado"
            : "Usuario activado",

        status:
          "success",

      });

      onActualizado();

    } catch (error) {

      toast({

        title:
          "Error",

        description:
          error.response?.data?.mensaje,

        status:
          "error",

      });

    }

  }

  return (

    <Box p={8}>

      <VStack
        align="start"
        spacing={6}
      >

        <HStack
          spacing={5}
        >

          <Box

            w="100px"

            h="100px"

            borderRadius="full"

            bg={
              usuario.color
            }

            display="flex"

            justifyContent="center"

            alignItems="center"

          >

            <Image

              src={
                usuario.avatar ===
                  "usuario"

                  ? imgUsuario

                  : logo
              }

              boxSize="60px"

            />

          </Box>

          <Box>

            <Heading>

              {
                usuario.nombre
              }

            </Heading>

            <Badge

              colorScheme={

                usuario.activo

                  ? "green"

                  : "red"

              }

            >

              {usuario.activo

                ? "Activo"

                : "Inactivo"}

            </Badge>

          </Box>

        </HStack>

        <Divider />

        <Box>

          <Text
            fontWeight="bold"
          >
            Rol
          </Text>

          <Text>
            {usuario.rol?.nombre || "Sin rol"}
          </Text>

        </Box>

        <Box>

          <Text
            fontWeight="bold"
          >
            Último ingreso
          </Text>

          <Text>

            {usuario.ultimoIngreso

              ? new Date(
                usuario.ultimoIngreso
              ).toLocaleString()

              : "Nunca"}

          </Text>

        </Box>

        <Box>

          <Text
            fontWeight="bold"
          >
            Permisos efectivos
          </Text>

          <VStack
            align="start"
            mt={2}
          >

            {usuario.permisosEfectivos?.map(
              (permiso) => (

                <Badge
                  key={permiso}
                >
                  {nombrePermiso(permiso)}
                </Badge>

              )
            )}

          </VStack>

        </Box>

        <Divider />

        <HStack>

          <Button
            colorScheme="blue"
            onClick={onOpen}
          >

            Editar

          </Button>

          <Button

            colorScheme={
              usuario.activo
                ? "red"
                : "green"
            }

            onClick={
              cambiarEstado
            }

          >

            {usuario.activo

              ? "Desactivar"

              : "Activar"}

          </Button>

        </HStack>

      </VStack>

      <ModalEditarUsuario

        isOpen={
          isOpen
        }

        onClose={
          onClose
        }

        usuario={
          usuario
        }

        onGuardado={() => {

          onClose();

          onActualizado();

        }}

      />

    </Box>

  );

}