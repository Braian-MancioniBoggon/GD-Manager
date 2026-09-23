import {
  Box,
  Flex,
  Grid,
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

import TarjetaUsuario from "../components/usuarios/TarjetaUsuario";
import UsuarioDetalle from "../components/usuarios/UsuarioDetalle";
import ModalNuevoUsuario from "../../auth/components/modals/ModalNuevoUsuario";

import {
  obtenerUsuarios,
} from "../../auth/services/usuarioService";

export default function UsuariosPage() {

  const [
    usuarios,
    setUsuarios,
  ] = useState([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    usuarioSeleccionado,
    setUsuarioSeleccionado,
  ] = useState(null);

  const {
    isOpen,
    onOpen,
    onClose,
  } = useDisclosure();

  const [
    busquedaUsuario,
    setBusquedaUsuario,
  ] = useState("");

  async function cargarUsuarios() {

    try {

      setCargando(true);

      const data =
        await obtenerUsuarios();

      setUsuarios(data);

      if (
        !usuarioSeleccionado &&
        data.length
      ) {

        setUsuarioSeleccionado(
          data[0]
        );

      }

    } catch (error) {

      console.error(error);

    } finally {

      setCargando(false);

    }

  }

  useEffect(() => {

    cargarUsuarios();

  }, []);

  const usuariosFiltrados = usuarios
    .filter((usuario) => {

      const texto =
        busquedaUsuario
          ?.trim()
          .toLowerCase();

      if (!texto) {

        return true;

      }

      return usuario.nombre
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

    <Box p={8} h="100vh">


      <Flex
        justify="space-between"
        align="center"
        mb={6}
        gap={4}
      >

        <Heading size="lg">

          Usuarios

        </Heading>

        <Box>

          <Input

            value={busquedaUsuario}

            onChange={(e) =>
              setBusquedaUsuario(e.target.value)
            }

            placeholder="Buscar usuario..."

            bg="white"

            maxW="500px"

            minW="350px"

          />

        </Box>

      </Flex>
      <Flex h="calc(100vh - 96px)">
        <Box overflowY="auto" h="calc(100vh - 96px)"
          overflowX="hidden"
          sx={{
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#E20A19",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#e20a1893",
            },
          }}>
          <SimpleGrid
            w={"205px"}
            flexShrink={0}
            spacing={5}
            p={3}

          >

            <TarjetaUsuario
              agregar
              onClick={
                onOpen
              }
            />

            {usuariosFiltrados.map(
              (usuario) => (

                <TarjetaUsuario

                  key={
                    usuario._id
                  }

                  usuario={
                    usuario
                  }

                  onClick={() =>
                    setUsuarioSeleccionado(
                      usuario
                    )
                  }

                />

              )
            )}

          </SimpleGrid>
        </Box>
        <Center h={"calc(100vh - 96px)"}>
          <Divider orientation='vertical' m={8} />
        </Center>
        <Box flex={1}>
          <UsuarioDetalle
            usuario={
              usuarioSeleccionado
            }
            onActualizado={
              cargarUsuarios
            }
          />
        </Box>

        <ModalNuevoUsuario

          isOpen={
            isOpen
          }

          onClose={
            onClose
          }

          onUsuarioCreado={
            cargarUsuarios
          }

        />
      </Flex>
    </Box>
  );

}