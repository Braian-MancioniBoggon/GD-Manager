import api from "../../../shared/services/api";

export const obtenerStockCritico = async () => {
  const { data } = await api.get(
    "/dashboard/stock-critico"
  );

  return data;
};

export const obtenerStockProximo = async () => {

    const { data } =
      await api.get(
        "/dashboard/stock-proximo"
      );

    return data;

};

export const obtenerUltimosMovimientos =
  async () => {

    const { data } =
      await api.get(
        "/dashboard/ultimos-movimientos"
      );

    return data;

};