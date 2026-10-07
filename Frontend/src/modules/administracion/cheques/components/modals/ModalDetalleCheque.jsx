import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Flex,
  Text,
  Badge,
  Divider,
  SimpleGrid,
} from "@chakra-ui/react";

export default function ModalDetalleCheque({
  isOpen,
  onClose,
  cheque,
}) {

  if (!cheque) {
    return null;
  }

  // ========================================
  // FORMATEAR FECHA
  // ========================================

  const formatearFecha = (fecha) => {

    if (!fecha) {
      return "-";
    }

    return new Date(fecha).toLocaleDateString(
      "es-AR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );

  };

  // ========================================
  // FORMATEAR IMPORTE
  // ========================================

  const formatearImporte = (importe) => {

    return Number(
      importe || 0
    ).toLocaleString(
      "es-AR",
      {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
      }
    );

  };

  // ========================================
  // ESTADO
  // ========================================

  const estadoConfig = {

    PENDIENTE: {
      label: "Pendiente",
      colorScheme: "orange",
    },

    DEPOSITADO: {
      label: "Depositado",
      colorScheme: "blue",
    },

    ENTREGADO: {
      label: "Entregado",
      colorScheme: "green",
    },

  };

  const estado =
    estadoConfig[
      cheque.estado
    ] || {
      label: cheque.estado,
      colorScheme: "gray",
    };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="lg"
    >

      <ModalOverlay />

      <ModalContent>

        {/* ================================== */}
        {/* HEADER */}
        {/* ================================== */}

        <ModalHeader
          borderBottom="1px solid"
          borderColor="gray.100"
          pb={4}
        >

          <Flex
            align="center"
            justify="space-between"
            gap={4}
          >

            <Box>

              <Text
                fontSize="xl"
                fontWeight="700"
                color="gray.800"
              >
                Cheque #{cheque.numero}
              </Text>

              <Text
                mt={1}
                fontSize="sm"
                fontWeight="400"
                color="gray.500"
              >
                Detalle del cheque
              </Text>

            </Box>

            <Badge
              colorScheme={
                estado.colorScheme
              }
              borderRadius="full"
              px={3}
              py={1}
              fontSize="xs"
            >
              {estado.label}
            </Badge>

          </Flex>

        </ModalHeader>

        {/* ================================== */}
        {/* BODY */}
        {/* ================================== */}

        <ModalBody
          py={6}
        >

          {/* ================================ */}
          {/* DATOS PRINCIPALES */}
          {/* ================================ */}

          <Text
            fontSize="sm"
            fontWeight="700"
            color="gray.700"
            mb={4}
          >
            Datos del cheque
          </Text>

          <SimpleGrid
            columns={2}
            spacing={5}
          >

            {/* NÚMERO */}

            <Box>

              <Text
                fontSize="xs"
                color="gray.500"
                mb={1}
              >
                Número
              </Text>

              <Text
                fontSize="sm"
                fontWeight="600"
                color="gray.800"
              >
                #{cheque.numero}
              </Text>

            </Box>

            {/* BANCO */}

            <Box>

              <Text
                fontSize="xs"
                color="gray.500"
                mb={1}
              >
                Banco
              </Text>

              <Text
                fontSize="sm"
                fontWeight="600"
                color="gray.800"
              >
                {cheque.banco}
              </Text>

            </Box>

            {/* CLIENTE */}

            <Box>

              <Text
                fontSize="xs"
                color="gray.500"
                mb={1}
              >
                Cliente
              </Text>

              <Text
                fontSize="sm"
                fontWeight="600"
                color="gray.800"
              >
                {cheque.librador}
              </Text>

            </Box>

            {/* IMPORTE */}

            <Box>

              <Text
                fontSize="xs"
                color="gray.500"
                mb={1}
              >
                Importe
              </Text>

              <Text
                fontSize="md"
                fontWeight="700"
                color="gray.800"
              >
                {formatearImporte(
                  cheque.importe
                )}
              </Text>

            </Box>

          </SimpleGrid>

          <Divider
            my={6}
          />

          {/* ================================ */}
          {/* FECHAS */}
          {/* ================================ */}

          <Text
            fontSize="sm"
            fontWeight="700"
            color="gray.700"
            mb={4}
          >
            Fechas
          </Text>

          <SimpleGrid
            columns={2}
            spacing={5}
          >

            {/* FECHA EMISIÓN */}

            <Box>

              <Text
                fontSize="xs"
                color="gray.500"
                mb={1}
              >
                Fecha de emisión
              </Text>

              <Text
                fontSize="sm"
                color="gray.800"
              >
                {formatearFecha(
                  cheque.fechaEmision
                )}
              </Text>

            </Box>

            {/* FECHA VENCIMIENTO */}

            <Box>

              <Text
                fontSize="xs"
                color="gray.500"
                mb={1}
              >
                Fecha de vencimiento
              </Text>

              <Text
                fontSize="sm"
                color="gray.800"
              >
                {formatearFecha(
                  cheque.fechaVencimiento
                )}
              </Text>

            </Box>

            {/* FECHA DEPÓSITO */}

            {cheque.fechaDeposito && (

              <Box>

                <Text
                  fontSize="xs"
                  color="gray.500"
                  mb={1}
                >
                  Fecha de depósito
                </Text>

                <Text
                  fontSize="sm"
                  color="gray.800"
                >
                  {formatearFecha(
                    cheque.fechaDeposito
                  )}
                </Text>

              </Box>

            )}

            {/* FECHA ENTREGA */}

            {cheque.fechaEntrega && (

              <Box>

                <Text
                  fontSize="xs"
                  color="gray.500"
                  mb={1}
                >
                  Fecha de entrega
                </Text>

                <Text
                  fontSize="sm"
                  color="gray.800"
                >
                  {formatearFecha(
                    cheque.fechaEntrega
                  )}
                </Text>

              </Box>

            )}

          </SimpleGrid>

          {/* ================================ */}
          {/* DATOS DE ENTREGA */}
          {/* ================================ */}

          {cheque.estado === "ENTREGADO" &&
            cheque.entregadoA && (

            <>

              <Divider
                my={6}
              />

              <Text
                fontSize="sm"
                fontWeight="700"
                color="gray.700"
                mb={3}
              >
                Datos de entrega
              </Text>

              <Box
                bg="gray.50"
                borderRadius="md"
                px={4}
                py={3}
              >

                <Text
                  fontSize="xs"
                  color="gray.500"
                  mb={1}
                >
                  Entregado a
                </Text>

                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color="gray.800"
                >
                  {cheque.entregadoA}
                </Text>

              </Box>

            </>

          )}

          {/* ================================ */}
          {/* OBSERVACIONES */}
          {/* ================================ */}

          {cheque.observaciones && (

            <>

              <Divider
                my={6}
              />

              <Text
                fontSize="sm"
                fontWeight="700"
                color="gray.700"
                mb={3}
              >
                Observaciones
              </Text>

              <Box
                bg="gray.50"
                borderRadius="md"
                px={4}
                py={3}
              >

                <Text
                  fontSize="sm"
                  color="gray.700"
                  whiteSpace="pre-wrap"
                >
                  {cheque.observaciones}
                </Text>

              </Box>

            </>

          )}

        </ModalBody>

        {/* ================================== */}
        {/* FOOTER */}
        {/* ================================== */}

        <ModalFooter
          borderTop="1px solid"
          borderColor="gray.100"
        >

          <Button
            onClick={onClose}
          >
            Cerrar
          </Button>

        </ModalFooter>

      </ModalContent>

    </Modal>
  );
}