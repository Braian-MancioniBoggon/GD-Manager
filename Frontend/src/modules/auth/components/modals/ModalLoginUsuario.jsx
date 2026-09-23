import {
Modal,
ModalOverlay,
ModalContent,
ModalBody,
VStack,
Text,
Image,
Input,
Button,
HStack,
useToast,
} from "@chakra-ui/react";

import {
useEffect,
useState,
} from "react";

import {
loginUsuario,
} from "../../services/usuarioService";

import {
useUsuario,
} from "../../context/UsuarioContext";
import { logo } from "../../../../shared/assets";

export default function ModalLoginUsuario({
isOpen,
onClose,
usuario,
}) {

const [
password,
setPassword,
] =
useState("");

const toast =
useToast();

const {
login,
} =
useUsuario();

useEffect(
() => {

  if (isOpen) {

    setPassword("");

  }

},
[isOpen]

);

const ingresar =
async () => {

  if (!usuario) {
    return;
  }

  try {

    const usuarioLogueado =
      await loginUsuario(
        usuario.nombre,
        password
      );

    login(
      usuarioLogueado
    );

    onClose();

  } catch (error) {

    toast({
      title:
        "No se pudo iniciar sesión",

      description:
        error.response
          ?.data
          ?.mensaje ||
        "Contraseña incorrecta",

      status:
        "error",

      duration:
        3000,

      isClosable:
        true,
    });

  }

};

if (!usuario) {
return null;
}

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

  <ModalContent
    bg="#161b22"
    color="white"
    borderRadius="2xl"
  >

    <ModalBody
      py={8}
    >

      <VStack
        spacing={6}
      >

        <Image
          src={
            logo
          }
          boxSize="70px"
        />

        <Text
          fontSize="2xl"
          fontWeight="600"
        >
          {
            usuario.nombre
          }
        </Text>

        <Input
          placeholder={
            "Contraseña"
          }
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
          onKeyDown={
            (e) => {

              if (
                e.key ===
                "Enter"
              ) {

                ingresar();

              }

            }
          }
        />

        <HStack
          w="100%"
        >

          <Button
            w="50%"
            onClick={
              onClose
            }
          >
            Cancelar
          </Button>

          <Button
            w="50%"
            colorScheme="blue"
            onClick={
              ingresar
            }
          >
            Ingresar
          </Button>

        </HStack>

      </VStack>

    </ModalBody>

  </ModalContent>

</Modal>

);

}
