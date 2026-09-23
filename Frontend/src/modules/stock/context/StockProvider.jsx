import {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";

import StockContext from "./StockContext";
import { obtenerStockCompleto } from "../services/stockService";

export default function StockProvider({ children }) {
  const [stock, setStock] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [stockRevision, setStockRevision] = useState(0);

  // Envolvemos en useCallback para que la función no cambie en cada render
  const cargarStock = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerStockCompleto();
      setStock(data);
    } catch (error) {
      console.error("Error al cargar el stock:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  // Función estable para refrescar desde cualquier componente
  const refrescarStock = useCallback(() => {
    setStockRevision(revision => revision + 1);
  }, []);

  // Se ejecuta cada vez que cambia stockRevision
  useEffect(() => {
    cargarStock();
  }, [stockRevision, cargarStock]);

  // Memorizamos TODO el objeto del contexto, incluyendo los datos filtrados
  const contextValue = useMemo(() => {
    
    // Procesamos el stock crítico solo cuando el stock base cambia
    const stockCritico = stock
      .filter(item => item.hojas <= item.productoId.stockMinimo)
      .map(item => ({
        _id: item._id,
        tipo: item.productoId.tipo,
        gramaje: item.productoId.gramaje,
        anchoCm: item.productoId.anchoCm,
        altoCm: item.productoId.altoCm,
        stock: item.hojas,
      }));

    // Procesamos el stock próximo solo cuando el stock base cambia
    const stockProximo = stock
      .filter(item => {
        const minimo = item.productoId.stockMinimo;
        return item.hojas > minimo && item.hojas <= minimo * 1.5;
      })
      .map(item => ({
        _id: item._id,
        tipo: item.productoId.tipo,
        gramaje: item.productoId.gramaje,
        anchoCm: item.productoId.anchoCm,
        altoCm: item.productoId.altoCm,
        stock: item.hojas,
      }));

    return {
      stock,
      cargando,
      stockRevision,
      refrescarStock,
      stockCritico,
      stockProximo,
    };
  }, [stock, cargando, stockRevision, refrescarStock]);

  return (
    <StockContext.Provider value={contextValue}>
      {children}
    </StockContext.Provider>
  );
}