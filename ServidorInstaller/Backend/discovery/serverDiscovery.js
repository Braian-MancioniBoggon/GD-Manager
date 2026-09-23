const dgram = require("dgram");

const DISCOVERY_PORT = 41234;

const SERVICIO = "stock-papel";
const SERVIDOR_ID = "servidor-principal";
const NOMBRE_SERVIDOR = "Stock Papel";

let socket = null;
let intervalo = null;

function crearMensaje() {
  return JSON.stringify({
    servicio: SERVICIO,
    id: SERVIDOR_ID,
    nombre: NOMBRE_SERVIDOR,
    puerto: Number(process.env.PORT) || 5000,
  });
}

function iniciarDiscovery() {

  if (socket) {
    console.log("Discovery UDP ya está iniciado.");
    return;
  }

  socket = dgram.createSocket("udp4");

  socket.on("error", (error) => {

    console.error(
      "Error en Discovery UDP:",
      error.message
    );

    socket.close();

    socket = null;
  });

  socket.bind(() => {

    socket.setBroadcast(true);

    console.log(
      `Discovery UDP iniciado en puerto ${DISCOVERY_PORT}`
    );

    anunciarServidor();

    intervalo = setInterval(() => {

      anunciarServidor();

    }, 5000);

  });

}

function anunciarServidor() {

  if (!socket) {
    return;
  }

  const mensaje = Buffer.from(
    crearMensaje()
  );

  socket.send(
    mensaje,
    0,
    mensaje.length,
    DISCOVERY_PORT,
    "255.255.255.255",
    (error) => {

      if (error) {

        console.error(
          "Error enviando anuncio UDP:",
          error.message
        );

        return;
      }

      console.log(
        "📡 Servidor anunciado en la red"
      );

    }
  );

}

function detenerDiscovery() {

  if (intervalo) {

    clearInterval(intervalo);

    intervalo = null;

  }

  if (socket) {

    socket.close();

    socket = null;

  }

  console.log(
    "Discovery UDP detenido."
  );

}

module.exports = {
  iniciarDiscovery,
  detenerDiscovery,
};