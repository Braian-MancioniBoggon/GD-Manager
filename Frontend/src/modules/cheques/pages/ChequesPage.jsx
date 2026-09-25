import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  ButtonGroup,
  Text,
  Badge,
  Icon,
  Spinner,
  Center,
} from "@chakra-ui/react";

import {
  FiSearch,
  FiEye,
  FiEdit,
  FiUpload,
  FiSend,
  FiClock,
} from "react-icons/fi";

import { useEffect, useMemo, useState } from "react";

import api from "../../../shared/services/api";
import ModalDetalleCheque from "../components/modals/ModalDetalleCheque";
import ModalEditarCheque from "../components/modals/ModalEditarCheque";
import ModalCambiarEstadoCheque from "../components/modals/ModalCambiarEstadoCheque";

export default function ChequesPage() {

  const [
    cheques,
    setCheques,
  ] = useState([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    filtroEstado,
    setFiltroEstado,
  ] = useState("PENDIENTE");

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const [
      chequeSeleccionado,
      setChequeSeleccionado,
    ] = useState(null);

    const [
      detalleAbierto,
      setDetalleAbierto,
    ] = useState(false);

    const [
      editarAbierto,
      setEditarAbierto,
    ] = useState(false);

    const [
      modalEstadoAbierto,
      setModalEstadoAbierto,
    ] = useState(false);
    
    const [
      accionEstado,
      setAccionEstado,
    ] = useState(null);

// ========================================
// ACTUALIZAR CHEQUE
// ========================================

const actualizarCheque = (
  chequeActualizado
) => {

  setCheques(
    (actuales) =>
      actuales.map(
        (cheque) =>
          cheque._id ===
          chequeActualizado._id
            ? chequeActualizado
            : cheque
      )
  );

  setChequeSeleccionado(
    chequeActualizado
  );

};

  // ========================================
  // OBTENER CHEQUES
  // ========================================

  const obtenerCheques = async () => {

    try {

      setCargando(true);

      const respuesta =
        await api.get(
          "/cheques"
        );

      setCheques(
        respuesta.data.cheques || []
      );

    } catch (error) {

      console.error(
        "Error obteniendo cheques:",
        error
      );

    } finally {

      setCargando(false);

    }

  };

  useEffect(() => {

    obtenerCheques();

  }, []);

  // ========================================
  // FILTRAR CHEQUES
  // ========================================

  const chequesFiltrados =
    useMemo(() => {

      return cheques.filter(
        (cheque) => {

          const coincideEstado =
            filtroEstado ===
            "TODOS" ||
            cheque.estado ===
            filtroEstado;

          const texto =
            busqueda
              .toLowerCase()
              .trim();

          if (!texto) {
            return coincideEstado;
          }

          const coincideBusqueda =
            String(
              cheque.numero || ""
            )
              .toLowerCase()
              .includes(texto) ||

            String(
              cheque.banco || ""
            )
              .toLowerCase()
              .includes(texto) ||

            String(
              cheque.librador || ""
            )
              .toLowerCase()
              .includes(texto);

          return (
            coincideEstado &&
            coincideBusqueda
          );

        }
      );

    }, [
      cheques,
      filtroEstado,
      busqueda,
    ]);

  // ========================================
  // FORMATEAR FECHA
  // ========================================

  const formatearFecha = (
    fecha
  ) => {

    if (!fecha) {
      return "-";
    }

    return new Date(
      fecha
    ).toLocaleDateString(
      "es-AR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }
    );

  };

  // ========================================
  // FORMATEAR IMPORTE
  // ========================================

  const formatearImporte = (
    importe
  ) => {

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

  // ========================================
  // ACCIONES
  // ========================================

  const verCheque = (
    cheque
  ) => {

    setChequeSeleccionado(
      cheque
    );

    setDetalleAbierto(
      true
    );

    };

  const editarCheque = (
    cheque
  ) => {

    setChequeSeleccionado(
      cheque
    );

    setEditarAbierto(
      true
    );

  };

  const depositarCheque = (
      cheque
    ) => {

      setChequeSeleccionado(
        cheque
      );

      setAccionEstado(
        "DEPOSITAR"
      );

      setModalEstadoAbierto(
        true
      );

    };

    const entregarCheque = (
      cheque
    ) => {

      setChequeSeleccionado(
        cheque
      );

      setAccionEstado(
        "ENTREGAR"
      );

      setModalEstadoAbierto(
        true
      );

    };

  const verHistorial = (
    cheque
  ) => {

    console.log(
      "Historial cheque:",
      cheque
    );

  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <Flex
      direction="column"
      h="100vh"
      bg="gray.100"
      overflow="hidden"
    >

      {/* ================================== */}
      {/* CABECERA */}
      {/* ================================== */}

      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        px={8}
        py={6}
      >

        <Text
          fontSize="2xl"
          fontWeight="700"
          color="gray.800"
        >
          Cheques
        </Text>

        <Text
          mt={1}
          fontSize="sm"
          color="gray.500"
        >
          Administración de cheques recibidos
        </Text>

      </Box>

      {/* ================================== */}
      {/* CONTENIDO */}
      {/* ================================== */}

      <Box
        flex={1}
        overflowY="auto"
        p={8}
      >

        <Box
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="lg"
          overflow="hidden"
        >

          {/* ================================ */}
          {/* FILTROS */}
          {/* ================================ */}

          <Flex
            px={6}
            py={5}
            gap={4}
            align="center"
            justify="space-between"
            borderBottom="1px solid"
            borderColor="gray.100"
            wrap="wrap"
          >

            <ButtonGroup
              size="sm"
              isAttached
              variant="outline"
            >

              <Button
                onClick={() =>
                  setFiltroEstado(
                    "TODOS"
                  )
                }
                bg={
                  filtroEstado ===
                  "TODOS"
                    ? "gray.100"
                    : "white"
                }
              >
                Todos
              </Button>

              <Button
                onClick={() =>
                  setFiltroEstado(
                    "PENDIENTE"
                  )
                }
                bg={
                  filtroEstado ===
                  "PENDIENTE"
                    ? "gray.100"
                    : "white"
                }
              >
                Pendientes
              </Button>

              <Button
                onClick={() =>
                  setFiltroEstado(
                    "DEPOSITADO"
                  )
                }
                bg={
                  filtroEstado ===
                  "DEPOSITADO"
                    ? "gray.100"
                    : "white"
                }
              >
                Depositados
              </Button>

              <Button
                onClick={() =>
                  setFiltroEstado(
                    "ENTREGADO"
                  )
                }
                bg={
                  filtroEstado ===
                  "ENTREGADO"
                    ? "gray.100"
                    : "white"
                }
              >
                Entregados
              </Button>

            </ButtonGroup>

            <InputGroup
              maxW="320px"
            >

              <InputLeftElement
                pointerEvents="none"
              >
                <Icon
                  as={FiSearch}
                  color="gray.400"
                />
              </InputLeftElement>

              <Input
                placeholder="Buscar cheque..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value
                  )
                }
              />

            </InputGroup>

          </Flex>

          {/* ================================ */}
          {/* TABLA */}
          {/* ================================ */}

          {cargando ? (

            <Center
              py={20}
            >
              <Spinner
                size="lg"
                color="gray.500"
              />
            </Center>

          ) : chequesFiltrados.length === 0 ? (

            <Center
              py={20}
              flexDirection="column"
            >

              <Text
                fontSize="md"
                fontWeight="600"
                color="gray.600"
              >
                No hay cheques
              </Text>

              <Text
                mt={1}
                fontSize="sm"
                color="gray.400"
              >
                No se encontraron cheques con los filtros seleccionados.
              </Text>

            </Center>

          ) : (

            <Box
              overflowX="auto"
            >

              {/* CABECERA */}

              <Flex
                minW="1000px"
                px={6}
                py={3}
                bg="gray.50"
                borderBottom="1px solid"
                borderColor="gray.200"
                align="center"
              >

                <Box w="150px">
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color="gray.500"
                    textTransform="uppercase"
                  >
                    Nº
                  </Text>
                </Box>

                <Box w="180px">
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color="gray.500"
                    textTransform="uppercase"
                  >
                    Banco
                  </Text>
                </Box>

                <Box w="200px">
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color="gray.500"
                    textTransform="uppercase"
                  >
                    Librador
                  </Text>
                </Box>

                <Box w="140px">
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color="gray.500"
                    textTransform="uppercase"
                  >
                    Vencimiento
                  </Text>
                </Box>

                <Box w="140px">
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color="gray.500"
                    textTransform="uppercase"
                  >
                    Importe
                  </Text>
                </Box>

                <Box w="130px">
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color="gray.500"
                    textTransform="uppercase"
                  >
                    Estado
                  </Text>
                </Box>

                <Box
                  flex={1}
                  minW="220px"
                >
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color="gray.500"
                    textTransform="uppercase"
                  >
                    Acciones
                  </Text>
                </Box>

              </Flex>

              {/* FILAS */}

              {chequesFiltrados.map(
                (cheque) => {

                  const estado =
                    estadoConfig[
                      cheque.estado
                    ];

                  return (

                    <Flex
                      key={
                        cheque._id
                      }
                      minW="1000px"
                      px={6}
                      py={4}
                      align="center"
                      borderBottom="1px solid"
                      borderColor="gray.100"
                      _hover={{
                        bg: "gray.50",
                      }}
                    >

                      {/* NUMERO */}

                      <Box w="150px">

                        <Text
                          fontSize="sm"
                          fontWeight="700"
                          color="gray.800"
                        >
                          #{cheque.numero}
                        </Text>

                      </Box>

                      {/* BANCO */}

                      <Box w="180px">

                        <Text
                          fontSize="sm"
                          color="gray.700"
                          noOfLines={1}
                        >
                          {cheque.banco}
                        </Text>

                      </Box>

                      {/* LIBRADOR */}

                      <Box w="200px">

                        <Text
                          fontSize="sm"
                          color="gray.700"
                          noOfLines={1}
                        >
                          {cheque.librador}
                        </Text>

                      </Box>

                      {/* VENCIMIENTO */}

                      <Box w="140px">

                        <Text
                          fontSize="sm"
                          color="gray.600"
                        >
                          {formatearFecha(
                            cheque.fechaVencimiento
                          )}
                        </Text>

                      </Box>

                      {/* IMPORTE */}

                      <Box w="140px">

                        <Text
                          fontSize="sm"
                          fontWeight="700"
                          color="gray.800"
                        >
                          {formatearImporte(
                            cheque.importe
                          )}
                        </Text>

                      </Box>

                      {/* ESTADO */}

                      <Box w="130px">

                        <Badge
                          colorScheme={
                            estado?.colorScheme ||
                            "gray"
                          }
                          borderRadius="full"
                          px={3}
                          py={1}
                          fontSize="xs"
                        >
                          {estado?.label ||
                            cheque.estado}
                        </Badge>

                      </Box>

                      {/* ACCIONES */}

                      <Flex
                        flex={1}
                        minW="220px"
                        gap={1}
                      >

                        {/* VER */}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            verCheque(
                              cheque
                            )
                          }
                          title="Ver cheque"
                        >
                          <Icon
                            as={FiEye}
                          />
                        </Button>

                        {/* PENDIENTE */}

                        {cheque.estado ===
                          "PENDIENTE" && (
                          <>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                editarCheque(
                                  cheque
                                )
                              }
                              title="Editar cheque"
                            >
                              <Icon
                                as={FiEdit}
                              />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() =>
                                depositarCheque(
                                  cheque
                                )
                              }
                              title="Depositar cheque"
                            >
                              <Icon
                                as={FiUpload}
                              />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="green"
                              onClick={() =>
                                entregarCheque(
                                  cheque
                                )
                              }
                              title="Entregar cheque"
                            >
                              <Icon
                                as={FiSend}
                              />
                            </Button>

                          </>
                        )}

                        {/* HISTORIAL */}

                        {cheque.estado !==
                          "PENDIENTE" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              verHistorial(
                                cheque
                              )
                            }
                            title="Ver historial"
                          >
                            <Icon
                              as={FiClock}
                            />
                          </Button>
                        )}

                      </Flex>

                    </Flex>

                  );

                }
              )}

            </Box>

          )}

        </Box>

      </Box>

      <ModalDetalleCheque
          isOpen={
            detalleAbierto
          }
          onClose={() => {
        
            setDetalleAbierto(
              false
            );
        
            setChequeSeleccionado(
              null
            );
        
          }}
          cheque={
            chequeSeleccionado
          }
        />

        <ModalEditarCheque
          isOpen={
            editarAbierto
          }
          onClose={() => {
        
            setEditarAbierto(
              false
            );
        
            setChequeSeleccionado(
              null
            );
        
          }}
          cheque={
            chequeSeleccionado
          }
          onActualizado={
            actualizarCheque
          }
        />

        <ModalCambiarEstadoCheque
  isOpen={
    modalEstadoAbierto
  }

  onClose={() => {

    setModalEstadoAbierto(
      false
    );

    setChequeSeleccionado(
      null
    );

    setAccionEstado(
      null
    );

  }}

  cheque={
    chequeSeleccionado
  }

  accion={
    accionEstado
  }

  onActualizado={
    actualizarCheque
  }
/>

    </Flex>
  );
}