import { ChakraProvider } from "@chakra-ui/react";
import UsuarioProvider, { useUsuario } from "../modules/auth/context/UsuarioContext";
import StockModalProvider from "../modules/stock/context/StockModalProvider";
import StockPage from "../modules/stock/pages/StockPage";
import SelectorUsuario from "../modules/auth/components/SelectorUsuario";
import StockProvider from "../modules/stock/context/StockProvider";

function AppContent() {
  const { usuarioActual } = useUsuario();

  return usuarioActual ? (
    <StockPage />
  ) : (
    <SelectorUsuario />
  );
}

export default function App() {
  return (
    <ChakraProvider>
      <UsuarioProvider>
        <StockProvider>
          <StockModalProvider>
            <AppContent />
          </StockModalProvider>
        </StockProvider>
      </UsuarioProvider>
    </ChakraProvider>
  );
}