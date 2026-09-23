import {
  Box,
  Flex,
  Spinner,
  useDisclosure,
  SimpleGrid,
  Heading,
  Input,
  Divider,
  Center,
} from "@chakra-ui/react";

import {
  useEffect,
  useState,
} from "react";

import TarjetaRol from "../components/roles/TarjetaRol";
import RolDetalle from "../components/roles/RolDetalle";
import ModalNuevoRol from "../components/roles/ModalNuevoRol";

import {
  obtenerRoles,
} from "../../auth/services/usuarioService";

export default function RolesPage() {

  const [
    roles,
    setRoles,
  ] = useState([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    rolSeleccionadoId,
    setRolSeleccionadoId,
  ] = useState(null);

  const {
    isOpen,
    onOpen,
    onClose,
  } = useDisclosure();

  const [
    busquedaRol,
    setBusquedaRol,
  ] = useState("");

  async function cargarRoles() {

    try {

      setCargando(true);

      const data =
        await obtenerRoles();

      setRoles(data);

      if (
        !rolSeleccionadoId &&
        data.length
      ) {

        setRolSeleccionadoId(
          data[0]._id
        );

      }

    } catch (error) {

      console.error(error);

    } finally {

      setCargando(false);

    }

  }

  useEffect(() => {

    cargarRoles();

  }, []);

  const rolesFiltrados = roles

    .filter((rol) => {

      const texto =
        busquedaRol
          ?.trim()
          .toLowerCase();

      if (!texto) {

        return true;

      }

      return rol.nombre
        .toLowerCase()
        .includes(texto);

    })

    .sort((a, b) =>

      a.nombre.localeCompare(
        b.nombre,
        "es",
        {
          sensitivity: "base",
        }
      )

    );

  if (cargando) {

    return (

      <Box p={10}>

        <Spinner />

      </Box>

    );

  }

  return (

    <Box
      p={8}
      h="100vh"
    >

      <Flex

        justify="space-between"

        align="center"

        mb={6}

        gap={4}

      >

        <Heading size="lg">

          Roles

        </Heading>

        <Input

          value={
            busquedaRol
          }

          onChange={(e) =>

            setBusquedaRol(
              e.target.value
            )

          }

          placeholder="Buscar Rol..."

          bg="white"

          maxW="500px"

          minW="350px"

        />

      </Flex>

      <Flex
        h="calc(100vh - 96px)"
      >

        <Box

          overflowY="auto"

          overflowX="hidden"

          h="calc(100vh - 96px)"

          sx={{

            "&::-webkit-scrollbar": {

              width: "4px",

            },

            "&::-webkit-scrollbar-thumb": {

              background: "#E20A19",

              borderRadius: "10px",

            },

          }}

        >

          <SimpleGrid

            w="201px"

            spacing={5}

            p={3}

          >

            <TarjetaRol

              agregar

              onClick={
                onOpen
              }

            />

            {rolesFiltrados.map(

              (rol) => (

                <TarjetaRol

                  key={
                    rol._id
                  }

                  rol={
                    rol
                  }

                  seleccionado={
                    rolSeleccionadoId ===
                    rol._id
                  }

                  onClick={() =>

                    setRolSeleccionadoId(
                      rol._id
                    )

                  }

                />

              )

            )}

          </SimpleGrid>

        </Box>

        <Center
          h="calc(100vh - 96px)"
        >

          <Divider
            orientation="vertical"
            m={8}
          />

        </Center>

        <Box flex={1}>

          <RolDetalle

            rolId={
              rolSeleccionadoId
            }

            onActualizado={
              cargarRoles
            }

          />

        </Box>

      </Flex>

      <ModalNuevoRol

        isOpen={
          isOpen
        }

        onClose={
          onClose
        }

        onRolCreado={
          cargarRoles
        }

      />

    </Box>

  );

}