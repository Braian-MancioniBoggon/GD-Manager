import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Switch,
  VStack,
  useToast,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";

import {
  actualizarProducto,
} from "../services/configuracionService";

import { useStock } from "../../stock/context/StockContext";

export default function EditarProductoModal({
  isOpen,
  onClose,
  producto,
}) {

  const toast = useToast();
  
  const {
    refrescarStock,
  } = useStock();

  const [gramaje, setGramaje] =
    useState("");

  const [anchoCm, setAnchoCm] =
    useState("");

  const [altoCm, setAltoCm] =
    useState("");

  const [stockMinimo, setStockMinimo] =
    useState("");

  const [prioridad, setPrioridad] =
    useState("2");

  const [activo, setActivo] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);


  useEffect(() => {

    if (!producto) {
      return;
    }

    setGramaje(
      producto.productoId.gramaje
    );

    setAnchoCm(
      producto.productoId.anchoCm
    );

    setAltoCm(
      producto.productoId.altoCm
    );

    setStockMinimo(
      producto.productoId.stockMinimo
    );

    setPrioridad(
      String(
        producto.productoId.prioridad ?? 2
      )
    );

    setActivo(
      producto.productoId.activo ?? true
    );

  }, [producto]);


  async function guardar() {

    if (!producto) {
      return;
    }

    try {

      setGuardando(true);

      await actualizarProducto(
        producto.productoId._id,
        {
          gramaje: Number(gramaje),
          anchoCm: Number(anchoCm),
          altoCm: Number(altoCm),
          stockMinimo: Number(stockMinimo),
          prioridad: Number(prioridad),
          activo,
        }
      );
      refrescarStock();
      //await refrescarStock();

      toast({
        title: "Producto actualizado",
        description:
          "Los datos se actualizaron correctamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();

    } catch (error) {

      console.error(error);

      toast({
        title: "Error",
        description:
          error.response?.data?.mensaje ||
          "No se pudo actualizar el producto.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });

    } finally {

      setGuardando(false);

    }

  }


  if (!producto) {
    return null;
  }


  const datos =
    producto.productoId;


  return (

    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >

      <ModalOverlay />

      <ModalContent>

        <ModalHeader>
          Editar papel
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody>

          <VStack
            spacing={4}
            align="stretch"
          >

            <FormControl>
              <FormLabel>
                Tipo
              </FormLabel>

              <Input
                value={datos.tipo}
                isReadOnly
                bg="gray.100"
              />
            </FormControl>


            <FormControl>
              <FormLabel>
                Gramaje
              </FormLabel>

              <Input
                type="number"
                value={gramaje}
                onChange={(e) =>
                  setGramaje(e.target.value)
                }
              />
            </FormControl>


            <FormControl>
              <FormLabel>
                Ancho (cm)
              </FormLabel>

              <Input
                type="number"
                value={anchoCm}
                onChange={(e) =>
                  setAnchoCm(e.target.value)
                }
              />
            </FormControl>


            <FormControl>
              <FormLabel>
                Alto (cm)
              </FormLabel>

              <Input
                type="number"
                value={altoCm}
                onChange={(e) =>
                  setAltoCm(e.target.value)
                }
              />
            </FormControl>


            <FormControl>
              <FormLabel>
                Stock mínimo
              </FormLabel>

              <Input
                type="number"
                value={stockMinimo}
                onChange={(e) =>
                  setStockMinimo(e.target.value)
                }
              />
            </FormControl>


            <FormControl>
              <FormLabel>
                Prioridad
              </FormLabel>

              <Select
                value={prioridad}
                onChange={(e) =>
                  setPrioridad(e.target.value)
                }
              >
                <option value="1">
                  A - Alta
                </option>

                <option value="2">
                  B - Media
                </option>

                <option value="3">
                  C - Baja
                </option>
              </Select>
            </FormControl>


            <FormControl
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >

              <FormLabel
                mb="0"
              >
                Variante activa
              </FormLabel>

              <Switch
                isChecked={activo}
                onChange={(e) =>
                  setActivo(
                    e.target.checked
                  )
                }
              />

            </FormControl>

          </VStack>

        </ModalBody>


        <ModalFooter>

          <Button
            mr={3}
            onClick={onClose}
            isDisabled={guardando}
          >
            Cancelar
          </Button>

          <Button
            colorScheme="blue"
            onClick={guardar}
            isLoading={guardando}
          >
            Guardar cambios
          </Button>

        </ModalFooter>

      </ModalContent>

    </Modal>

  );

}