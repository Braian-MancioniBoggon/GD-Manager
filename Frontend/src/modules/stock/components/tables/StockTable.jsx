import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Flex,
  Input,
} from "@chakra-ui/react";

import {
  useEffect,
  useState,
} from "react";

import {
  titulo,
} from "../../../../shared/utils/formatoTexto";

import {
  useStock,
} from "../../context/StockContext";


export default function StockTable({

  tipoSeleccionado,

  setTipoSeleccionado,

  setProductoSeleccionado,

}) {

  const {
    stock,
    cargando,
  } = useStock();


  const [
    busquedaPapel,
    setBusquedaPapel,
  ] = useState("");


  /*
    Cuando cambia la búsqueda:

    - Se limpia el tipo seleccionado.
    - Se limpia la medida seleccionada.

    Esto evita que quede abierto el detalle
    de un papel que ya no estamos buscando.
  */

  useEffect(() => {

    setTipoSeleccionado("");

    setProductoSeleccionado(null);

  }, [
    busquedaPapel,
    setTipoSeleccionado,
    setProductoSeleccionado,
  ]);


  /*
    Agrupamos el stock por tipo de papel.

    Este objeto se utiliza solamente
    para construir la tabla.

    El tipo seleccionado NO guarda este objeto.

    Solamente guardamos:

    "OBRA"

    "ILUSTRACION"

    etc.
  */

  const tipos = Object.values(

    stock
    .filter(
      (item) => item.productoId.activo
    )
    .reduce(
      (acc, item) => {

        const tipo =
          item.productoId.tipo;

        const prioridad =
          item.productoId.prioridad;


        if (!acc[tipo]) {

          acc[tipo] = {

            tipo,

            variantes: [],

            variantesBajoMinimo: 0,

            prioridad,

          };

        }


        acc[tipo].variantes.push(
          item
        );


        if (
          item.hojas <=
          item.productoId.stockMinimo
        ) {

          acc[tipo]
            .variantesBajoMinimo++;

        }


        return acc;

      },
      {}
    )

  );


  /*
    Filtramos los tipos según
    el texto ingresado en el buscador.
  */

  const tiposFiltrados =
    tipos

      .filter((tipo) => {

        const texto =
          busquedaPapel
            ?.trim()
            .toLowerCase();


        if (!texto) {

          return true;

        }


        return tipo.tipo
          .toLowerCase()
          .includes(texto);

      })


      .sort((a, b) =>

        a.tipo.localeCompare(
          b.tipo,
          "es",
          {
            sensitivity: "base",
          }
        )

      );


  if (cargando) {

    return (
      <Spinner />
    );

  }


  return (

    <Box
      flex={1}
      p={6}
    >

      <Flex
        justify="space-between"
        align="center"
        mb={6}
        gap={4}
      >

        <Heading>
          Stock de Papel
        </Heading>


        {/* BUSCADOR */}

        <Box>

          <Input

            value={
              busquedaPapel
            }

            onChange={(e) =>
              setBusquedaPapel(
                e.target.value
              )
            }

            placeholder="Buscar papel..."

            bg="white"

            maxW="500px"

          />

        </Box>

      </Flex>


      <Table

        bg="white"

        borderRadius="lg"

        overflow="hidden"

        variant="simple"

        sx={{
          tableLayout: "fixed",
        }}

      >

        <Thead>

          <Tr>

            <Th>
              Tipo de Papel
            </Th>

            <Th w="120px">
              Prioridad
            </Th>

            <Th w="250px">
              Estado
            </Th>

          </Tr>

        </Thead>


        <Tbody>

          {tiposFiltrados.map(
            (tipo) => (

              <Tr

                key={
                  tipo.tipo
                }

                cursor="pointer"


                /*
                  Ahora tipoSeleccionado
                  es un STRING.

                  Ejemplo:

                  tipoSeleccionado = "OBRA"

                  tipo.tipo = "OBRA"
                */

                bg={

                  tipoSeleccionado ===
                  tipo.tipo

                    ? "blue.50"

                    : "transparent"

                }


                _hover={{

                  bg:

                    tipoSeleccionado ===
                    tipo.tipo

                      ? "blue.100"

                      : "gray.50",

                }}


                onClick={() => {

                  /*
                    Guardamos SOLAMENTE
                    el tipo de papel.

                    Antes guardábamos:

                    setTipoSeleccionado(tipo)

                    Ahora:

                    setTipoSeleccionado(tipo.tipo)
                  */

                  setTipoSeleccionado(
                    tipo.tipo
                  );


                  /*
                    Al cambiar de tipo
                    limpiamos la medida seleccionada.
                  */

                  setProductoSeleccionado(
                    null
                  );

                }}

              >

                <Td

                  fontWeight={

                    tipoSeleccionado ===
                    tipo.tipo

                      ? "bold"

                      : "normal"

                  }

                >

                  {titulo(
                    tipo.tipo
                  )}

                </Td>


                <Td>

                  <Badge>

                    {tipo.prioridad === 1

                      ? "A"

                      : tipo.prioridad === 2

                        ? "B"

                        : "C"

                    }

                  </Badge>

                </Td>


                <Td>

                  {tipo.variantesBajoMinimo ===
                  0 ? (

                    <Badge
                      colorScheme="green"
                    >

                      Normal

                    </Badge>

                  ) : (

                    <Badge
                      colorScheme="red"
                    >

                      {
                        tipo.variantesBajoMinimo
                      }

                      {
                        tipo.variantesBajoMinimo ===
                        1

                          ? " variante bajo mínimo"

                          : " variantes bajo mínimo"

                      }

                    </Badge>

                  )}

                </Td>

              </Tr>

            )
          )}

        </Tbody>

      </Table>

    </Box>

  );

}