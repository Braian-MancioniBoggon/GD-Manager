import {
  Flex,
  Box,
} from "@chakra-ui/react";

import {
  useState,
} from "react";

import SidebarConfiguracion
from "../components/SidebarConfiguracion";

import PapelesPage
from "../components/papeles/PapelesPage";

import UsuariosPage
from "./UsuariosPage";

import RolesPage
from "./RolesPage";

export default function ConfiguracionPage(){

  const [

    vista,

    setVista,

  ]=useState("papeles");

  return(

    <Flex
      h="100vh"
    >

      <SidebarConfiguracion

        vista={vista}

        setVista={setVista}

      />

      <Box
        flex={1}
        overflow="auto"
        bg="gray.100"
      >

        {

          vista==="papeles"

          &&

          <PapelesPage/>

        }

        {

          vista==="usuarios"

          &&

          <UsuariosPage/>

        }

        {

          vista==="roles"

          &&

          <RolesPage/>

        }

      </Box>

    </Flex>

  );

}