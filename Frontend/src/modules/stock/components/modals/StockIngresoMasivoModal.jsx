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
  Box,
  Icon,
} from "@chakra-ui/react";

import { FiTrash2, FiEdit } from "react-icons/fi";

import { useEffect, useState } from "react";
import { obtenerProductos } from "../../services/productoService";
import { ingresarPapel } from "../../services/movimientoService";
import { titulo } from "../../../../shared/utils/formatoTexto";
import { useStock } from "../../context/StockContext";

export default function StockIngresoMasivoModal({
  isOpen,
  onClose,
  productoRapido,
}) {
  const toast = useToast();
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      limpiarFormulario();
    }
  }, [isOpen]);

  const [tipo, setTipo] = useState("");
  const [gramaje, setGramaje] = useState("");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [items, setItems] = useState([]);
  const [observacion, setObservacion] = useState("");
  const [editandoIndex, setEditandoIndex] = useState(null);
  const { refrescarStock } = useStock();  

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {

    if (!productoRapido) return;

    setTipo(
      productoRapido.productoId.tipo
    );

    setGramaje(
      productoRapido.productoId.gramaje
        .toString()
    );

    setProductoId(
      productoRapido.productoId._id
    );

  }, [productoRapido]);

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

    const agregarItem = () => {
    
      const producto =
        medidas.find(
          (p) => p._id === productoId
        );
    
      if (!productoId || !cantidad)
        return;
      
      const existente = items.find(
        (item, index) =>
          item.productoId === productoId &&
          index !== editandoIndex
      );
      
      if (existente) {
      
        const sumar = window.confirm(
          "Este papel ya está cargado.\n\n¿Desea sumar la cantidad al registro existente?"
        );
      
        if (sumar) {
        
          setItems(
            items.map((item) =>
              item.productoId === productoId
                ? {
                    ...item,
                    cantidad:
                      item.cantidad +
                      Number(cantidad),
                  }
                : item
            )
          );
        
          setProductoId("");
          setCantidad("");
        
          return;
        }
      
        // Si responde NO, no hacemos nada
        return;
      }

      const nuevoItem = {
        productoId,
        cantidad: Number(cantidad),

        descripcion:
          `${titulo(producto.tipo)} ${
            producto.gramaje
          }g - ${
            producto.anchoCm
          }x${producto.altoCm}`,
      };

      if (editandoIndex !== null) {
      
        const copia = [...items];
      
        copia[editandoIndex] = nuevoItem;
      
        setItems(copia);
      
        setEditandoIndex(null);
      
      } else {
      
        setItems([
          ...items,
          nuevoItem,
        ]);
      
      }

      setTipo("");
      setGramaje("");
      setProductoId("");
      setCantidad("");
    };

  const limpiarFormulario = () => {
    setTipo("");
    setGramaje("");
    setProductoId("");
    setCantidad("");
    setObservacion("");
    setItems([]);
    setEditandoIndex(null);
  };

  const eliminarItem = (index) => {

    setItems(
      items.filter((_, i) => i !== index)
    );

    if (editandoIndex === index) {
      limpiarFormulario();
      setEditandoIndex(null);
    }

  };

  const editarItem = (index) => {

    const item = items[index];

    const producto = productos.find(
        (p) => p._id === item.productoId
      );
  
    setTipo(producto.tipo);
  
    setGramaje(producto.gramaje.toString());
  
    setProductoId(producto._id);
  
    setCantidad(item.cantidad);
  
    setEditandoIndex(index);
  
  };

  const vaciarLista = () => {

    if (items.length === 0) return;

    if (!window.confirm("¿Vaciar toda la lista?")) {
      return;
    }

    setItems([]);
    limpiarFormulario();
    setEditandoIndex(null);

  };

    const guardarIngresoMasivo =
      async () => {
        try {

          if (
            items.length >= 10 &&
            !window.confirm(
              `Está por ingresar ${items.length} tipos de papel distintos.\n\n¿Confirma el ingreso?`
            )
          ) {
            return;
          }

          for (const item of items) {

            await ingresarPapel({
              productoId:
                item.productoId,

              cantidad:
                item.cantidad,

              observacion:
                "Ingreso masivo",
            });
          }

          toast({
            title: "Ingreso masivo completado",
            description: `${items.length} movimientos registrados correctamente.`,
            status: "success",
            duration: 4000,
          });

          refrescarStock();

          onClose();

          setItems([]);

        } catch (error) {

          toast({
            title: "Error",
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
            {editandoIndex !== null && (

                <Box
                  p={2}
                  bg="yellow.100"
                  borderRadius="md"
                  w="100%"
                >
                
                  ✏ Editando un ítem

                </Box>

              )}
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
                  setEditandoIndex(null);
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

            <Button
              colorScheme="blue"
              onClick={agregarItem}
            >
              {editandoIndex !== null ? "Guardar cambios" : "Agregar a la lista"}
            </Button>

            <VStack
              align="stretch"
              mt={4}
            >
              {items.map(
                (item, index) => (
                  <Box
                    key={index}
                    p={2}
                    borderWidth="1px"
                    borderRadius="md"
                  >
                    <Button
                      size="xs"
                      colorScheme="blue"
                      onClick={() =>
                        editarItem(index)
                      }
                      marginRight={2}
                    >
                      <Icon as={FiEdit} boxSize={4}/>
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="red"
                      onClick={() =>
                        eliminarItem(index)
                      }
                      marginRight={2}
                    >
                      <Icon as={FiTrash2} boxSize={4}/>
                    </Button>
                    {item.descripcion}
                    {" - "}
                    {item.cantidad}
                    {" hojas"}
                  </Box>
                )
              )}
            </VStack>

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
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={vaciarLista}
            isDisabled={items.length === 0}
          >
            Vaciar lista
          </Button>

          <Button
              colorScheme="green"
              onClick={guardarIngresoMasivo}
              isDisabled={
                items.length === 0
              }
            >
              Registrar Todo ({items.length})
            </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}