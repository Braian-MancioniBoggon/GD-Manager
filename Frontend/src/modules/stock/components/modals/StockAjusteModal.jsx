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
  Text,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { obtenerStock } from "../../services/stockService";
import { ajustarStock } from "../../services/movimientoService";
import { titulo } from "../../../../shared/utils/formatoTexto";
import { useStock } from "../../context/StockContext";

export default function StockAjusteModal({
  isOpen,
  onClose,
  productoRapido,
}) {
  const toast = useToast();
  const [productos, setProductos] = useState([]);
  const [tipo, setTipo] = useState("");
  const [gramaje, setGramaje] = useState("");
  const [productoId, setProductoId] = useState("");
  const [nuevoStock, setNuevoStock] = useState("");
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
        await obtenerStock();

      setProductos(
        data
          .filter(
            (item) =>
              item.productoId?.activo
          )
          .map((item) => ({
            _id: item.productoId._id,
            tipo: item.productoId.tipo,
            gramaje: item.productoId.gramaje,
            anchoCm: item.productoId.anchoCm,
            altoCm: item.productoId.altoCm,
            stockMinimo:
              item.productoId.stockMinimo,
            hojas: item.hojas,
          }))
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
    setNuevoStock("");
    setObservacion("");
  };

  const guardarAjuste = async () => {
      try {
        await ajustarStock({
          productoId,
          nuevoStock:
            Number(nuevoStock),
          observacion,
        });

        toast({
          title:
            "Ajuste registrado",
          status: "success",
        });

        refrescarStock();

        onClose();
      } catch (error) {
        toast({
          title: "Error",
          description:
            error.response?.data
              ?.mensaje,
          status: "error",
        });
      }
    };

    const productoSeleccionado =
      medidas.find(
        (p) => p._id === productoId
      );

      const diferencia =
        productoSeleccionado
          ? Number(nuevoStock) -
            productoSeleccionado.hojas
          : 0;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>
          Ajuste de Stock
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
              {productoSeleccionado && (
                  <Text
                    color="blue.600"
                    fontWeight="bold"
                  >
                    Stock actual:
                    {" "}
                    {productoSeleccionado.hojas}
                    {" "}
                    hojas
                  </Text>
                )}
            </FormControl>

            <FormControl>
              <FormLabel>
                Nuevo Stock
              </FormLabel>
                        
              <Input
                type="number"
                min={0}
                value={nuevoStock}
                onChange={(e) =>
                  setNuevoStock(
                    e.target.value
                  )
                }
              />
            
              {productoSeleccionado &&
                nuevoStock !== "" && (
                  <Text
                    mt={2}
                    color={
                      diferencia >= 0
                        ? "green.600"
                        : "red.600"
                    }
                    fontWeight="bold"
                  >
                    Diferencia:
                    {" "}
                    {diferencia > 0
                      ? "+"
                      : ""}
                    {diferencia}
                    {" "}
                    hojas
                  </Text>
                )}
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
              colorScheme="yellow"
              onClick={guardarAjuste}
              isDisabled={
                !productoId ||
                nuevoStock === ""
              }
            >
              Registrar Ajuste
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}