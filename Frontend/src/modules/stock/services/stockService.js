import api from "../../../shared/services/api";

export const obtenerStock = async () => {
  const response = await api.get("/stock");
  return response.data;
};

export const obtenerStockCompleto =
  async () => {

    const { data } =
      await api.get(
        "/stock/completo"
      );

    return data;

};