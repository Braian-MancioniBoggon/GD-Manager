import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  HStack,
} from "@chakra-ui/react";

import {
  useState,
} from "react";

import {
  useStock,
} from "../../../stock/context/StockContext";

import EditarProductoModal from "../EditarProductoModal";

import {
  titulo,
} from "../../../../shared/utils/formatoTexto";

export default function PapelDetalle({
  tipo,
  onVolver,
}) {

  const {
    stock,
    refrescarStock,
  } = useStock();


  const [
    productoEditar,
    setProductoEditar,
  ] = useState(null);


  const [
    modalEditarAbierto,
    setModalEditarAbierto,
  ] = useState(false);


  /*
   * BUSCAMOS LAS VARIANTES DIRECTAMENTE
   * DESDE EL STOCK ACTUAL DEL PROVIDER.
   *
   * Cada vez que refrescarStock() actualiza
   * el provider, este componente recibe
   * automáticamente el stock nuevo.
   */
  const variantes = stock

    .filter(
      (item) =>
        item.productoId.tipo === tipo
    )

    .sort((a, b) => {

      const gramajeA =
        a.productoId.gramaje;

      const gramajeB =
        b.productoId.gramaje;


      if (
        gramajeA !==
        gramajeB
      ) {

        return (
          gramajeA -
          gramajeB
        );

      }


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

    });


  /*
   * El papel está activo si al menos
   * una de sus variantes está activa.
   */
  const papelActivo =
    variantes.some(
      (item) =>
        item.productoId.activo
    );


  function abrirEditar(producto) {

    setProductoEditar(
      producto
    );

    setModalEditarAbierto(
      true
    );

  }


  function cerrarEditar() {

    setModalEditarAbierto(
      false
    );

    setProductoEditar(
      null
    );

  }

  async function cambiarEstadoPapel() {
    
    const nuevoEstado =
      !papelActivo;


    try {

      await fetch(
        `http://localhost:5000/api/productos/tipo/${tipo}/estado`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            activo: nuevoEstado,
          }),
        }
      );


      refrescarStock();


    } catch (error) {

      console.error(
        "Error cambiando estado del papel",
        error
      );

    }

  }


  return (

    <>

      <Box p={8}>

        <Button

          mb={6}

          variant="ghost"

          colorScheme="red"

          onClick={
            onVolver
          }

        >

          ← Volver a papeles

        </Button>


        <HStack

          justify="space-between"

          mb={6}

        >

          <Box>

            <Heading size="md">

              {titulo(tipo)}

            </Heading>


            <Badge

              mt={2}

              colorScheme={

                papelActivo

                  ? "green"

                  : "red"

              }

            >

              {papelActivo

                ? "Activo"

                : "Inactivo"

              }

            </Badge>

          </Box>


          <Button

            colorScheme={

              papelActivo

                ? "red"

                : "green"

            }

            variant="outline"

            onClick={
              cambiarEstadoPapel
            }

          >

            {papelActivo

              ? "Desactivar papel"

              : "Activar papel"

            }

          </Button>

        </HStack>


        <Box

          bg="white"

          borderRadius="lg"

          overflow="hidden"

          boxShadow="sm"

        >

          <Table>

            <Thead>

              <Tr>

                <Th>
                  Gramaje
                </Th>

                <Th>
                  Medida
                </Th>

                <Th>
                  Stock mínimo
                </Th>

                <Th>
                  Prioridad
                </Th>

                <Th>
                  Estado
                </Th>

                <Th>
                  Acción
                </Th>

              </Tr>

            </Thead>


            <Tbody>

              {variantes.map(
                (item) => {

                  const producto =
                    item.productoId;


                  return (

                    <Tr
                      key={
                        item._id
                      }
                    >

                      <Td>

                        {producto.gramaje}

                        {" g"}

                      </Td>


                      <Td>

                        {producto.anchoCm}

                        {" × "}

                        {producto.altoCm}

                        {" cm"}

                      </Td>


                      <Td>

                        {producto.stockMinimo}

                      </Td>


                      <Td>

                        <Badge>

                          {producto.prioridad === 1

                            ? "A"

                            : producto.prioridad === 2

                              ? "B"

                              : "C"

                          }

                        </Badge>

                      </Td>


                      <Td>

                        <Badge

                          colorScheme={

                            producto.activo

                              ? "green"

                              : "red"

                          }

                        >

                          {producto.activo

                            ? "Activa"

                            : "Inactiva"

                          }

                        </Badge>

                      </Td>


                      <Td>

                        <Button

                          size="sm"

                          variant="outline"

                          onClick={() =>

                            abrirEditar(
                              item
                            )

                          }

                        >

                          Editar

                        </Button>

                      </Td>

                    </Tr>

                  );

                }

              )}

            </Tbody>

          </Table>

        </Box>

      </Box>


      <EditarProductoModal

        isOpen={
          modalEditarAbierto
        }

        onClose={
          cerrarEditar
        }

        producto={
          productoEditar
        }

      />

    </>

  );

}