import {
  Box,
  Button,
  Grid,
  Heading,
  Text,
  VStack,
  useDisclosure,
  Wrap,
  WrapItem,
  ScaleFade,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";

import { obtenerUsuariosLogin, } from "../services/usuarioService";

import ModalNuevoUsuario from "./modals/ModalNuevoUsuario";
import ModalLoginUsuario from "./modals/ModalLoginUsuario";
import TarjetaUsuario from "./cards/TarjetaUsuario";

import { useUsuario } from "../context/UsuarioContext";
import { logo } from "../../../shared/assets";

export default function SelectorUsuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const loginModal = useDisclosure();

  const { login } = useUsuario();

  const {
    isOpen,
    onOpen,
    onClose,
  } = useDisclosure();

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {

  try {

    const data =
      await obtenerUsuariosLogin();

    setUsuarios(
      data
    );

  } catch (error) {

    console.error(
      error
    );

  }

};

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br,#1a2435,#111827,#090d14)"
      backgroundSize="cover"
      backgroundPosition="center"
      position="relative"
      overflow="hidden"
      color="white"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <VStack spacing={14}>

        {/* LOGO */}

        <ScaleFade
          initialScale={0.9}
          in={true}
        >
          <Box opacity={0.95}>
            <img
              src={logo}
              width="70"
            />
          </Box>
        </ScaleFade>

        {/* TITULO */}

        <ScaleFade
          in={true}
          initialScale={0.9}
        >
          <VStack spacing={3}>

            <Text
              color="gray.400"
              fontSize="md"
            >
              Somos mas que una imprenta!
            </Text>

            <Heading
              fontWeight="400"
              size="xl"
            >
              ¿Quién usará el sistema?
            </Heading>

          </VStack>
        </ScaleFade>

        {/* USUARIOS */}

        <Wrap
          spacing={100}
          justify="center"
        >
          {usuarios.map((usuario, index) => (
            <WrapItem
              key={usuario._id}
            >
              <ScaleFade
                in={true}
                initialScale={0.8}
              >
                <TarjetaUsuario
                  usuario={usuario}
                  onClick={() => {     
                    setUsuarioSeleccionado(usuario);
                    loginModal.onOpen();
                  }}
                />
              </ScaleFade>
            </WrapItem>
          ))}
        </Wrap>
      </VStack>

      <ModalNuevoUsuario
        isOpen={isOpen}
        onClose={onClose}
        onUsuarioCreado={cargarUsuarios}
      />

      <ModalLoginUsuario
        isOpen={loginModal.isOpen}
        onClose={loginModal.onClose}
        usuario={usuarioSeleccionado}
      />

    </Box>
    
  );
}