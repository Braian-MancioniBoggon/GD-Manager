import {
  FiPlus,
} from "react-icons/fi";

import {
  Flex,
  Heading,
  Badge,
  Text,
  Icon,
} from "@chakra-ui/react";

export default function TarjetaRol({

  rol,

  agregar = false,

  seleccionado = false,

  onClick,

}) {

  return (

    <Flex

      maxH="165px"

      flexDirection="column"

      justify="center"

      align="center"

      bg="white"

      borderRadius="lg"

      p={5}

      cursor="pointer"

      transition=".25s"

      boxShadow="sm"

      onClick={onClick}

      _hover={{

        boxShadow:

          "0 0 30px rgba(160,158,158,.35)",

      }}

    >

      {agregar ? (

        <>

          <Icon

            as={FiPlus}

            boxSize={12}

            color="gray.400"

          />

          <Text
            mt={2}
          >

            Nuevo Rol

          </Text>

        </>

      ) : (

        <>

          <Heading

            size="sm"

            textAlign="center"

          >

            {rol.nombre}

          </Heading>

          <Badge

            mt={4}

            colorScheme={

              rol.activo

                ? "green"

                : "red"

            }

          >

            {rol.activo

              ? "Activo"

              : "Inactivo"}

          </Badge>

        </>

      )}

    </Flex>

  );

}