import {
  FiPlus,
} from "react-icons/fi";

import {
  Box,
  Text,
  Image,
  Badge,
  Button,
  Heading,
  Flex,
} from "@chakra-ui/react";

import { imgUsuario, logo, } from "../../../../shared/assets";

export default function TarjetaUsuario({

  usuario,

  onClick,

  agregar = false,

  seleccionado = false,

}) {

  return (

    <Flex
      maxH={"165px"}
      flexDirection={"column"}

      align="center"

      mb={4}

      justifyContent={"center"}

      bg="white"

      borderRadius="lg"

      p={5}

      border="1px solid"

      borderColor="gray.200"

      onClick={onClick}

      transition="all .25s ease"

      boxShadow={
        seleccionado
          ? "0 0 25px rgba(255,255,255,.35)"
          : "lg"
      }

      backdropFilter="blur(8px)"

      _hover={{

        boxShadow:
          "0 0 30px rgba(160, 158, 158, 0.38)",

      }}

    >

      <Heading size="sm">

        {agregar
          ? ""
          : usuario.nombre
        }

      </Heading>

      <Box>
        {agregar ? (

          <Text

            fontSize="60px"

            fontWeight="200"

            color="gray.300"

            lineHeight="1"

          >

            <FiPlus />

          </Text>

        ) : (

          <Image

            src={
              usuario.avatar === "usuario"
                ? imgUsuario
                : logo
            }

            p={2}

            m={2}

            bg={usuario.color}

            borderRadius={"100%"}

            boxSize="70px"

            objectFit="contain"

          />

        )}
      </Box>

      {!agregar && (
        <Badge

          colorScheme={
            usuario.activo
              ? "green"
              : "red"
          }

        >

          {usuario.activo
            ? "Activo"
            : "Inactivo"}

        </Badge>
      )}

    </Flex>

  );

}