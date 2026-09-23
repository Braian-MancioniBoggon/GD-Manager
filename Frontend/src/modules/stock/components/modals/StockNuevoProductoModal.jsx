import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  VStack,
  useToast,
  Select,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { crearProducto } from "../../services/productoService";
import { useStock } from "../../context/StockContext";

export default function StockNuevoProductoModal({
  isOpen,
  onClose,
  onProductoCreado,
}) {
  const toast = useToast();
  const { refrescarStock } = useStock();

  const [tipo, setTipo] = useState("");
  const [prioridad, setPrioridad] = useState("2");
  const [gramaje, setGramaje] = useState("");
  const [anchoCm, setAnchoCm] = useState("");
  const [altoCm, setAltoCm] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");

  useEffect(() => {
    if (!isOpen) {
      limpiarFormulario();
    }
  }, [isOpen]);

  const limpiarFormulario = () => {
    setTipo("");
    setPrioridad(2);
    setGramaje("");
    setAnchoCm("");
    setAltoCm("");
    setStockMinimo("");
  };

  const guardarProducto = async () => {
    try {
      await crearProducto({
        tipo,
        prioridad,
        gramaje: Number(gramaje),
        anchoCm: Number(anchoCm),
        altoCm: Number(altoCm),
        stockMinimo: Number(stockMinimo),
      });

      toast({
        title: "Producto creado",
        status: "success",
        duration: 2500,
      });

      refrescarStock();
      onClose();
    } catch (error) {
      toast({
        title:
          error.response?.data?.mensaje ||
          "Error",
        status: "error",
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>
          Nuevo Papel
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>
                Tipo
              </FormLabel>

              <Input
                value={tipo}
                onChange={(e) =>
                  setTipo(
                    e.target.value
                  )
                }
              />
            </FormControl>

            <FormControl>
                <FormLabel>
                    Prioridad
                </FormLabel>

                <Select
                    value={prioridad}
                    onChange={(e)=>
                        setPrioridad(
                            Number(e.target.value)
                        )
                    }
                >
                    <option value={1}>
                        A - Muy importante
                    </option>
                    <option value={2}>
                        B - Normal
                    </option>
                    <option value={3}>
                        C - Baja
                    </option>
                </Select>
                  
            </FormControl>

            <FormControl>
              <FormLabel>
                Gramaje
              </FormLabel>

              <NumberInput>
                <NumberInputField
                  value={gramaje}
                  onChange={(e) =>
                    setGramaje(
                      e.target.value
                    )
                  }
                />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>
                Ancho (cm)
              </FormLabel>

              <NumberInput>
                <NumberInputField
                  value={anchoCm}
                  onChange={(e) =>
                    setAnchoCm(
                      e.target.value
                    )
                  }
                />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>
                Alto (cm)
              </FormLabel>

              <NumberInput>
                <NumberInputField
                  value={altoCm}
                  onChange={(e) =>
                    setAltoCm(
                      e.target.value
                    )
                  }
                />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>
                Stock mínimo
              </FormLabel>

              <NumberInput>
                <NumberInputField
                  value={stockMinimo}
                  onChange={(e) =>
                    setStockMinimo(
                      e.target.value
                    )
                  }
                />
              </NumberInput>
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
            onClick={
              guardarProducto
            }
          >
            Guardar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}