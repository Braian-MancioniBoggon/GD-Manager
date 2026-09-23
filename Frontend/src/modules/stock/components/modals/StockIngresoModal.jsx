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
  Select,
  Input,
  VStack,
  useToast,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { obtenerProductos } from "../../services/productoService";
import { ingresarPapel } from "../../services/movimientoService";
import { titulo } from "../../../../shared/utils/formatoTexto";
import { useStock } from "../../context/StockContext";

export default function StockIngresoModal({
  isOpen,
  onClose,
  productoRapido,
}) {
  
  const toast = useToast();
  const [productos, setProductos] = useState([]);
  const [tipo, setTipo] = useState("");
  const [gramaje, setGramaje] = useState("");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [observacion, setObservacion] = useState("");
  const { refrescarStock } = useStock();    

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      limpiarFormulario();
      
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    
    if (productoRapido) {
      setTipo(productoRapido.productoId.tipo);
      setGramaje(
        productoRapido.productoId.gramaje.toString()
      );
      setProductoId(productoRapido.productoId._id);
    } else {
      setTipo("");
      setGramaje("");
      setProductoId("");
    }
  }, [isOpen, productoRapido]);

  const cargarProductos = async () => {
    try {
      const data =
        await obtenerProductos();

      setProductos(
        data.filter((p) => p.activo)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const tipos = [
    ...new Set(
      productos.map((p) => p.tipo)
    ),
  ];

  const gramajes =
    productos.filter(
      (p) => p.tipo === tipo
    );

  const medidas =
    productos.filter(
      (p) =>
        p.tipo === tipo &&
        p.gramaje === Number(gramaje)
    );

  const limpiarFormulario = () => {
    setTipo("");
    setGramaje("");
    setProductoId("");
    setCantidad("");
    setObservacion("");
  };

  const guardarIngreso =
    async () => {
      try {
        await ingresarPapel({
          productoId,
          cantidad: Number(cantidad),
          observacion,
        });

        toast({
          title:
            "Ingreso registrado",
          status: "success",
        });

        refrescarStock();

        onClose();
      } catch (error) {
        toast({
          title:
            error.response?.data
              ?.mensaje ||
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
          Ingreso de Papel
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>
                Tipo
              </FormLabel>

              <Select
                value={tipo}
                onChange={(e) => {
                  setTipo(
                    e.target.value
                  );

                  setGramaje("");
                  setProductoId("");
                }}
                isDisabled={!!productoRapido}
              >
                <option value="" disabled>
                  Elegir tipo de papel
                </option>

                {tipos.map((t) => (
                  <option
                    key={t}
                    value={t}
                  >
                    {titulo(t)}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>
                Gramaje
              </FormLabel>

              <Select
                value={gramaje}
                onChange={(e) => {
                  setGramaje(
                    e.target.value
                  );

                  setProductoId("");
                }}
                isDisabled={!!productoRapido}
              >
                <option value="" disabled>
                  Elegir gramaje
                </option>

                {[
                  ...new Set(
                    gramajes.map(
                      (g) =>
                        g.gramaje
                    )
                  ),
                ].map((g) => (
                  <option
                    key={g}
                    value={g}
                  >
                    {g}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>
                Medida
              </FormLabel>

              <Select
                value={productoId}
                onChange={(e) =>
                  setProductoId(
                    e.target.value
                  )
                }
                isDisabled={!!productoRapido}
              >
                <option value="" disabled>
                  Elegir medida
                </option>

                {medidas.map((p) => (
                  <option
                    key={p._id}
                    value={p._id}
                  >
                    {p.anchoCm} x{" "}
                    {p.altoCm}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>
                Cantidad
              </FormLabel>

              <Input
                type="number"
                value={cantidad}
                onChange={(e) =>
                  setCantidad(
                    e.target.value
                  )
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>
                Observación
              </FormLabel>

              <Input
                value={observacion}
                onChange={(e) =>
                  setObservacion(
                    e.target.value
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
          >
            Cancelar
          </Button>

          <Button
            colorScheme="green"
            onClick={
              guardarIngreso
            }
          >
            Registrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}