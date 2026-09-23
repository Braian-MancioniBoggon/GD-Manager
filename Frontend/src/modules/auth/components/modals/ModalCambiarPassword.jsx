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
VStack,
useToast,
InputGroup,
InputRightElement,
} from "@chakra-ui/react";

import {
useEffect,
useState,
} from "react";

import {
cambiarMiPassword,
} from "../../services/usuarioService";

export default function ModalCambiarPassword({
isOpen,
onClose,
}) {

const toast = useToast();

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
mostrarActual,
setMostrarActual,
] = useState(false);

const [
mostrarNueva,
setMostrarNueva,
] = useState(false);

const [
mostrarRepetir,
setMostrarRepetir,
] = useState(false);

useEffect(() => {

if (isOpen) {

  setPasswordActual("");
  setNuevaPassword("");
  setRepetirPassword("");

  setMostrarActual(false);
  setMostrarNueva(false);
  setMostrarRepetir(false);

}

}, [isOpen]);

const guardar = async () => {

if (!passwordActual || !nuevaPassword) {

  toast({
    title: "Campos incompletos",
    description:
      "Debés completar la contraseña actual y la nueva contraseña.",
    status: "warning",
  });

  return;

}

if (nuevaPassword.length < 4) {

  toast({
    title: "Contraseña demasiado corta",
    description:
      "La nueva contraseña debe tener al menos 4 caracteres.",
    status: "warning",
  });

  return;

}

if (nuevaPassword !== repetirPassword) {

  toast({
    title: "Las contraseñas no coinciden",
    description:
      "Verificá la nueva contraseña.",
    status: "warning",
  });

  return;

}

if (passwordActual === nuevaPassword) {

  toast({
    title: "Contraseña inválida",
    description:
      "La nueva contraseña debe ser diferente a la actual.",
    status: "warning",
  });

  return;

}

try {

  await cambiarMiPassword(
    passwordActual,
    nuevaPassword
  );

  toast({
    title: "Contraseña actualizada",
    description:
      "Tu contraseña fue cambiada correctamente.",
    status: "success",
  });

  setPasswordActual("");
  setNuevaPassword("");
  setRepetirPassword("");

  onClose();

} catch (error) {

  toast({
    title: "No se pudo cambiar la contraseña",
    description:
      error.response?.data?.mensaje ||
      "Ocurrió un error al cambiar la contraseña.",
    status: "error",
  });

}

};

const cerrar = () => {

setPasswordActual("");
setNuevaPassword("");
setRepetirPassword("");

setMostrarActual(false);
setMostrarNueva(false);
setMostrarRepetir(false);

onClose();

};

return (

<Modal
  isOpen={isOpen}
  onClose={cerrar}
  isCentered
>

  <ModalOverlay />

  <ModalContent>

    <ModalHeader>
      Cambiar contraseña
    </ModalHeader>

    <ModalBody>

      <VStack spacing={4}>

        {/* CONTRASEÑA ACTUAL */}

        <FormControl>

          <FormLabel>
            Contraseña actual
          </FormLabel>

          <InputGroup>

            <Input
              type={
                mostrarActual
                  ? "text"
                  : "password"
              }
              value={
                passwordActual
              }
              onChange={(e) =>
                setPasswordActual(
                  e.target.value
                )
              }
            />

            <InputRightElement
              width="4.5rem"
            >

              <Button
                h="1.75rem"
                size="sm"
                onClick={() =>
                  setMostrarActual(
                    !mostrarActual
                  )
                }
              >
                {mostrarActual
                  ? "Ocultar"
                  : "Ver"}
              </Button>

            </InputRightElement>

          </InputGroup>

        </FormControl>

        {/* NUEVA CONTRASEÑA */}

        <FormControl>

          <FormLabel>
            Nueva contraseña
          </FormLabel>

          <InputGroup>

            <Input
              type={
                mostrarNueva
                  ? "text"
                  : "password"
              }
              value={
                nuevaPassword
              }
              onChange={(e) =>
                setNuevaPassword(
                  e.target.value
                )
              }
            />

            <InputRightElement
              width="4.5rem"
            >

              <Button
                h="1.75rem"
                size="sm"
                onClick={() =>
                  setMostrarNueva(
                    !mostrarNueva
                  )
                }
              >
                {mostrarNueva
                  ? "Ocultar"
                  : "Ver"}
              </Button>

            </InputRightElement>

          </InputGroup>

        </FormControl>

        {/* REPETIR CONTRASEÑA */}

        <FormControl>

          <FormLabel>
            Repetir nueva contraseña
          </FormLabel>

          <InputGroup>

            <Input
              type={
                mostrarRepetir
                  ? "text"
                  : "password"
              }
              value={
                repetirPassword
              }
              onChange={(e) =>
                setRepetirPassword(
                  e.target.value
                )
              }
            />

            <InputRightElement
              width="4.5rem"
            >

              <Button
                h="1.75rem"
                size="sm"
                onClick={() =>
                  setMostrarRepetir(
                    !mostrarRepetir
                  )
                }
              >
                {mostrarRepetir
                  ? "Ocultar"
                  : "Ver"}
              </Button>

            </InputRightElement>

          </InputGroup>

        </FormControl>

      </VStack>

    </ModalBody>

    <ModalFooter>

      <Button
        mr={3}
        onClick={cerrar}
      >
        Cancelar
      </Button>

      <Button
        colorScheme="blue"
        onClick={guardar}
      >
        Cambiar contraseña
      </Button>

    </ModalFooter>

  </ModalContent>

</Modal>

);

}