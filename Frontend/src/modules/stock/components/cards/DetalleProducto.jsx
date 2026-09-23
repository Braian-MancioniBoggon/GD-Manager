import {
  Box,
  Heading,
  Text,
  VStack,
  Badge,
  Flex,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tooltip,
  Icon,
} from "@chakra-ui/react";

import {
  useMemo,
} from "react";

import {
  FiFilePlus,
  FiFileMinus,
  FiRepeat,
} from "react-icons/fi";

import {
  titulo,
} from "../../../../shared/utils/formatoTexto";

import {
  useStock,
} from "../../context/StockContext";


export default function DetalleProducto({

  tipoSeleccionado,

  productoSeleccionado,

  setProductoSeleccionado,

  onIngreso,

  onEgreso,

  onAjuste,

}) {

  /*
    Obtenemos el stock actual
    desde StockProvider.

    Cada vez que refrescarStock()
    actualiza el stock, este componente
    recibe automáticamente los datos nuevos.
  */

  const {
    stock,
    cargando,
  } = useStock();


  /*
    Buscamos las variantes actuales
    del tipo de papel seleccionado.

    Ejemplo:

    tipoSeleccionado = "OBRA"

    variantes = [
      medida 66x100,
      medida 72x102,
      medida 70x100,
      ...
    ]

    Como "stock" cambia después de un ingreso,
    egreso o ajuste, esta lista también
    se actualiza automáticamente.
  */

  const variantes =
    useMemo(() => {

      if (!tipoSeleccionado) {

        return [];

      }


      return stock.filter(
        (item) =>
          item.productoId?.tipo === tipoSeleccionado &&
          item.productoId?.activo !== false
      );

    }, [
      stock,
      tipoSeleccionado,
    ]);


  /*
    Buscamos la versión ACTUALIZADA
    de la medida seleccionada.

    Esto es importante porque
    productoSeleccionado puede ser
    un objeto antiguo.

    Ejemplo:

    Objeto seleccionado:
    hojas: 100

    Después de un ingreso:
    hojas: 150

    Buscamos nuevamente el mismo
    _id dentro del stock actualizado.
  */

  const productoSeleccionadoActual =
    useMemo(() => {

      if (!productoSeleccionado) {

        return null;

      }


      return variantes.find(
        (item) =>
          item._id ===
          productoSeleccionado._id
      ) ?? null;

    }, [
      variantes,
      productoSeleccionado,
    ]);


  /*
    Si no hay un tipo seleccionado,
    mostramos el mensaje inicial.
  */

  if (!tipoSeleccionado) {

    return (

      <Box

        w="400px"

        bg="white"

        borderLeft="1px solid"

        borderColor="gray.200"

        p={6}

        h="100vh"

      >

        <Text color="gray.500">

          Seleccione un tipo de papel

        </Text>

      </Box>

    );

  }


  /*
    Agrupamos las variantes
    por gramaje.

    Ejemplo:

    70 gr
      66x100
      72x102

    90 gr
      66x100
      70x100
  */

  const gramajes = {};


  variantes.forEach(
    (item) => {

      const gramaje =
        item.productoId.gramaje;


      if (!gramajes[gramaje]) {

        gramajes[gramaje] = [];

      }


      gramajes[gramaje].push(
        item
      );

    }
  );


  return (

    <Box

      w="400px"

      bg="white"

      borderLeft="1px solid"

      borderColor="gray.200"

      p={6}

      overflowY="auto"

      h="100vh"

      sx={{
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#E20A19",
          borderRadius: "10px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "#e20a1893",
        },
      }}

    >

      <Heading size="md">

        {titulo(
          tipoSeleccionado
        )}

      </Heading>


      <VStack

        align="stretch"

        spacing={6}

      >

        <Accordion

          key={
            tipoSeleccionado
          }

          allowMultiple

        >

          {Object.entries(
            gramajes
          ).map(

            ([gramaje, items]) => {


              /*
                Contamos cuántas medidas
                están debajo del mínimo.
              */

              const variantesBajoMinimo =
                items.filter(

                  (item) =>

                    item.hojas <=
                    item.productoId.stockMinimo

                ).length;


              return (

                <AccordionItem
                  key={gramaje}
                >

                  <AccordionButton>

                    <Box
                      flex="1"
                      textAlign="left"
                    >

                      <Text
                        fontWeight="bold"
                      >

                        {gramaje} gr

                      </Text>


                      {variantesBajoMinimo === 0 ? (

                        <Badge

                          mt={1}

                          colorScheme="green"

                        >

                          Stock normal

                        </Badge>

                      ) : (

                        <Badge

                          mt={1}

                          colorScheme="red"

                        >

                          {
                            variantesBajoMinimo
                          }{" "}

                          {
                            variantesBajoMinimo === 1

                              ? "medida bajo mínimo"

                              : "medidas bajo mínimo"

                          }

                        </Badge>

                      )}

                    </Box>


                    <AccordionIcon />

                  </AccordionButton>


                  <AccordionPanel
                    pb={4}
                  >

                    {[...items]

                      /*
                        Ordenamos primero
                        por el lado más largo.
                      */

                      .sort((a, b) => {

                        const largoA =
                          Math.max(

                            a.productoId.anchoCm,

                            a.productoId.altoCm

                          );


                        const largoB =
                          Math.max(

                            b.productoId.anchoCm,

                            b.productoId.altoCm

                          );


                        if (
                          largoA !==
                          largoB
                        ) {

                          return (
                            largoA -
                            largoB
                          );

                        }


                        /*
                          Si tienen el mismo
                          lado largo,
                          ordenamos por
                          el lado corto.
                        */

                        const cortoA =
                          Math.min(

                            a.productoId.anchoCm,

                            a.productoId.altoCm

                          );


                        const cortoB =
                          Math.min(

                            b.productoId.anchoCm,

                            b.productoId.altoCm

                          );


                        return (
                          cortoA -
                          cortoB
                        );

                      })


                      .map(
                        (item) => {


                          const bajoMinimo =

                            item.hojas <=
                            item.productoId.stockMinimo;


                          /*
                            La selección se compara
                            por ID.

                            Aunque el objeto de stock
                            se actualice, el ID sigue
                            siendo el mismo.
                          */

                          const seleccionado =

                            productoSeleccionado?._id ===
                            item._id;


                          return (

                            <Flex

                              key={
                                item._id
                              }

                              flexDirection="column"

                              justify="space-between"

                              align="center"

                              py={2}

                              px={2}

                              cursor="pointer"

                              borderRadius="md"

                              bg={

                                seleccionado

                                  ? "blue.50"

                                  : "transparent"

                              }


                              onClick={() =>

                                setProductoSeleccionado(
                                  item
                                )

                              }

                            >

                              <Flex

                                justify="space-between"

                                align="center"

                                w="100%"

                              >

                                {/* INFORMACIÓN */}

                                <Box>

                                  <Text
                                    fontWeight="bold"
                                  >

                                    {
                                      item.productoId.anchoCm
                                    }{" "}

                                    x{" "}

                                    {
                                      item.productoId.altoCm
                                    }{" "}

                                    cm

                                  </Text>


                                  <Text

                                    fontSize="sm"

                                    color="gray.500"

                                  >

                                    Mínimo:{" "}

                                    {
                                      item.productoId.stockMinimo
                                    }

                                  </Text>

                                </Box>


                                {/* STOCK */}

                                <Flex

                                  align="center"

                                  gap={2}

                                >

                                  <Box
                                    textAlign="right"
                                  >

                                    <Text>

                                      {
                                        item.hojas
                                      }{" "}

                                      hojas

                                    </Text>


                                    <Badge

                                      colorScheme={

                                        bajoMinimo

                                          ? "red"

                                          : "green"

                                      }

                                    >

                                      {

                                        bajoMinimo

                                          ? "Reponer"

                                          : "Normal"

                                      }

                                    </Badge>

                                  </Box>

                                </Flex>

                              </Flex>


                              {/* 
                                BOTONES DE ACCIONES RÁPIDAS

                                Solamente aparecen
                                en la medida seleccionada.
                              */}

                              {seleccionado && (

                                <Flex

                                  spacing={0}

                                  justifyContent="space-evenly"

                                  w="75%"

                                >

                                  {/* INGRESO */}

                                  <Tooltip
                                    label="Ingreso"
                                  >

                                    <Button

                                      variant="ghost"

                                      size="sm"

                                      minW="32px"

                                      h="32px"

                                      p={0}

                                      onClick={(e) => {

                                        e.stopPropagation();

                                        /*
                                          Enviamos el objeto
                                          completo.

                                          StockIngresoModal
                                          sigue funcionando
                                          porque recibe:

                                          productoRapido.productoId
                                        */

                                        onIngreso();

                                      }}

                                    >

                                      <Icon

                                        as={
                                          FiFilePlus
                                        }

                                        boxSize={5}

                                      />

                                    </Button>

                                  </Tooltip>


                                  {/* EGRESO */}

                                  <Tooltip
                                    label="Egreso"
                                  >

                                    <Button

                                      variant="ghost"

                                      size="sm"

                                      minW="32px"

                                      h="32px"

                                      p={0}

                                      onClick={(e) => {

                                        e.stopPropagation();

                                        onEgreso();

                                      }}

                                    >

                                      <Icon

                                        as={
                                          FiFileMinus
                                        }

                                        boxSize={5}

                                      />

                                    </Button>

                                  </Tooltip>


                                  {/* AJUSTE */}

                                  <Tooltip
                                    label="Ajuste"
                                  >

                                    <Button

                                      variant="ghost"

                                      size="sm"

                                      minW="32px"

                                      h="32px"

                                      p={0}

                                      onClick={(e) => {

                                        e.stopPropagation();

                                        onAjuste();

                                      }}

                                    >

                                      <Icon

                                        as={
                                          FiRepeat
                                        }

                                        boxSize={5}

                                      />

                                    </Button>

                                  </Tooltip>

                                </Flex>

                              )}

                            </Flex>

                          );

                        }

                      )}

                  </AccordionPanel>

                </AccordionItem>

              );

            }

          )}

        </Accordion>

      </VStack>

    </Box>

  );

}