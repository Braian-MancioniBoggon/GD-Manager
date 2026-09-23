const { spawn } = require("child_process");
const path = require("path");

const BASE = path.join(__dirname, "..");

const NODE = path.join(
  BASE,
  "Node",
  "node.exe"
);

const SERVER = path.join(
  BASE,
  "Tools",
  "start-server.js"
);

const proceso = spawn(
  NODE,
  [SERVER],
  {
    cwd: BASE,
    windowsHide: false,
    stdio: "inherit",
  }
);

proceso.on("error", (error) => {

  console.error(
    "No se pudo iniciar Stock Papel Server:",
    error.message
  );

});

proceso.on("exit", (code) => {

  process.exit(
    code ?? 0
  );

});