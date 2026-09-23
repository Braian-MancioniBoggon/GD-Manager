import {
  Box,
  Flex,
  Heading,
  Button,
} from "@chakra-ui/react";

import {
  FiPlusCircle,
  FiArchive,
  FiFilePlus,
  FiFileMinus,
  FiRepeat,
  FiClipboard,
} from "react-icons/fi";

import DashboardGrid from "../components/DashboardGrid";
import DashboardItem from "../components/DashboardItem";

import UltimosMovimientosWidget from "../widgets/stockMovimientos/UltimosMovimientosWidget";
import StockCriticoWidget from "../widgets/stockCritico/StockCriticoWidget";
import StockProximoWidget from "../widgets/StockProximoWidget";
import AccesoDirecto from "../widgets/AccesoDirecto";
import { useStockModal, } from "../../stock/context/StockModalContext";

export default function DashboardPage({
  onIrStock,
  onIrHistorial,
}) {

  const {
    abrirIngreso,
    abrirEgreso,
    abrirAjuste,
    ingresoMasivo,
    nuevoProducto,
  } = useStockModal();

  return (

    <Box p={8}>

      <Flex
        justify="space-between"
        align="center"
        mb={8}
      >

        <Heading size="lg">
          Inicio
        </Heading>

        <Button colorScheme="red">
          Personalizar
        </Button>

      </Flex>


      <Box
        p={8}
        w="100%"
        bg="gray.100"
      >

        <DashboardGrid>

          <DashboardItem col={1}>
            <AccesoDirecto 
              tooltip='Nuevo papel'
              icono={FiPlusCircle}
              accionModal={
                nuevoProducto.onOpen
              }
            />
          </DashboardItem>

          <DashboardItem col={1}>
            <AccesoDirecto 
              tooltip='Ingreso Masivo'
              icono={FiArchive}
              accionModal={
                ingresoMasivo.onOpen
              }
            />
          </DashboardItem>

          <DashboardItem col={1}>
            <AccesoDirecto 
              tooltip='Ingreso'
              icono={FiFilePlus}
              accionModal={() =>
                abrirIngreso()
              }
            />
          </DashboardItem>

          <DashboardItem col={1}>
            <AccesoDirecto 
              tooltip='Egreso'
              icono={FiFileMinus}
              accionModal={() =>
                abrirEgreso()
              }
            />
          </DashboardItem>

          <DashboardItem col={1}>
            <AccesoDirecto 
              tooltip='Ajuste'
              icono={FiRepeat}
              accionModal={() =>
                abrirAjuste()
              }
            />
          </DashboardItem>

          <DashboardItem col={1}>
            <AccesoDirecto 
              tooltip='Historial'
              icono={FiClipboard}
              accionModal={
                onIrHistorial
              }
            />
          </DashboardItem>

        </DashboardGrid>

      </Box>


      <Box
        p={8}
        w="100%"
        bg="gray.100"
      >

        <DashboardGrid>

          <DashboardItem col={4}>

            <StockProximoWidget
              onIrStock={onIrStock}
            />

          </DashboardItem>


          <DashboardItem col={4}>

            <StockCriticoWidget 
              onIrStock={onIrStock}
            />

          </DashboardItem>


          <DashboardItem col={4}>

            <UltimosMovimientosWidget 
              onIrHistorial={onIrHistorial}
            />

          </DashboardItem>

        </DashboardGrid>

      </Box>

    </Box>

  );

}