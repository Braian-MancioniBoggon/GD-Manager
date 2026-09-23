const dgram = require("dgram");

const DISCOVERY_PORT = 41234;

function buscarServidor(timeout = 8000) {

  return new Promise((resolve) => {

    const socket = dgram.createSocket("udp4");

    let finalizado = false;

    function finalizar(resultado) {

      if (finalizado) {
        return;
      }

      finalizado = true;

      try {
        socket.close();
      } catch {}

      resolve(resultado);

    }


    // =================================================
    // RECIBIR ANUNCIO
    // =================================================

    socket.on("message", (message, rinfo) => {

      try {

        const datos =
          JSON.parse(
            message.toString()
          );


        console.log(
          "UDP recibido desde:",
          rinfo.address,
          datos
        );


        if (
          datos.servicio !==
          "stock-papel"
        ) {

          return;

        }


        if (
          datos.id !==
          "servidor-principal"
        ) {

          return;

        }


        const servidor = {

          id:
            datos.id,

          nombre:
            datos.nombre,

          ip:
            rinfo.address,

          puerto:
            datos.puerto,

          url:
            `http://${rinfo.address}:${datos.puerto}`,

        };


        console.log(
          "✓ Stock Papel encontrado:",
          servidor.url
        );


        finalizar(
          servidor
        );

      } catch (error) {

        console.log(
          "Paquete UDP ignorado:",
          error.message
        );

      }

    });


    // =================================================
    // ERROR
    // =================================================

    socket.on("error", (error) => {

      console.log(
        "Error UDP:",
        error.message
      );

      finalizar(null);

    });


    // =================================================
    // ESCUCHAR
    // =================================================

    socket.bind(
      DISCOVERY_PORT,
      "0.0.0.0",
      () => {

        console.log(
          `Escuchando UDP en puerto ${DISCOVERY_PORT}...`
        );

      }
    );


    // =================================================
    // TIMEOUT
    // =================================================

    setTimeout(() => {

      if (!finalizado) {

        console.log(
          "✗ No se encontró servidor mediante UDP."
        );

        finalizar(null);

      }

    }, timeout);

  });

}


module.exports = {
  buscarServidor,
};