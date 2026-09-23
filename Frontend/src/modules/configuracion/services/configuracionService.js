import axios from "axios";

const API =
  "http://localhost:5000/api";


export async function actualizarProducto(
  id,
  datos
) {

  const response =
    await axios.put(
      `${API}/productos/${id}`,
      datos
    );

  return response.data;

}