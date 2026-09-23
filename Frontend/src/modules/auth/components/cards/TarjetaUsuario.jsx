import {
FiPlus,
} from "react-icons/fi";

import {
Box,
VStack,
Text,
Image,
} from "@chakra-ui/react";

import { imgUsuario, logo } from "../../../../shared/assets";

export default function TarjetaUsuario({
usuario,
onClick,
agregar = false,
}) {

return (
<VStack
spacing={5}
cursor="pointer"
userSelect="none"
transition="all .25s ease"
onClick={
onClick
}
_hover={{
transform:
"scale(1.08)",
}}
>

  <Box
    w="120px"
    h="120px"
    borderRadius="100%"
    bg={
      agregar
        ? "whiteAlpha.100"
        : usuario?.color ||
          "#E20A19"
    }
    border="4px solid"
    borderColor={
      agregar
        ? "gray.500"
        : usuario?.color ||
          "#E20A19"
    }
    display="flex"
    alignItems="center"
    justifyContent="center"
    overflow="hidden"
    transition="all .25s ease"
    boxShadow="lg"
    backdropFilter="blur(8px)"
    _hover={{
      borderColor:
        "white",

      boxShadow:
        "0 0 30px rgba(255,255,255,.25)",

      bg:
        agregar
          ? "whiteAlpha.200"
          : usuario?.color ||
            "#E20A19",
    }}
  >

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
          usuario?.avatar ===
          "usuario"
            ? imgUsuario
            : logo
        }
        boxSize="70px"
        objectFit="contain"
      />

    )}

  </Box>

  <Text
    color="white"
    fontSize="lg"
    fontWeight="600"
    textAlign="center"
  >
    {
      agregar
        ? "Nuevo usuario"
        : usuario.nombre
    }
  </Text>

</VStack>

);

}