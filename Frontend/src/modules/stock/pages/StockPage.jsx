import {
Box,
Flex,
useDisclosure,
} from "@chakra-ui/react";

import Sidebar from "../../../shared/components/Sidebar";
import StockTable from "../components/tables/StockTable";
import DetalleProducto from "../components/cards/DetalleProducto";
import HistorialPage from "../../historial/pages/HistorialPage";
import DashboardPage from "../../dashboard/pages/DashboardPage";
import ConfiguracionPage from "../../configuracion/pages/ConfiguracionPage";
import ModalMiPerfil from "../../auth/components/modals/ModalMiPerfil";
import ChequesPage from "../../cheques/pages/ChequesPage";

import { useStockModal } from "../context/StockModalContext";

import { useState } from "react";

export default function StockPage() {

const [
tipoSeleccionado,
setTipoSeleccionado,
] = useState("");

const [
productoSeleccionado,
setProductoSeleccionado,
] = useState(null);

const [
pantalla,
setPantalla,
] = useState("dashboard");

const perfilModal =
useDisclosure();

const {
abrirIngreso,
abrirEgreso,
abrirAjuste,
ingresoMasivo,
nuevoProducto,
} = useStockModal();

return ( <Flex
   minH="100vh"
   bg="gray.100"
 >
  <Sidebar

    onNuevoProducto={
      nuevoProducto.onOpen
    }

    onIngreso={() =>
      abrirIngreso()
    }

    onIngresoMasivo={
      ingresoMasivo.onOpen
    }

    onEgreso={() =>
      abrirEgreso()
    }

    onAjuste={() =>
      abrirAjuste()
    }

    onHistorial={() =>
      setPantalla("historial")
    }

    onStock={() =>
      setPantalla("stock")
    }
    
    onCheques={() => 
      setPantalla("cheques") 
    }

    onDashboard={() =>
      setPantalla("dashboard")
    }

    onConfiguracion={() =>
      setPantalla("configuracion")
    }

    onPerfil={
      perfilModal.onOpen
    }

  />

  <Box flex={1}>

    {/* ============================= */}
    {/* DASHBOARD */}
    {/* ============================= */}

    {pantalla === "dashboard" && (

      <DashboardPage

        onIrStock={() =>
          setPantalla("stock")
        }

        onIrHistorial={() =>
          setPantalla("historial")
        }

      />

    )}

    {/* ============================= */}
    {/* STOCK */}
    {/* ============================= */}

    {pantalla === "stock" && (

      <Flex
        h="100%"
        direction="column"
      >

        <Flex
          flex={1}
          minH={0}
        >

          <Box flex={1}>

            <StockTable

              tipoSeleccionado={
                tipoSeleccionado
              }

              setTipoSeleccionado={
                setTipoSeleccionado
              }

              setProductoSeleccionado={
                setProductoSeleccionado
              }

            />

          </Box>

          <Box
            position="sticky"
            top="0"
            h="100vh"
          >

            <DetalleProducto

              tipoSeleccionado={
                tipoSeleccionado
              }

              productoSeleccionado={
                productoSeleccionado
              }

              setProductoSeleccionado={
                setProductoSeleccionado
              }

              onIngreso={() => {

                abrirIngreso(
                  productoSeleccionado
                );

              }}

              onEgreso={() => {

                abrirEgreso(
                  productoSeleccionado
                );

              }}

              onAjuste={() => {

                abrirAjuste(
                  productoSeleccionado
                );

              }}

            />

          </Box>

        </Flex>

      </Flex>

    )}

    {/* ============================= */}
    {/* CHEQUES */}
    {/* ============================= */}

    {pantalla === "cheques" && ( 
    
      <ChequesPage /> 
      
    )}

    {/* ============================= */}
    {/* HISTORIAL */}
    {/* ============================= */}

    {pantalla === "historial" && (

      <HistorialPage />

    )}

    {/* ============================= */}
    {/* CONFIGURACIÓN */}
    {/* ============================= */}

    {pantalla === "configuracion" && (

      <ConfiguracionPage />

    )}

  </Box>

  {/* ============================= */}
  {/* MI PERFIL */}
  {/* ============================= */}

  <ModalMiPerfil
    isOpen={
      perfilModal.isOpen
    }
    onClose={
      perfilModal.onClose
    }
  />
</Flex>

);
}