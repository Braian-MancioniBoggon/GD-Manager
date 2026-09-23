import {
Box,
VStack,
Icon,
Button,
Tooltip,
Divider,
Image,
} from "@chakra-ui/react";

import {
FiPackage,
FiPlusSquare,
FiArchive,
FiFilePlus,
FiFileMinus,
FiRepeat,
FiClipboard,
FiSettings,
FiUser,
} from "react-icons/fi";
import { logo } from "../assets/index";

export default function Sidebar({
onDashboard,
onNuevoProducto,
onIngreso,
onIngresoMasivo,
onEgreso,
onAjuste,
onHistorial,
onStock,
onConfiguracion,
onPerfil,
}) {
return ( <Box
   w="80px"
   bg="white"
   borderRight="1px solid"
   borderColor="gray.200"
   p={4}
   position="sticky"
   top="0"
   h="100vh"
 > <VStack spacing={4}>
    {/* INICIO */}

    <Tooltip
      label="Inicio"
      placement="right"
    >
      <Button
        variant="ghost"
        w="100%"
        p={1}
        onClick={onDashboard}
      >
        <Image
          src={logo}
          boxSize={12}
          objectFit="contain"
        />
      </Button>
    </Tooltip>

    <Divider />

    {/* STOCK PAPEL */}

    <Tooltip
      label="Stock Papel"
      placement="right"
    >
      <Button
        variant="ghost"
        w="100%"
        onClick={onStock}
      >
        <Icon
          as={FiPackage}
          boxSize={5}
        />
      </Button>
    </Tooltip>

    <Divider />

    {/* NUEVO PAPEL */}

    <Tooltip
      label="Nuevo Papel"
      placement="right"
    >
      <Button
        variant="ghost"
        w="100%"
        onClick={onNuevoProducto}
      >
        <Icon
          as={FiPlusSquare}
          boxSize={5}
        />
      </Button>
    </Tooltip>

    {/* INGRESO MASIVO */}

    <Tooltip
      label="Ingreso Masivo"
      placement="right"
    >
      <Button
        variant="ghost"
        w="100%"
        onClick={onIngresoMasivo}
      >
        <Icon
          as={FiArchive}
          boxSize={5}
        />
      </Button>
    </Tooltip>

    {/* INGRESO */}

    <Tooltip
      label="Ingreso"
      placement="right"
    >
      <Button
        variant="ghost"
        w="100%"
        onClick={onIngreso}
      >
        <Icon
          as={FiFilePlus}
          boxSize={5}
        />
      </Button>
    </Tooltip>

    {/* EGRESO */}

    <Tooltip
      label="Egreso"
      placement="right"
    >
      <Button
        variant="ghost"
        w="100%"
        onClick={onEgreso}
      >
        <Icon
          as={FiFileMinus}
          boxSize={5}
        />
      </Button>
    </Tooltip>

    {/* AJUSTE */}

    <Tooltip
      label="Ajuste"
      placement="right"
    >
      <Button
        variant="ghost"
        w="100%"
        onClick={onAjuste}
      >
        <Icon
          as={FiRepeat}
          boxSize={5}
        />
      </Button>
    </Tooltip>

    {/* HISTORIAL */}

    <Tooltip
      label="Historial"
      placement="right"
    >
      <Button
        variant="ghost"
        w="100%"
        onClick={onHistorial}
      >
        <Icon
          as={FiClipboard}
          boxSize={5}
        />
      </Button>
    </Tooltip>

    <Divider />

    {/* CONFIGURACIÓN */}

    <Tooltip
      label="Configuración"
      placement="right"
    >
      <Button
        variant="ghost"
        w="100%"
        onClick={onConfiguracion}
      >
        <Icon
          as={FiSettings}
          boxSize={5}
        />
      </Button>
    </Tooltip>

    {/* MI PERFIL */}

    <Tooltip
      label="Mi perfil"
      placement="right"
    >
      <Button
        variant="ghost"
        w="100%"
        onClick={onPerfil}
      >
        <Icon
          as={FiUser}
          boxSize={5}
        />
      </Button>
    </Tooltip>

  </VStack>
</Box>
);
}