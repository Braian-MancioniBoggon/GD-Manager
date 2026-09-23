import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormControl,
  FormLabel,
  SimpleGrid,
  Box,
  Text,
  VStack,
  HStack,
  Image,
  useToast,
  Alert,
  AlertIcon,
  Icon,
} from "@chakra-ui/react";

import {
  FiUser,
  FiLock,
  FiLogOut,
  FiCheck,
  FiUserCheck,
} from "react-icons/fi";

import {
  imgUsuario,
  logo,
} from "../../../../shared/assets";

import {
  useEffect,
  useState,
} from "react";

import {
  editarMiPerfil,
  cambiarMiPassword,
} from "../../services/usuarioService";

import {
  useUsuario,
} from "../../context/UsuarioContext";

// =====================================================
// COLORES DISPONIBLES
// =====================================================

const colores = [
  "#E20A19",
  "#3182CE",
  "#38A169",
  "#D69E2E",
  "#805AD5",
  "#DD6B20",
  "#D53F8C",
  "#319795",
];

// =====================================================
// AVATARES DISPONIBLES
// =====================================================

const avatares = [
  {
    id: "logo",
    nombre: "Logo",
    descripcion: "Logo de Stock Papel",
    imagen: logo,
  },
  {
    id: "usuario",
    nombre: "Usuario",
    descripcion: "Avatar predeterminado",
    imagen: imgUsuario,
  },
];

// =====================================================
// COMPONENTE
// =====================================================

export default function ModalMiPerfil({
  isOpen,
  onClose,
}) {

  const toast = useToast();

  const {
    usuarioActual,
    actualizarUsuarioActual,
    logout,
  } = useUsuario();

  // ===================================================
  // DATOS DEL PERFIL
  // ===================================================

  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    color,
    setColor,
  ] = useState("");

  const [
    avatar,
    setAvatar,
  ] = useState("logo");

  // ===================================================
  // DATOS CONTRASEÑA
  // ===================================================

  const [
    passwordActual,
    setPasswordActual,
  ] = useState("");

  const [
    nuevaPassword,
    setNuevaPassword,
  ] = useState("");

  const [
    repetirPassword,
    setRepetirPassword,
  ] = useState("");

  const [
    guardandoPerfil,
    setGuardandoPerfil,
  ] = useState(false);

  const [
    cambiandoPassword,
    setCambiandoPassword,
  ] = useState(false);

  // ===================================================
  // CARGAR DATOS DEL USUARIO
  // ===================================================

  useEffect(() => {

    if (!isOpen || !usuarioActual) {
      return;
    }

    setNombre(
      usuarioActual.nombre || ""
    );

    setColor(
      usuarioActual.color || "#E20A19"
    );

    setAvatar(
      usuarioActual.avatar || "logo"
    );

    setPasswordActual("");
    setNuevaPassword("");
    setRepetirPassword("");

  }, [
    isOpen,
    usuarioActual,
  ]);

  // ===================================================
  // GUARDAR PERFIL
  // ===================================================

  const guardarPerfil = async () => {

    if (!nombre.trim()) {

      toast({
        title: "Nombre obligatorio",
        description:
          "El nombre no puede estar vacío.",
        status: "warning",
      });

      return;
    }

    try {

      setGuardandoPerfil(true);

      const usuario =
        await editarMiPerfil({

          nombre:
            nombre.trim(),

          color,

          avatar,

        });

      actualizarUsuarioActual(
        usuario
      );

      toast({
        title: "Perfil actualizado",
        status: "success",
      });

    } catch (error) {

      toast({
        title: "Error",
        description:
          error.response
            ?.data
            ?.mensaje ||
          "No se pudo actualizar el perfil.",
        status: "error",
      });

    } finally {

      setGuardandoPerfil(false);

    }

  };

  // ===================================================
  // CAMBIAR CONTRASEÑA
  // ===================================================

  const guardarPassword = async () => {

    if (
      !passwordActual ||
      !nuevaPassword ||
      !repetirPassword
    ) {

      toast({
        title: "Completa todos los campos",
        status: "warning",
      });

      return;
    }

    if (
      nuevaPassword.length < 4
    ) {

      toast({
        title:
          "Contraseña demasiado corta",
        description:
          "La contraseña debe tener al menos 4 caracteres.",
        status: "warning",
      });

      return;
    }

    if (
      nuevaPassword !==
      repetirPassword
    ) {

      toast({
        title:
          "Las contraseñas no coinciden",
        status: "warning",
      });

      return;
    }

    try {

      setCambiandoPassword(true);

      await cambiarMiPassword(
        passwordActual,
        nuevaPassword
      );

      toast({
        title:
          "Contraseña actualizada",
        description:
          "Tu contraseña fue cambiada correctamente.",
        status: "success",
      });

      setPasswordActual("");
      setNuevaPassword("");
      setRepetirPassword("");

    } catch (error) {

      toast({
        title:
          "No se pudo cambiar la contraseña",
        description:
          error.response
            ?.data
            ?.mensaje ||
          "La contraseña actual no es correcta.",
        status: "error",
      });

    } finally {

      setCambiandoPassword(false);

    }

  };

  // ===================================================
  // CERRAR SESIÓN
  // ===================================================

  const cerrarSesion = () => {

    onClose();

    logout();

  };

  // ===================================================
  // ESTILOS
  // ===================================================

  const tarjeta = {
    border: "1px solid",
    borderColor: "gray.200",
    borderRadius: "lg",
    bg: "gray.50",
  };

  const inputStyle = {
    bg: "white",
    borderColor: "gray.200",
    color: "gray.800",

    _hover: {
      borderColor: "gray.300",
    },

    _focus: {
      borderColor: "#E20A19",
      boxShadow:
        "0 0 0 1px #E20A19",
    },
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (

    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="lg"
      scrollBehavior="inside"
    >

      <ModalOverlay
        bg="blackAlpha.600"
      />

      <ModalContent
        bg="white"
        color="gray.800"
        borderRadius="xl"
        border="1px solid"
        borderColor="gray.200"
        overflow="hidden"
        boxShadow="xl"
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <ModalHeader
          px={6}
          py={5}
          borderBottom="1px solid"
          borderColor="gray.200"
          bg="white"
        >

          <HStack
            spacing={4}
          >

            {/* ICONO */}

            <Box
              boxSize="44px"
              borderRadius="lg"
              bg={`${color}12`}
              border="1px solid"
              borderColor={`${color}40`}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >

              <Icon
                as={FiUser}
                boxSize={21}
                color={color}
              />

            </Box>

            {/* TITULO */}

            <Box>

              <Text
                fontSize="xl"
                fontWeight="700"
                color="gray.800"
              >
                Mi perfil
              </Text>

              <Text
                fontSize="sm"
                color="gray.500"
                fontWeight="400"
              >
                Configuración de tu usuario
              </Text>

            </Box>

          </HStack>

        </ModalHeader>

        {/* =================================================
            BODY
        ================================================= */}

        <ModalBody
          px={6}
          py={6}
          bg="white"
        >

          <VStack
            spacing={5}
            align="stretch"
          >

            {/* =================================================
                INFORMACIÓN PERSONAL
            ================================================= */}

            <Box
              {...tarjeta}
              overflow="hidden"
            >

              {/* ENCABEZADO */}

              <Box
                px={5}
                py={4}
                borderBottom="1px solid"
                borderColor="gray.200"
                bg="white"
              >

                <HStack
                  spacing={3}
                >

                  <Box
                    boxSize="36px"
                    borderRadius="md"
                    bg="gray.100"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >

                    <Icon
                      as={FiUserCheck}
                      color="gray.600"
                    />

                  </Box>

                  <Box>

                    <Text
                      fontSize="md"
                      fontWeight="600"
                      color="gray.800"
                    >
                      Información personal
                    </Text>

                    <Text
                      fontSize="xs"
                      color="gray.500"
                    >
                      Personalizá la apariencia de tu usuario
                    </Text>

                  </Box>

                </HStack>

              </Box>

              {/* CONTENIDO */}

              <VStack
                align="stretch"
                spacing={5}
                p={5}
              >

                {/* AVATAR + NOMBRE */}

                <HStack
                  spacing={4}
                  align="center"
                >

                  <Box
                    boxSize="64px"
                    flexShrink={0}
                    borderRadius="full"
                    border="3px solid"
                    borderColor={color}
                    bg={color}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    overflow="hidden"
                    transition="all .2s"
                    boxShadow={`0 2px 8px ${color}40`}
                  >

                    <Image
                      src={
                        avatar === "logo"
                          ? logo
                          : imgUsuario
                      }
                      boxSize="46px"
                      objectFit="contain"
                    />

                  </Box>

                  <FormControl>

                    <FormLabel
                      fontSize="xs"
                      color="gray.500"
                      mb={1}
                    >
                      Nombre de usuario
                    </FormLabel>

                    <Input
                      size="sm"
                      value={nombre}
                      onChange={(e) =>
                        setNombre(
                          e.target.value
                        )
                      }
                      {...inputStyle}
                    />

                  </FormControl>

                </HStack>

                {/* AVATARES */}

                <Box>

                  <Text
                    fontSize="xs"
                    color="gray.500"
                    mb={2}
                  >
                    Avatar
                  </Text>

                  <SimpleGrid
                    columns={2}
                    spacing={3}
                  >

                    {avatares.map(
                      (item) => {

                        const seleccionado =
                          avatar === item.id;

                        return (

                          <Box
                            key={item.id}
                            {...tarjeta}
                            p={3}
                            cursor="pointer"
                            borderColor={
                              seleccionado
                                ? color
                                : "gray.200"
                            }
                            bg={
                              seleccionado
                                ? `${color}08`
                                : "gray.50"
                            }
                            transition="all .15s"
                            _hover={{
                              borderColor:
                                seleccionado
                                  ? color
                                  : "gray.300",
                              bg:
                                "gray.100",
                            }}
                            onClick={() =>
                              setAvatar(
                                item.id
                              )
                            }
                          >

                            <HStack
                              spacing={3}
                            >

                              <Box
                                boxSize="42px"
                                borderRadius="md"
                                bg="white"
                                border="1px solid"
                                borderColor="gray.200"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >

                                <Image
                                  src={
                                    item.imagen
                                  }
                                  boxSize="30px"
                                  objectFit="contain"
                                />

                              </Box>

                              <Box
                                flex="1"
                              >

                                <Text
                                  fontSize="sm"
                                  fontWeight="600"
                                  color="gray.800"
                                >
                                  {item.nombre}
                                </Text>

                                <Text
                                  fontSize="xs"
                                  color="gray.500"
                                >
                                  {item.descripcion}
                                </Text>

                              </Box>

                              {seleccionado && (

                                <Box
                                  boxSize="22px"
                                  borderRadius="full"
                                  bg={color}
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                >

                                  <Icon
                                    as={FiCheck}
                                    boxSize={13}
                                    color="white"
                                  />

                                </Box>

                              )}

                            </HStack>

                          </Box>

                        );

                      }
                    )}

                  </SimpleGrid>

                </Box>

                {/* COLOR */}

                <Box>

                  <Text
                    fontSize="xs"
                    color="gray.500"
                    mb={2}
                  >
                    Color del perfil
                  </Text>

                  <HStack
                    spacing={2}
                  >

                    {colores.map(
                      (item) => {

                        const seleccionado =
                          color === item;

                        return (

                          <Box
                            key={item}
                            boxSize="32px"
                            bg={item}
                            borderRadius="md"
                            cursor="pointer"
                            border="2px solid"
                            borderColor={
                              seleccionado
                                ? "gray.800"
                                : "transparent"
                            }
                            boxShadow={
                              seleccionado
                                ? `0 0 0 1px white`
                                : "none"
                            }
                            transition="all .15s"
                            _hover={{
                              transform:
                                "scale(1.1)",
                            }}
                            onClick={() =>
                              setColor(item)
                            }
                          />

                        );

                      }
                    )}

                  </HStack>

                </Box>

                {/* GUARDAR */}

                <Button
                  size="sm"
                  bg="#E20A19"
                  color="white"
                  onClick={
                    guardarPerfil
                  }
                  isLoading={
                    guardandoPerfil
                  }
                  _hover={{
                    bg: "#C80916",
                  }}
                >
                  Guardar cambios
                </Button>

              </VStack>

            </Box>

            {/* =================================================
                SEGURIDAD
            ================================================= */}

            <Box
              {...tarjeta}
              overflow="hidden"
            >

              {/* ENCABEZADO */}

              <Box
                px={5}
                py={4}
                borderBottom="1px solid"
                borderColor="gray.200"
                bg="white"
              >

                <HStack
                  spacing={3}
                >

                  <Box
                    boxSize="36px"
                    borderRadius="md"
                    bg="gray.100"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >

                    <Icon
                      as={FiLock}
                      color="gray.600"
                    />

                  </Box>

                  <Box>

                    <Text
                      fontSize="md"
                      fontWeight="600"
                      color="gray.800"
                    >
                      Seguridad
                    </Text>

                    <Text
                      fontSize="xs"
                      color="gray.500"
                    >
                      Cambiá tu contraseña de acceso
                    </Text>

                  </Box>

                </HStack>

              </Box>

              {/* CONTENIDO */}

              <VStack
                align="stretch"
                spacing={4}
                p={5}
              >

                <FormControl>

                  <FormLabel
                    fontSize="xs"
                    color="gray.500"
                  >
                    Contraseña actual
                  </FormLabel>

                  <Input
                    type="password"
                    size="sm"
                    value={
                      passwordActual
                    }
                    onChange={(e) =>
                      setPasswordActual(
                        e.target.value
                      )
                    }
                    {...inputStyle}
                  />

                </FormControl>

                <FormControl>

                  <FormLabel
                    fontSize="xs"
                    color="gray.500"
                  >
                    Nueva contraseña
                  </FormLabel>

                  <Input
                    type="password"
                    size="sm"
                    value={
                      nuevaPassword
                    }
                    onChange={(e) =>
                      setNuevaPassword(
                        e.target.value
                      )
                    }
                    {...inputStyle}
                  />

                </FormControl>

                <FormControl>

                  <FormLabel
                    fontSize="xs"
                    color="gray.500"
                  >
                    Repetir contraseña
                  </FormLabel>

                  <Input
                    type="password"
                    size="sm"
                    value={
                      repetirPassword
                    }
                    onChange={(e) =>
                      setRepetirPassword(
                        e.target.value
                      )
                    }
                    {...inputStyle}
                  />

                </FormControl>

                <Alert
                  status="info"
                  borderRadius="md"
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  fontSize="xs"
                  color="gray.600"
                >

                  <AlertIcon />

                  La contraseña actual es necesaria
                  para realizar el cambio.

                </Alert>

                <Button
                  size="sm"
                  variant="outline"
                  borderColor="gray.300"
                  color="gray.700"
                  onClick={
                    guardarPassword
                  }
                  isLoading={
                    cambiandoPassword
                  }
                  _hover={{
                    bg: "gray.100",
                    borderColor:
                      "gray.400",
                  }}
                >
                  Cambiar contraseña
                </Button>

              </VStack>

            </Box>

          </VStack>

        </ModalBody>

        {/* =================================================
            FOOTER
        ================================================= */}

        <ModalFooter
          px={6}
          py={4}
          borderTop="1px solid"
          borderColor="gray.200"
          bg="gray.50"
        >

          <HStack
            w="100%"
            justify="space-between"
          >

            <Button
              size="sm"
              variant="ghost"
              color="red.600"
              leftIcon={
                <Icon
                  as={FiLogOut}
                />
              }
              onClick={
                cerrarSesion
              }
              _hover={{
                bg: "red.50",
                color: "red.700",
              }}
            >
              Cerrar sesión
            </Button>

            <Button
              size="sm"
              variant="ghost"
              color="gray.600"
              onClick={onClose}
              _hover={{
                bg: "gray.200",
                color: "gray.800",
              }}
            >
              Cerrar
            </Button>

          </HStack>

        </ModalFooter>

      </ModalContent>

    </Modal>

  );
}