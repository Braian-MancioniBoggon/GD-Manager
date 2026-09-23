import api from "../../../shared/services/api";

export const ingresarPapel = async (datos) => {
  const response = await api.post(
    "/movimientos/ingreso",
    datos
  );

  return response.data;
};

export const retirarPapel = async (datos) => {
  const response = await api.post(
    "/movimientos/egreso",
    datos
  );

  return response.data;
};

export const ajustarStock = async (datos) => {
  const response = await api.post(
    "/movimientos/ajuste",
    datos
  );

  return response.data;
};

export const obtenerMovimientos =
  async (filtros = {}) => {
    const response =
      await api.get(
        "/movimientos",
        {
          params: filtros,
        }
      );

    return response.data;
  };