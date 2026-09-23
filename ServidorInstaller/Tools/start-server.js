const { spawn } = require("child_process");
const net = require("net");
const path = require("path");
const fs = require("fs");

// ========================================
// RUTA BASE
// ========================================

const BASE = path.join(__dirname, "..");


// ========================================
// RUTAS
// ========================================

const MONGOD = path.join(
  BASE,
  "Mongodb",
  "bin",
  "mongod.exe"
);


// ========================================
// DATOS MONGODB
// ========================================
// Los datos NO se guardan dentro de Program Files.
// Se utilizan los datos compartidos de Windows.
//
// C:\ProgramData\Stock Papel Server\data
// ========================================

const MONGO_DATA = path.join(
  process.env.ProgramData || "C:\\ProgramData",
  "Stock Papel Server",
  "data"
);


// Crear la carpeta si no existe

fs.mkdirSync(
  MONGO_DATA,
  {
    recursive: true
  }
);


const NODE = path.join(
  BASE,
  "Node",
  "node.exe"
);

const SERVER = path.join(
  BASE,
  "Backend",
  "server.js"
);


// ========================================
// CONFIGURACIÓN
// ========================================

const MONGO_HOST = "127.0.0.1";
const MONGO_PORT = 27017;

let mongo = null;
let backend = null;
let cerrando = false;


// ========================================
// ENCABEZADO
// ========================================

console.log("========================================");
console.log("   STOCK PAPEL SERVER");
console.log("========================================");
console.log("");

console.log(
  "Datos MongoDB:",
  MONGO_DATA
);

console.log("");


// ========================================
// INICIAR MONGODB
// ========================================

console.log("Iniciando MongoDB...");
console.log("");

mongo = spawn(
  MONGOD,
  [
    "--dbpath",
    MONGO_DATA,
    "--bind_ip",
    MONGO_HOST,
    "--port",
    String(MONGO_PORT),
  ],
  {
    cwd: BASE,
    windowsHide: false,
  }
);


// ========================================
// SALIDA MONGODB
// ========================================

mongo.stdout.on("data", (data) => {

  console.log(
    `[MongoDB] ${data}`
  );

});


mongo.stderr.on("data", (data) => {

  console.error(
    `[MongoDB] ${data}`
  );

});


mongo.on("error", (error) => {

  console.error(
    "Error iniciando MongoDB:",
    error.message
  );

});


mongo.on("exit", (code) => {

  console.log(
    `MongoDB finalizado. Código: ${code}`
  );


  if (!cerrando) {

    console.error(
      "MongoDB se cerró inesperadamente."
    );


    if (backend) {

      backend.kill();

    }

  }

});


// ========================================
// ESPERAR MONGODB
// ========================================

console.log(
  "Esperando que MongoDB esté disponible..."
);

esperarMongoDB();


// ========================================
// COMPROBAR MONGODB
// ========================================

function comprobarMongoDB() {

  return new Promise((resolve) => {

    const socket = new net.Socket();

    let respondio = false;


    socket.setTimeout(1000);


    socket.once("connect", () => {

      respondio = true;

      socket.destroy();

      resolve(true);

    });


    socket.once("timeout", () => {

      socket.destroy();

      resolve(false);

    });


    socket.once("error", () => {

      if (!respondio) {

        socket.destroy();

        resolve(false);

      }

    });


    socket.connect(
      MONGO_PORT,
      MONGO_HOST
    );

  });

}


// ========================================
// ESPERAR HASTA QUE ESTÉ DISPONIBLE
// ========================================

async function esperarMongoDB() {

  while (!cerrando) {

    const disponible =
      await comprobarMongoDB();


    if (disponible) {

      console.log("");
      console.log(
        "MongoDB disponible."
      );

      console.log("");
      console.log(
        "Iniciando Backend..."
      );

      console.log("");

      iniciarBackend();

      return;

    }


    await esperar(1000);

  }

}


// ========================================
// ESPERAR
// ========================================

function esperar(ms) {

  return new Promise((resolve) => {

    setTimeout(resolve, ms);

  });

}


// ========================================
// INICIAR BACKEND
// ========================================

function iniciarBackend() {

  backend = spawn(
    NODE,
    [SERVER],
    {
      cwd: BASE,
      windowsHide: false,
    }
  );


  // ======================================
  // SALIDA BACKEND
  // ======================================

  backend.stdout.on("data", (data) => {

    process.stdout.write(
      `[Backend] ${data}`
    );

  });


  backend.stderr.on("data", (data) => {

    process.stderr.write(
      `[Backend] ${data}`
    );

  });


  backend.on("error", (error) => {

    console.error(
      "Error iniciando Backend:",
      error.message
    );

  });


  backend.on("exit", (code) => {

    console.log(
      `Backend finalizado. Código: ${code}`
    );

  });

}


// ========================================
// CIERRE
// ========================================

function cerrarTodo() {

  if (cerrando) {

    return;

  }


  cerrando = true;


  console.log("");

  console.log(
    "Cerrando Stock Papel Server..."
  );


  if (backend) {

    backend.kill();

    backend = null;

  }


  if (mongo) {

    mongo.kill();

    mongo = null;

  }

}


// ========================================
// CTRL + C
// ========================================

process.on(
  "SIGINT",
  () => {

    cerrarTodo();

    setTimeout(() => {

      process.exit(0);

    }, 1000);

  }
);


// ========================================
// SIGTERM
// ========================================

process.on(
  "SIGTERM",
  () => {

    cerrarTodo();

    setTimeout(() => {

      process.exit(0);

    }, 1000);

  }
);
