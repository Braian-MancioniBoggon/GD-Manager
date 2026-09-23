import {
  VStack,
  Button,
  Icon,
  Box,
  Heading,
} from "@chakra-ui/react";

import {
  FiPackage,
  FiUsers,
  FiShield,
} from "react-icons/fi";

export default function SidebarConfiguracion({

  vista,
  setVista,

}) {

  return (

    <Box
      w="180px"
      bg="white"
      borderRight="1px solid"
      borderColor="gray.200"
      p={5}
    >

      <Heading
        size="sm"
        mb={5}
      >
        Configuración
      </Heading>

      <VStack
        spacing={2}
        align="stretch"
      >

        <Button

          justifyContent="start"

          leftIcon={
            <Icon as={FiPackage}/>
          }

          variant={
            vista==="papeles"
              ? "solid"
              : "ghost"
          }

          //colorScheme="red"

          onClick={()=>
            setVista("papeles")
          }

        >
          Papeles
        </Button>

        <Button

          justifyContent="start"

          leftIcon={
            <Icon as={FiUsers}/>
          }

          variant={
            vista==="usuarios"
              ? "solid"
              : "ghost"
          }

          //colorScheme="red"

          onClick={()=>
            setVista("usuarios")
          }

        >
          Usuarios
        </Button>

        <Button

          justifyContent="start"

          leftIcon={
            <Icon as={FiShield}/>
          }

          variant={
            vista==="roles"
              ? "solid"
              : "ghost"
          }

          //colorScheme="red"

          onClick={()=>
            setVista("roles")
          }

        >
          Roles
        </Button>

      </VStack>

    </Box>

  );

}