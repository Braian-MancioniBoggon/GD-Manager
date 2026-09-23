import {
  createContext,
  useContext,
} from "react";

const StockContext =
  createContext(null);

export default StockContext;

export function useStock() {

  const context =
    useContext(StockContext);

  if (!context) {

    throw new Error(
      "useStock debe utilizarse dentro de StockProvider"
    );

  }

  return context;

}