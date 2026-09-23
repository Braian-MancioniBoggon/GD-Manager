import { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";

import StockModalContext from "./StockModalContext";

import StockModals from "../components/StockModals";

export default function StockModalProvider({
  children,
}) {

  const ingreso = useDisclosure();
  const ingresoMasivo = useDisclosure();
  const egreso = useDisclosure();
  const ajuste = useDisclosure();
  const nuevoProducto = useDisclosure();

  const [productoRapido, setProductoRapido] =
    useState(null);

  const abrirIngreso = (producto = null) => {

    setProductoRapido(producto);

    ingreso.onOpen();

  };

  const abrirEgreso = (producto = null) => {

    setProductoRapido(producto);

    egreso.onOpen();

  };

  const abrirAjuste = (producto = null) => {

    setProductoRapido(producto);

    ajuste.onOpen();

  };

  const cerrarIngreso = () => {

    setProductoRapido(null);

    ingreso.onClose();

  };

  const cerrarEgreso = () => {

    setProductoRapido(null);

    egreso.onClose();

  };

  const cerrarAjuste = () => {

    setProductoRapido(null);

    ajuste.onClose();

  };

  return (

    <StockModalContext.Provider
      value={{

        ingreso,
        ingresoMasivo,
        egreso,
        ajuste,
        nuevoProducto,

        productoRapido,

        abrirIngreso,
        abrirEgreso,
        abrirAjuste,

        cerrarIngreso,
        cerrarEgreso,
        cerrarAjuste,

      }}
    >

      {children}
      <StockModals />

    </StockModalContext.Provider>

  );

}