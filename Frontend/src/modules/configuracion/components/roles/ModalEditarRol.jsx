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
  editarRol,
  obtenerPermisos,
} from "../../../auth/services/usuarioService";
import SelectorPermisos from "../roles/SelectorPermisos";

export default function ModalEditarRol({

  isOpen,

  onClose,

  rol,

  onGuardado,

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

    if (
      !isOpen ||
      !rol
    ) {

      return;

    }

    setNombre(
      rol.nombre
    );

    setDescripcion(
      rol.descripcion || ""
    );

    setPermisos(rol.permisos || []);

    cargarPermisos();

  }, [
    isOpen,
    rol,
  ]);

  async function guardar() {

    if (
      !nombre.trim()
    ) {

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

      await editarRol(
        rol._id,
        {

          nombre:
            nombre.trim(),

          descripcion,

          permisos,

        }
      );

      toast({

        title:
          "Rol actualizado",

        status:
          "success",

      });

      onGuardado();

    } catch (error) {

      toast({

        title:
          "Error",

        description:

          error.response?.data?.mensaje ||

          "No se pudo actualizar",

        status:
          "error",

      });

    } finally {

      setGuardando(
        false
      );

    }

  }

  async function cargarPermisos() {

  try {

    const data =
      await obtenerPermisos();

    setPermisosDisponibles(data);

  } catch (error) {

    console.error(error);

  }

}

  return (

    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >

      <ModalOverlay />

      <ModalContent>

        <ModalHeader>

          Editar Rol

        </ModalHeader>

        <ModalBody>

          <VStack spacing={4}>

            <FormControl>

              <FormLabel>

                Nombre

              </FormLabel>

              <Input

                value={nombre}

                onChange={(e)=>

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

                value={descripcion}

                onChange={(e)=>

                  setDescripcion(
                    e.target.value
                  )

                }

              />

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

            isLoading={
              guardando
            }

            onClick={guardar}

          >

            Guardar

          </Button>

        </ModalFooter>

      </ModalContent>

    </Modal>

  );

}