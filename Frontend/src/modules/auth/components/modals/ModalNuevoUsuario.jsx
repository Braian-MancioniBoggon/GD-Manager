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
Text,
} from "@chakra-ui/react";

import {
useEffect,
useState,
} from "react";

import {
crearUsuario,
obtenerRoles,
} from "../../services/usuarioService";

const colores =
[
"#E20A19",
"#3182CE",
"#38A169",
"#D69E2E",
"#805AD5",
"#DD6B20",
"#D53F8C",
"#319795",
];

export default function ModalNuevoUsuario({
isOpen,
onClose,
onUsuarioCreado,
}) {

const toast =
useToast();

const [
nombre,
setNombre,
] =
useState("");

const [
password,
setPassword,
] =
useState("");

const [
color,
setColor,
] =
useState(
"#E20A19"
);

const [
avatar,
setAvatar,
] =
useState(
"logo"
);

const [
rol,
setRol,
] =
useState(
"guillotinista"
);

const [
roles,
setRoles,
] =
useState([]);

const [
guardando,
setGuardando,
] =
useState(false);

useEffect(
() => {

  if (
    !isOpen
  ) {
    return;
  }

  cargarRoles();

},
[isOpen]

);

const cargarRoles =
async () => {

  try {

    const data =
      await obtenerRoles();

    setRoles(
      data
    );

  } catch (
    error
  ) {

    console.error(
      error
    );

  }

};

const limpiar =
() => {

  setNombre("");

  setPassword("");

  setColor(
    "#E20A19"
  );

  setAvatar(
    "logo"
  );

  setRol(
    "guillotinista"
  );

};

const guardar =
async () => {

  if (
    !nombre.trim() ||
    !password
  ) {

    toast({
      title:
        "Completá los campos obligatorios",

      status:
        "warning",
    });

    return;

  }

  try {

    setGuardando(
      true
    );

    await crearUsuario({

      nombre:
        nombre.trim(),

      password,

      color,

      avatar,

      rol,

      permisosOtorgados:
        [],

      permisosRevocados:
        [],

    });

    toast({
      title:
        "Usuario creado",

      status:
        "success",
    });

    limpiar();

    await onUsuarioCreado();

    onClose();

  } catch (
    error
  ) {

    toast({
      title:
        "Error",

      description:
        error.response
          ?.data
          ?.mensaje ||
        "No se pudo crear el usuario",

      status:
        "error",
    });

  } finally {

    setGuardando(
      false
    );

  }

};

return (
<Modal
isOpen={
isOpen
}
onClose={
onClose
}
isCentered
>

  <ModalOverlay />

  <ModalContent>

    <ModalHeader>
      Nuevo usuario
    </ModalHeader>

    <ModalBody>

      <VStack
        spacing={4}
      >

        <FormControl>
          <FormLabel>
            Nombre
          </FormLabel>

          <Input
            value={
              nombre
            }
            onChange={
              (e) =>
                setNombre(
                  e.target.value
                )
            }
          />
        </FormControl>

        <FormControl>
          <FormLabel>
            Contraseña
          </FormLabel>

          <Input
            type="password"
            value={
              password
            }
            onChange={
              (e) =>
                setPassword(
                  e.target.value
                )
            }
          />
        </FormControl>

        <FormControl>
          <FormLabel>
            Rol
          </FormLabel>

          <Select
            value={
              rol
            }
            onChange={
              (e) =>
                setRol(
                  e.target.value
                )
            }
          >

            {roles
              .filter(
                (item) => item.activo
              )
              .map(
                (item) => (

                <option
                  key={
                    item._id
                  }
                  value={
                    item._id
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
                    color ===
                    item
                      ? "black"
                      : "transparent"
                  }
                  onClick={
                    () =>
                      setColor(
                        item
                      )
                  }
                />

              )
            )}

          </SimpleGrid>

        </FormControl>

        <FormControl>
          <FormLabel>
            Avatar
          </FormLabel>

          <Select
            value={
              avatar
            }
            onChange={
              (e) =>
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
        Crear usuario
      </Button>

    </ModalFooter>

  </ModalContent>

</Modal>

);

}