import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Badge,
  Flex,
  Button,
  Spinner,
  Input,
} from "@chakra-ui/react";

import { useState } from "react";

import { useStock } from "../../../stock/context/StockContext";

import { titulo } from "../../../../shared/utils/formatoTexto";

import PapelDetalle from "./PapelDetalle";

export default function PapelesPage() {

  const {
    stock,
    cargando,
  } = useStock();

  const [
    papelSeleccionado,
    setPapelSeleccionado,
  ] = useState(null);

  const [
    busquedaPapel,
    setBusquedaPapel,
  ] = useState("");


  if (cargando) {

    return (
      <>
        <Spinner />

        <Text>
          Cargando papeles...
        </Text>
      </>
    );

  }


  /*
   * IMPORTANTE:
   *
   * Ahora solamente guardamos el nombre
   * del tipo de papel seleccionado.
   *
   * Ya no guardamos todo el objeto "papel".
   */
  if (papelSeleccionado) {

    return (

      <PapelDetalle
        tipo={papelSeleccionado}
        onVolver={() => {

          setPapelSeleccionado(null);

          setBusquedaPapel("");

        }}
      />

    );

  }


  const tipos = Object.values(

    stock.reduce(
      (acc, item) => {

        const tipo =
          item.productoId.tipo;


        if (!acc[tipo]) {

          acc[tipo] = {

            tipo,

            variantes: [],

            variantesActivas: 0,

            variantesInactivas: 0,

          };

        }


        acc[tipo].variantes.push(item);


        if (
          item.productoId.activo
        ) {

          acc[tipo].variantesActivas++;

        } else {

          acc[tipo].variantesInactivas++;

        }


        return acc;

      },
      {}
    )

  );


  const tiposFiltrados = tipos

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


  return (

    <Box p={8}>

      <Flex
        justify="space-between"
        align="center"
        mb={6}
        gap={4}
      >

        <Heading size="lg">

          Papeles

        </Heading>


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

            minW="350px"

          />

        </Box>

      </Flex>


      <SimpleGrid

        columns={{
          base: 1,
          md: 3,
          lg: 4,
        }}

        spacing={5}

      >

        {tiposFiltrados.map(
          (papel) => (

            <Box

              key={
                papel.tipo
              }

              bg="white"

              borderRadius="lg"

              p={5}

              boxShadow="sm"

              border="1px solid"

              borderColor="gray.200"

            >

              <Flex

                justify="space-between"

                align="center"

                mb={4}

              >

                <Heading size="sm">

                  {titulo(
                    papel.tipo
                  )}

                </Heading>


                <Badge

                  colorScheme={

                    papel.variantesActivas > 0

                      ? "green"

                      : "red"

                  }

                >

                  {papel.variantesActivas > 0

                    ? "Activo"

                    : "Inactivo"

                  }

                </Badge>

              </Flex>


              <Text

                fontSize="sm"

                color="gray.500"

                mb={2}

              >

                {papel.variantes.length}

                {" medidas"}

              </Text>


              <Text

                fontSize="sm"

                color="gray.500"

                mb={4}

              >

                {papel.variantesActivas}

                {" activas"}

                {" · "}

                {papel.variantesInactivas}

                {" inactivas"}

              </Text>


              <Button

                size="sm"

                width="100%"

                variant="outline"

                onClick={() =>

                  setPapelSeleccionado(
                    papel.tipo
                  )

                }

              >

                Ver papel

              </Button>

            </Box>

          )

        )}

      </SimpleGrid>

    </Box>

  );

}