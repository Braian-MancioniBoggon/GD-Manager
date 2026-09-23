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
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";

import {
  useEffect,
  useState,
} from "react";

import {
  crearRol,
  obtenerPermisos,
} from "../../../auth/services/usuarioService";

import SelectorPermisos from "../roles/SelectorPermisos";

export default function ModalNuevoRol({

  isOpen,

  onClose,

  onRolCreado,

}) {

  const toast =
    useToast();

  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    descripcion,
    setDescripcion,
  ] = useState("");

  const [
    permisos,
    setPermisos,
  ] = useState([]);

  const [
    permisosDisponibles,
    setPermisosDisponibles,
  ] = useState([]);

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  useEffect(() => {

  if (!isOpen) {
    return;
  }

  cargarPermisos();

}, [isOpen]);

async function cargarPermisos() {

  try {

    const data =
      await obtenerPermisos();

    setPermisosDisponibles(data);

  } catch (error) {

    console.error(error);

  }

}

  async function cargarPermisos() {

    try {

      const data =
        await obtenerPermisos();

      setPermisosDisponibles(
        data
      );

    } catch (error) {

      console.error(error);

    }

  }

  function limpiar() {

    setNombre("");

    setDescripcion("");

    setPermisos([]);

  }

  async function guardar() {

    if (!nombre.trim()) {

      toast({

        title:
          "Ingrese un nombre",

        status:
          "warning",

      });

      return;

    }

    try {

      setGuardando(
        true
      );

      await crearRol({

        nombre:
          nombre.trim(),

        descripcion,

        permisos,

      });

      toast({

        title:
          "Rol creado",

        status:
          "success",

      });

      limpiar();

      await onRolCreado();

      onClose();

    } catch (error) {

      toast({

        title:
          "Error",

        description:

          error.response
            ?.data
            ?.mensaje ||

          "No se pudo crear el rol",

        status:
          "error",

      });

    } finally {

      setGuardando(
        false
      );

    }

  }

  return (

    <Modal

      isOpen={isOpen}

      onClose={onClose}

      size="xl"

      isCentered

    >

      <ModalOverlay />

      <ModalContent>

        <ModalHeader>

          Nuevo Rol

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

                value={nombre}

                onChange={(e) =>

                  setNombre(
                    e.target.value
                  )

                }

              />

            </FormControl>

            <FormControl>

              <FormLabel>

                Descripción

              </FormLabel>

              <Textarea

                value={
                  descripcion
                }

                onChange={(e) =>

                  setDescripcion(
                    e.target.value
                  )

                }

                resize="vertical"

              />

            </FormControl>

            <FormControl>

                <SelectorPermisos

                  permisosDisponibles={
                    permisosDisponibles
                  }
              
                  permisosSeleccionados={
                    permisos
                  }
              
                  onChange={
                    setPermisos
                  }
              
                />

            </FormControl>

          </VStack>

        </ModalBody>

        <ModalFooter>

          <Button

            mr={3}

            onClick={onClose}

          >

            Cancelar

          </Button>

          <Button

            colorScheme="blue"

            isLoading={guardando}

            onClick={guardar}

          >

            Crear Rol

          </Button>

        </ModalFooter>

      </ModalContent>

    </Modal>

  );

}