import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";

import {
  useEffect,
  useState,
} from "react";

import api from "../../../../../shared/services/api";

export default function ModalAgregarEgreso({
  isOpen,
  onClose,
  caja,
  categoria,
  onAgregado,
}) {

  const [
    proveedor,
    setProveedor,
  ] = useState("");

  const [
    detalle,
    setDetalle,
  ] = useState("");

  const [
    importe,
    setImporte,
  ] = useState("");

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  // ========================================
  // CONFIGURACIÓN
  // ========================================

  const configuracion = {

    egresos: {
      titulo: "Agregar egreso",
      descripcion:
        "Registrar un nuevo egreso de caja.",
    },

    egresosBanco: {
      titulo: "Agregar egreso de banco",
      descripcion:
        "Registrar un egreso correspondiente al banco.",
    },

    retirosAdelantos: {
      titulo: "Agregar retiro / adelanto",
      descripcion:
        "Registrar un retiro o adelanto.",
    },

    fletes: {
      titulo: "Agregar flete",
      descripcion:
        "Registrar un gasto correspondiente a flete.",
    },

  };


  const config =
    configuracion[categoria] ||
    configuracion.egresos;


  // ========================================
  // REINICIAR FORMULARIO
  // ========================================

  useEffect(() => {

    if (!isOpen) {
      return;
    }

    setProveedor("");
    setDetalle("");
    setImporte("");
    setError("");

  }, [
    isOpen,
    categoria,
  ]);


  // ========================================
  // CERRAR
  // ========================================

  const cerrar = () => {

    if (guardando) {
      return;
    }

    setProveedor("");
    setDetalle("");
    setImporte("");
    setError("");

    onClose();

  };


  // ========================================
  // GUARDAR
  // ========================================

  const guardar = async () => {

    setError("");

    const proveedorLimpio =
      proveedor.trim();

    const detalleLimpio =
      detalle.trim();

    const importeNumero =
      Number(importe);

    if (!proveedorLimpio) {

      setError(
        "Ingresá el proveedor."
      );

      return;

    }

    if (!detalleLimpio) {

      setError(
        "Ingresá el detalle del egreso."
      );

      return;

    }

    if (
      !importe ||
      Number.isNaN(importeNumero) ||
      importeNumero <= 0
    ) {

      setError(
        "Ingresá un importe válido."
      );

      return;

    }

    if (!caja?._id) {

      setError(
        "No hay una caja abierta."
      );

      return;

    }

    try {

      setGuardando(true);

      const respuesta =
        await api.post(
          `/caja/${caja._id}/egresos/${categoria}`,
          {
            proveedor:
              proveedorLimpio,

            detalle:
              detalleLimpio,

            importe:
              importeNumero,
          }
        );

      if (onAgregado) {

        onAgregado(
          respuesta.data.caja
        );

      }

      cerrar();

    } catch (error) {

      console.error(
        "Error agregando egreso:",
        error
      );

      setError(
        error.response?.data?.mensaje ||
        "No se pudo agregar el egreso."
      );

    } finally {

      setGuardando(false);

    }

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
          {config.titulo}
        </ModalHeader>


        <ModalBody>

          <Text
            mb={5}
            fontSize="sm"
            color="gray.500"
          >
            {config.descripcion}
          </Text>


          <VStack
            spacing={4}
            align="stretch"
          >

            {/* PROVEEDOR */}

            <FormControl>

              <FormLabel
                fontSize="sm"
                fontWeight="600"
              >
                Proveedor
              </FormLabel>

              <Input
                value={proveedor}
                onChange={(e) =>
                  setProveedor(
                    e.target.value
                  )
                }
                placeholder="Nombre del proveedor"
                autoFocus
              />

            </FormControl>


            {/* DETALLE */}

            <FormControl>

              <FormLabel
                fontSize="sm"
                fontWeight="600"
              >
                Detalle
              </FormLabel>

              <Input
                value={detalle}
                onChange={(e) =>
                  setDetalle(
                    e.target.value
                  )
                }
                placeholder="Detalle del egreso"
              />

            </FormControl>


            {/* IMPORTE */}

            <FormControl>

              <FormLabel
                fontSize="sm"
                fontWeight="600"
              >
                Importe
              </FormLabel>

              <Input
                type="number"
                min="0"
                step="0.01"
                value={importe}
                onChange={(e) =>
                  setImporte(
                    e.target.value
                  )
                }
                placeholder="0"
              />

            </FormControl>


            {/* ERROR */}

            {error && (

              <Text
                fontSize="sm"
                color="red.500"
                fontWeight="500"
              >
                {error}
              </Text>

            )}

          </VStack>

        </ModalBody>


        <ModalFooter>

          <Button
            variant="ghost"
            mr={3}
            onClick={cerrar}
            isDisabled={guardando}
          >
            Cancelar
          </Button>

          <Button
            colorScheme="red"
            onClick={guardar}
            isLoading={guardando}
          >
            Guardar egreso
          </Button>

        </ModalFooter>

      </ModalContent>

    </Modal>

  );

}