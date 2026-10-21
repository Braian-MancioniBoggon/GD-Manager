import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  Button,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";

import {
  useEffect,
  useState,
} from "react";

import api from "../../../../../shared/services/api";

export default function ModalAgregarCheque({
  isOpen,
  onClose,
  caja,
  chequeEditar,
  onAgregado,
}) {

  const toast =
    useToast();

  const [
    numero,
    setNumero,
  ] = useState("");

  const [
    banco,
    setBanco,
  ] = useState("");

  const [
    librador,
    setLibrador,
  ] = useState("");

  const [
    importe,
    setImporte,
  ] = useState("");

  const [
    fechaEmision,
    setFechaEmision,
  ] = useState("");

  const [
    fechaVencimiento,
    setFechaVencimiento,
  ] = useState("");

  const [
    observaciones,
    setObservaciones,
  ] = useState("");

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [bancosDisponibles, setBancosDisponibles] = useState([]);
  const [cargandoBancos, setCargandoBancos] = useState(false);

  const bancosFallback = [
    "BANCO BBVA ARGENTINA S.A.",
    "BANCO BICA S.A.",
    "BANCO CMF S.A.",
    "BANCO COINAG S.A.",
    "BANCO COLUMBIA S.A.",
    "BANCO COMAFI S.A.",
    "BANCO CREDICOOP COOPERATIVO LIMITADO",
    "BANCO DE COMERCIO S.A.",
    "BANCO DE CORRIENTES S.A.",
    "BANCO DE FORMOSA S.A.",
    "BANCO DE GALICIA Y BUENOS AIRES S.A.",
    "BANCO DE LA CIUDAD DE BUENOS AIRES",
    "BANCO DE LA NACIÓN ARGENTINA",
    "BANCO DE LA PAMPA S.E.M.",
    "BANCO DE LA PROVINCIA DE BUENOS AIRES",
    "BANCO DE LA PROVINCIA DE CÓRDOBA S.A.",
    "BANCO DE LA REPÚBLICA ORIENTAL DEL URUGUAY",
    "BANCO DE SAN JUAN S.A.",
    "BANCO DE SANTA CRUZ S.A.",
    "BANCO DE SANTIAGO DEL ESTERO S.A.",
    "BANCO DE VALORES S.A.",
    "BANCO DEL CHUBUT S.A.",
    "BANCO DEL SOL S.A.",
    "BANCO DINO S.A.",
    "BANCO HIPOTECARIO S.A.",
    "BANCO INDUSTRIAL S.A.",
    "BANCO JULIO S.A.",
    "BANCO MACRO S.A.",
    "BANCO MARIVA S.A.",
    "BANCO MASVENTAS S.A.",
    "BANCO MERIDIAN S.A.",
    "BANCO MUNICIPAL DE ROSARIO",
    "BANCO PATAGONIA S.A.",
    "BANCO PIANO S.A.",
    "BANCO PROVINCIA DE TIERRA DEL FUEGO",
    "BANCO PROVINCIA DEL NEUQUÉN S.A.",
    "BANCO ROELA S.A.",
    "BANCO SAENZ S.A.",
    "BANCO SANTANDER ARGENTINA S.A.",
    "BANCO SUCREDITO REGIONAL S.A.U.",
    "BANCO SUPERVIELLE S.A.",
    "BIBANK S.A.",
    "BNP PARIBAS",
    "CITIBANK N.A.",
    "INDUSTRIAL AND COMMERCIAL BANK OF CHINA (ARGENTINA) S.A.",
    "JPMORGAN CHASE BANK, NATIONAL ASSOCIATION",
    "NUEVO BANCO DE ENTRE RÍOS S.A.",
    "NUEVO BANCO DE SANTA FE S.A.",
    "NUEVO BANCO DEL CHACO S.A.",
  ];

  useEffect(() => {
    if (!isOpen) return;
    
    let cancelado = false;
    
    const cargarBancos = async () => {
      setCargandoBancos(true);
    
      try {
        const respuesta = await fetch(
          "https://api.bcra.gob.ar/cheques/v1.0/entidades"
        );
      
        if (!respuesta.ok) {
          throw new Error("No se pudo consultar el BCRA");
        }
      
        const datos = await respuesta.json();
      
        const nombres = (datos.results || [])
          .map((entidad) => entidad.denominacion?.trim())
          .filter(Boolean);
      
        if (!nombres.length) {
          throw new Error("El BCRA no devolvió entidades");
        }
      
        if (!cancelado) {
          setBancosDisponibles(
            [...new Set(nombres)].sort((a, b) =>
              a.localeCompare(b, "es")
            )
          );
        }
      } catch (error) {
        console.error("Error cargando bancos del BCRA:", error);
      
        if (!cancelado) {
          setBancosDisponibles(bancosFallback);
        }
      } finally {
        if (!cancelado) {
          setCargandoBancos(false);
        }
      }
    };
  
    cargarBancos();
  
    return () => {
      cancelado = true;
    };
  }, [isOpen]);

  useEffect(() => {

      if (!isOpen) {
          return;
      }

      if (chequeEditar) {

          setNumero(
              chequeEditar.numero || ""
          );

          setBanco(
              chequeEditar.banco || ""
          );

          setLibrador(
              chequeEditar.librador || ""
          );

          setImporte(
              chequeEditar.importe ?? ""
          );

          setFechaEmision(
              chequeEditar.fechaEmision
                  ? new Date(
                      chequeEditar.fechaEmision
                  )
                      .toISOString()
                      .slice(0, 10)
                  : ""
          );

          setFechaVencimiento(
              chequeEditar.fechaVencimiento
                  ? new Date(
                      chequeEditar.fechaVencimiento
                  )
                      .toISOString()
                      .slice(0, 10)
                  : ""
          );

          setObservaciones(
              chequeEditar.observaciones || ""
          );

      } else {

          limpiar();

      }

  }, [
      isOpen,
      chequeEditar,
  ]);


  // ========================================
  // LIMPIAR FORMULARIO
  // ========================================

  const limpiar =
    () => {

      setNumero("");
      setBanco("");
      setLibrador("");
      setImporte("");
      setFechaEmision("");
      setFechaVencimiento("");
      setObservaciones("");

    };


  // ========================================
  // CERRAR
  // ========================================

  const cerrar =
    () => {

      if (guardando) {
        return;
      }

      limpiar();
      onClose();

    };


  // ========================================
  // GUARDAR
  // ========================================

  const guardar =
    async () => {

      if (!caja?._id) {
        return;
      }

      if (
        !numero.trim() ||
        !banco.trim() ||
        !librador.trim() ||
        !importe ||
        !fechaEmision ||
        !fechaVencimiento
      ) {

        toast({
          title:
            "Completá los datos del cheque.",
          status:
            "warning",
          duration:
            3000,
          isClosable:
            true,
        });

        return;
      }

      const importeNumero =
        Number(importe);

      if (
        Number.isNaN(
          importeNumero
        ) ||
        importeNumero <= 0
      ) {

        toast({
          title:
            "El importe no es válido.",
          status:
            "warning",
          duration:
            3000,
          isClosable:
            true,
        });

        return;
      }

      setGuardando(true);

      try {

        const respuesta = chequeEditar?._id
          ? await api.put(
              `/caja/${caja._id}/cheques/${chequeEditar._id}`,
              {
                  numero: numero.trim(),
                  banco: banco.trim(),
                  librador: librador.trim(),
                  importe: importeNumero,
                  fechaEmision,
                  fechaVencimiento,
                  observaciones: observaciones.trim(),
              }
          )
          : await api.post(
              `/caja/${caja._id}/cheques`,
              {
                  numero: numero.trim(),
                  banco: banco.trim(),
                  librador: librador.trim(),
                  importe: importeNumero,
                  fechaEmision,
                  fechaVencimiento,
                  observaciones: observaciones.trim(),
              }
          );

        if (
          respuesta.data?.caja
        ) {

          onAgregado(
            respuesta.data.caja
          );

        }

        toast({
          title:
            "Cheque agregado correctamente.",
          status:
            "success",
          duration:
            3000,
          isClosable:
            true,
        });

        limpiar();
        onClose();

      } catch (error) {

        console.error(
          "Error agregando cheque:",
          error
        );

        toast({
          title:
            "No se pudo agregar el cheque.",
          description:
            error.response?.data?.mensaje ||
            "Ocurrió un error inesperado.",
          status:
            "error",
          duration:
            4000,
          isClosable:
            true,
        });

      } finally {

        setGuardando(false);

      }

    };


  return (

    <Modal
      isOpen={isOpen}
      onClose={cerrar}
      size="lg"
      isCentered
    >

      <ModalOverlay />

      <ModalContent>

        <ModalHeader>
            {chequeEditar
                ? "Editar cheque"
                : "Agregar cheque"
            }
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody>

          <Text
            mb={5}
            fontSize="sm"
            color="gray.500"
          >
            Registrá el cheque recibido para
            incorporarlo a la caja del día.
          </Text>

          <SimpleGrid
            columns={{
              base: 1,
              md: 2,
            }}
            spacing={4}
          >

            {/* NÚMERO */}

            <FormControl
              isRequired
            >

              <FormLabel>
                Número
              </FormLabel>

              <Input
                value={numero}
                onChange={(e) =>
                  setNumero(
                    e.target.value
                  )
                }
                placeholder=""
              />

            </FormControl>


            {/* BANCO */}

            <FormControl isRequired>
              <FormLabel>Banco</FormLabel>

              <Select
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                placeholder={
                  cargandoBancos
                    ? "Cargando bancos..."
                    : "Seleccioná un banco"
                }
                isDisabled={cargandoBancos}
              >
                {banco &&
                  !bancosDisponibles.includes(banco) && (
                    <option value={banco}>
                      {banco}
                    </option>
                  )}

                {bancosDisponibles.map((nombreBanco) => (
                  <option key={nombreBanco} value={nombreBanco}>
                    {nombreBanco}
                  </option>
                ))}
              </Select>
            </FormControl>


            {/* CLIENTE */}

            <FormControl
              isRequired
            >

              <FormLabel>
                Cliente
              </FormLabel>

              <Input
                value={librador}
                onChange={(e) =>
                  setLibrador(
                    e.target.value
                  )
                }
                placeholder=""
              />

            </FormControl>


            {/* IMPORTE */}

            <FormControl
              isRequired
            >

              <FormLabel>
                Importe
              </FormLabel>

              <Input
                type="number"
                min="0"
                value={importe}
                onChange={(e) =>
                  setImporte(
                    e.target.value
                  )
                }
                placeholder=""
              />

            </FormControl>


            {/* FECHA EMISIÓN */}

            <FormControl
              isRequired
            >

              <FormLabel>
                Fecha de emisión
              </FormLabel>

              <Input
                type="date"
                value={
                  fechaEmision
                }
                onChange={(e) =>
                  setFechaEmision(
                    e.target.value
                  )
                }
              />

            </FormControl>


            {/* FECHA VENCIMIENTO */}

            <FormControl
              isRequired
            >

              <FormLabel>
                Fecha de vencimiento
              </FormLabel>

              <Input
                type="date"
                value={
                  fechaVencimiento
                }
                onChange={(e) =>
                  setFechaVencimiento(
                    e.target.value
                  )
                }
              />

            </FormControl>

          </SimpleGrid>


          {/* OBSERVACIONES */}

          <FormControl
            mt={4}
          >

            <FormLabel>
              Observaciones
            </FormLabel>

            <Textarea
              value={
                observaciones
              }
              onChange={(e) =>
                setObservaciones(
                  e.target.value
                )
              }
              placeholder="Observaciones del cheque..."
              resize="vertical"
            />

          </FormControl>

        </ModalBody>


        <ModalFooter
          gap={3}
        >

          <Button
            variant="ghost"
            onClick={cerrar}
            isDisabled={
              guardando
            }
          >
            Cancelar
          </Button>

          <Button
              colorScheme="red"
              onClick={guardar}
              isLoading={guardando}
          >
              {chequeEditar
                  ? "Guardar cambios"
                  : "Agregar cheque"
              }
          </Button>

        </ModalFooter>

      </ModalContent>

    </Modal>

  );

}