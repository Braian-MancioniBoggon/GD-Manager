import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  VStack,
  useToast,
  SimpleGrid,
  Box,
} from "@chakra-ui/react";

import {
  useEffect,
  useState,
} from "react";

import {
  editarUsuario,
  obtenerRoles,
} from "../../../auth/services/usuarioService";

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

export default function ModalEditarUsuario({
  isOpen,
  onClose,
  usuario,
  onGuardado,
}) {

  const toast = useToast();

  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    color,
    setColor,
  ] = useState("#E20A19");

  const [
    avatar,
    setAvatar,
  ] = useState("logo");

  const [
    rol,
    setRol,
  ] = useState("");

  const [
    roles,
    setRoles,
  ] = useState([]);

  const [
    guardando,
    setGuardando,
  ] = useState(false);


  // =====================================================
  // CARGAR DATOS DEL USUARIO
  // =====================================================

  useEffect(() => {

    if (!isOpen || !usuario) {
      return;
    }

    setNombre(
      usuario.nombre || ""
    );

    setColor(
      usuario.color || "#E20A19"
    );

    setAvatar(
      usuario.avatar || "logo"
    );

    /*
      IMPORTANTE:

      usuario.rol ahora es un objeto porque
      UsuariosPage hace populate("rol").

      Por eso usamos usuario.rol.nombre.
    */

    setRol(
      usuario.rol?.nombre || ""
    );

    setPassword("");

    cargarRoles();

  }, [
    isOpen,
    usuario,
  ]);


  // =====================================================
  // CARGAR ROLES
  // =====================================================

  async function cargarRoles() {

    try {

      const data =
        await obtenerRoles();

      setRoles(data);

    } catch (error) {

      console.error(
        "Error cargando roles:",
        error
      );

      toast({
        title: "Error",
        description:
          error.response?.data?.mensaje ||
          "No se pudieron cargar los roles",
        status: "error",
      });

    }

  }


  // =====================================================
  // GUARDAR
  // =====================================================

  async function guardar() {

    if (!nombre.trim()) {

      toast({
        title: "Error",
        description:
          "El nombre es obligatorio",
        status: "error",
      });

      return;
    }

    if (!rol) {

      toast({
        title: "Error",
        description:
          "Debés seleccionar un rol",
        status: "error",
      });

      return;
    }

    try {

      setGuardando(true);

      const body = {

        nombre:
          nombre.trim(),

        color,

        avatar,

        /*
          El backend espera el nombre del rol:

          rol: "Administrador"

          NO:
          rol: { _id, nombre, ... }
        */

        rol,

      };

      /*
        La contraseña solamente se manda
        cuando el administrador escribió una nueva.
      */

      if (password.trim()) {

        body.password =
          password;

      }

      console.log(
        "Editando usuario:",
        usuario._id
      );

      console.log(
        "Rol enviado:",
        rol
      );

      console.log(
        "Datos enviados:",
        body
      );

      await editarUsuario(
        usuario._id,
        body
      );

      toast({

        title:
          "Usuario actualizado",

        description:
          `Rol: ${rol}`,

        status:
          "success",

      });

      onGuardado();

    } catch (error) {

      console.error(
        "Error editando usuario:",
        error
      );

      toast({

        title:
          "Error",

        description:
          error.response?.data?.mensaje ||
          "No se pudo actualizar el usuario",

        status:
          "error",

      });

    } finally {

      setGuardando(false);

    }

  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >

      <ModalOverlay />

      <ModalContent>

        <ModalHeader>
          Editar usuario
        </ModalHeader>


        <ModalBody>

          <VStack spacing={4}>


            {/* NOMBRE */}

            <FormControl>

              <FormLabel>
                Nombre
              </FormLabel>

              <Input

                value={
                  nombre
                }

                onChange={(e) =>
                  setNombre(
                    e.target.value
                  )
                }

              />

            </FormControl>


            {/* CONTRASEÑA */}

            <FormControl>

              <FormLabel>
                Nueva contraseña
              </FormLabel>

              <Input

                type="password"

                placeholder="Dejar vacío para no cambiar"

                value={
                  password
                }

                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }

              />

            </FormControl>


            {/* ROL */}

            <FormControl>

              <FormLabel>
                Rol
              </FormLabel>

              <Select

                value={
                  rol
                }

                onChange={(e) =>
                  setRol(
                    e.target.value
                  )
                }

              >

                <option value="">
                  Seleccionar rol
                </option>

                {roles
                  .filter(
                    (item) =>
                      item.activo !== false
                  )
                  .map(
                    (item) => (

                      <option

                        key={
                          item._id
                        }

                        value={
                          item.nombre
                        }

                      >

                        {
                          item.nombre
                        }

                      </option>

                    )
                  )}

              </Select>

            </FormControl>


            {/* COLOR */}

            <FormControl>

              <FormLabel>
                Color
              </FormLabel>

              <SimpleGrid
                columns={4}
                spacing={3}
              >

                {colores.map(
                  (item) => (

                    <Box

                      key={
                        item
                      }

                      h="40px"

                      bg={
                        item
                      }

                      borderRadius="md"

                      cursor="pointer"

                      border="3px solid"

                      borderColor={
                        color === item
                          ? "black"
                          : "transparent"
                      }

                      onClick={() =>
                        setColor(
                          item
                        )
                      }

                    />

                  )
                )}

              </SimpleGrid>

            </FormControl>


            {/* AVATAR */}

            <FormControl>

              <FormLabel>
                Avatar
              </FormLabel>

              <Select

                value={
                  avatar
                }

                onChange={(e) =>
                  setAvatar(
                    e.target.value
                  )
                }

              >

                <option value="logo">
                  Logo
                </option>

                <option value="usuario">
                  Usuario
                </option>

              </Select>

            </FormControl>


          </VStack>

        </ModalBody>


        <ModalFooter>

          <Button
            mr={3}
            onClick={
              onClose
            }
          >
            Cancelar
          </Button>

          <Button

            colorScheme="blue"

            onClick={
              guardar
            }

            isLoading={
              guardando
            }

          >
            Guardar
          </Button>

        </ModalFooter>

      </ModalContent>

    </Modal>

  );

}