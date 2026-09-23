import axios from "axios";


// =====================================================
// SERVIDOR ACTUAL
// =====================================================

let servidorActual = null;

let buscandoServidor = null;


// =====================================================
// OBTENER SERVIDOR
// =====================================================

async function obtenerServidor() {

  // Si ya lo tenemos, lo usamos
  if (servidorActual) {

    return servidorActual;

  }


  // Evitar búsquedas simultáneas
  if (!buscandoServidor) {

    buscandoServidor =
      window.stockPapel
        .buscarServidor()
        .finally(() => {

          buscandoServidor = null;

        });

  }

  servidorActual =
    await buscandoServidor;

  return servidorActual;

}


// =====================================================
// BUSCAR NUEVO SERVIDOR
// =====================================================

async function redescubrirServidor() {

  servidorActual = null;

  const servidor =
    await window.stockPapel
      .buscarServidor();

  servidorActual =
    servidor;

  return servidor;

}


// =====================================================
// AXIOS
// =====================================================

const api = axios.create({

  timeout: 10000,

});


// =====================================================
// REQUEST
// =====================================================

api.interceptors.request.use(
  async (config) => {

    const servidor =
      await obtenerServidor();

    if (!servidor) {

      return Promise.reject(
        new Error(
          "No se encontró el servidor Stock Papel."
        )
      );

    }

    config.baseURL =
      `${servidor.url}/api`;


    // -------------------------------------------------
    // USUARIO
    // -------------------------------------------------

    const usuario =
      JSON.parse(
        localStorage.getItem(
          "usuario"
        )
      );

    if (
      usuario?._id
    ) {

      config.headers[
        "x-usuario-id"
      ] = usuario._id;

    }

    return config;

  }
);


// =====================================================
// RESPONSE
// =====================================================

api.interceptors.response.use(

  (response) => {

    return response;

  },

  async (error) => {

    const config =
      error.config;


    // -------------------------------------------------
    // ¿YA REINTENTAMOS?
    // -------------------------------------------------

    if (
      config?._servidorRedescubierto
    ) {

      return Promise.reject(
        error
      );

    }


    // -------------------------------------------------
    // ERROR DE CONEXIÓN
    // -------------------------------------------------

    const errorDeConexion =
      !error.response;


    if (
      errorDeConexion
    ) {

      try {

        console.log(
          "Servidor desconectado. Buscando nuevamente..."
        );

        const servidor =
          await redescubrirServidor();


        if (servidor) {

          console.log(
            "Nuevo servidor encontrado:",
            servidor.url
          );

          config._servidorRedescubierto =
            true;

          config.baseURL =
            `${servidor.url}/api`;


          return api.request(
            config
          );

        }

      } catch (errorBusqueda) {

        console.log(
          "No se pudo redescubrir el servidor:",
          errorBusqueda.message
        );

      }

    }


    return Promise.reject(
      error
    );

  }
);


export default api;