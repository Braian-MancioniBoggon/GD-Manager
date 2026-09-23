import {
  createContext,
  useContext,
} from "react";

const StockModalContext =
  createContext(null);

export const useStockModal = () =>
  useContext(StockModalContext);

export default StockModalContext;