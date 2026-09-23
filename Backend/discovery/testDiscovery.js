const dgram = require("dgram");

const DISCOVERY_PORT = 41234;

const socket = dgram.createSocket("udp4");

socket.on("message", (message, remote) => {

  try {

    const data = JSON.parse(
      message.toString()
    );

    if (
      data.servicio !== "stock-papel"
    ) {
      return;
    }

    console.log("");
    console.log(
      "================================"
    );

    console.log(
      "Servidor encontrado"
    );

    console.log(
      "Nombre:",
      data.nombre
    );

    console.log(
      "IP:",
      remote.address
    );

    console.log(
      "Puerto:",
      data.puerto
    );

    console.log(
      "================================"
    );

  } catch (error) {

    console.log(
      "Mensaje UDP inválido:",
      error.message
    );

  }

});

socket.on("error", (error) => {

  console.error(
    "Error UDP:",
    error.message
  );

  socket.close();

});

socket.bind(
  DISCOVERY_PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Escuchando servidores Stock Papel en UDP ${DISCOVERY_PORT}...`
    );

  }
);