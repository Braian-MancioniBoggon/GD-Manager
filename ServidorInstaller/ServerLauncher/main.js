const {
  app,
  BrowserWindow,
  dialog,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
  shell
} = require("electron");

const {
  spawn
} = require("child_process");

const path = require("path");
const fs = require("fs");


// ========================================
// VARIABLES
// ========================================

let servidor = null;
let ventana = null;
let tray = null;

let servidorActivo = false;

let estadoServidor =
  "iniciando";

let cerrando = false;
let cerrandoAplicacion = false;


// ========================================
// RUTA DEL SERVIDOR
// ========================================

function obtenerBaseServidor() {

  if (!app.isPackaged) {

    return path.join(
      __dirname,
      ".."
    );

  }

  return process.resourcesPath;

}


// ========================================
// ICONO DE LA BANDEJA
// ========================================

function obtenerIconoTray() {

  const nombre =
    servidorActivo
      ? "icon.ico"
      : "icoff.ico";


  const baseIconos =
    app.isPackaged
      ? process.resourcesPath
      : __dirname;


  const ruta =
    path.join(
      baseIconos,
      nombre
    );


  return nativeImage.createFromPath(
    ruta
  );

}


// ========================================
// ACTUALIZAR ESTADO
// ========================================

function actualizarEstado(
  estado
) {

  estadoServidor =
    estado;


  // --------------------------------------
  // ESTADO ACTIVO
  // --------------------------------------

  if (
    estado === "activo"
  ) {

    servidorActivo =
      true;

  }


  // --------------------------------------
  // ESTADO DETENIDO
  // --------------------------------------

  if (
    estado === "detenido"
  ) {

    servidorActivo =
      false;

  }


  // --------------------------------------
  // ERROR
  // --------------------------------------

  if (
    estado === "error"
  ) {

    servidorActivo =
      false;

  }


  // --------------------------------------
  // ACTUALIZAR RENDERER
  // --------------------------------------

  if (ventana) {

    ventana.webContents.send(
      "estado-servidor",
      estado
    );

  }


  // --------------------------------------
  // ACTUALIZAR TRAY
  // --------------------------------------

  actualizarMenuTray();

}


// ========================================
// ENVIAR LOG
// ========================================

function escribirLog(
  texto
) {

  console.log(
    texto
  );


  if (!ventana) {
    return;
  }


  ventana.webContents.send(
    "log-servidor",
    texto
  );

}


// ========================================
// CREAR VENTANA
// ========================================

function crearVentana() {

  ventana =
    new BrowserWindow({

      width: 600,

      height: 600,

      minWidth: 600,

      minHeight: 600,

      maxWidth: 600,

      maxHeight: 600,

      resizable: false,

      show: true,

      title:
        "Stock Papel Server",

      autoHideMenuBar: true,

      icon:
      path.join(
        app.isPackaged
          ? process.resourcesPath
          : __dirname,
        "icon.ico"
      ),


      webPreferences: {

        preload:
          path.join(
            __dirname,
            "preload.js"
          ),

        contextIsolation:
          true,

        nodeIntegration:
          false

      }

    });


  ventana.loadFile(
    path.join(
      __dirname,
      "renderer",
      "index.html"
    )
  );


  // ======================================
  // MINIMIZAR → TRAY
  // ======================================

  ventana.on(
    "minimize",
    (event) => {

      event.preventDefault();

      ventana.hide();

    }
  );


  // ======================================
  // CERRAR VENTANA
  // ======================================

  ventana.on(
    "close",
    (event) => {

      if (
        !cerrandoAplicacion
      ) {

        event.preventDefault();

        ventana.hide();

      }

    }
  );


  ventana.on(
    "closed",
    () => {

      ventana = null;

    }
  );

}


// ========================================
// INICIAR SERVIDOR
// ========================================

function iniciarServidor() {

  if (servidor) {

    escribirLog(
      "El servidor ya está iniciado."
    );

    return;

  }


  cerrando =
    false;


  actualizarEstado(
    "iniciando"
  );


  const BASE =
    obtenerBaseServidor();


  const NODE =
    path.join(
      BASE,
      "Node",
      "node.exe"
    );


  const START_SERVER =
    path.join(
      BASE,
      "Tools",
      "start-server.js"
    );


  escribirLog(
    "========================================"
  );

  escribirLog(
    "   STOCK PAPEL SERVER"
  );

  escribirLog(
    "========================================"
  );

  escribirLog(
    "Base: " + BASE
  );

  escribirLog(
    "Node: " + NODE
  );

  escribirLog(
    "Start Server: " +
    START_SERVER
  );


  // ======================================
  // COMPROBAR NODE
  // ======================================

  if (
    !fs.existsSync(
      NODE
    )
  ) {

    const mensaje =
      "ERROR: No se encontró Node:\n" +
      NODE;


    escribirLog(
      mensaje
    );


    actualizarEstado(
      "error"
    );


    dialog.showErrorBox(
      "Stock Papel Server",
      mensaje
    );


    return;

  }


  // ======================================
  // COMPROBAR START SERVER
  // ======================================

  if (
    !fs.existsSync(
      START_SERVER
    )
  ) {

    const mensaje =
      "ERROR: No se encontró start-server.js:\n" +
      START_SERVER;


    escribirLog(
      mensaje
    );


    actualizarEstado(
      "error"
    );


    dialog.showErrorBox(
      "Stock Papel Server",
      mensaje
    );


    return;

  }


  // ======================================
  // SPAWN
  // ======================================

  escribirLog(
    "Iniciando Node..."
  );


  servidor =
    spawn(

      NODE,

      [
        START_SERVER
      ],

      {

        cwd:
          BASE,

        windowsHide:
          true,

        stdio: [
          "ignore",
          "pipe",
          "pipe"
        ]

      }

    );


  // ======================================
  // STDOUT
  // ======================================

  servidor.stdout.on(
    "data",
    (data) => {

      const texto =
        data.toString();


      escribirLog(
        texto.trimEnd()
      );


      if (
        texto.includes(
          "MongoDB disponible"
        )
      ) {

        escribirLog(
          "MongoDB disponible."
        );

      }


      if (
        texto.includes(
          "Servidor ejecutándose"
        )
      ) {

        actualizarEstado(
          "activo"
        );

      }

    }
  );


  // ======================================
  // STDERR
  // ======================================

  servidor.stderr.on(
    "data",
    (data) => {

      const texto =
        data.toString();


      escribirLog(
        "[ERROR] " +
        texto.trimEnd()
      );

    }
  );


  // ======================================
  // ERROR
  // ======================================

  servidor.on(
    "error",
    (error) => {

      escribirLog(
        "ERROR AL INICIAR SERVIDOR:"
      );


      escribirLog(
        error.message
      );


      servidor =
        null;


      actualizarEstado(
        "error"
      );

    }
  );


  // ======================================
  // EXIT
  // ======================================

  servidor.on(
    "exit",
    (code, signal) => {

      escribirLog(
        `Servidor finalizado. Código: ${code}, señal: ${signal}`
      );


      servidor =
        null;


      if (
        !cerrando &&
        code !== 0
      ) {

        actualizarEstado(
          "error"
        );

      } else {

        actualizarEstado(
          "detenido"
        );

      }

    }
  );

}


// ========================================
// DETENER SERVIDOR
// ========================================

function detenerServidor() {

  if (!servidor) {

    actualizarEstado(
      "detenido"
    );

    return;

  }


  escribirLog(
    "Deteniendo Stock Papel Server..."
  );


  cerrando =
    true;


  servidor.kill(
    "SIGTERM"
  );

}


// ========================================
// RUTAS DEL SISTEMA
// ========================================

function obtenerRutaVCredist() {

  const BASE =
    obtenerBaseServidor();

  return path.join(
    BASE,
    "Tools",
    "vc_redist.x64.exe"
  );

}


// ========================================
// INICIO CON WINDOWS
// ========================================

function obtenerInicioWindows() {

  return app.getLoginItemSettings().openAtLogin;

}


function cambiarInicioWindows(
  habilitado
) {

  app.setLoginItemSettings({

    openAtLogin:
      habilitado,

    path:
      process.execPath

  });

  return obtenerInicioWindows();

}


// ========================================
// INSTALAR VISUAL C++
// ========================================

async function instalarVisualC() {

  const instalador =
    obtenerRutaVCredist();


  if (!fs.existsSync(instalador)) {

    dialog.showErrorBox(
      "Stock Papel Server",
      "No se encontró el instalador de Microsoft Visual C++:\n\n" +
      instalador
    );

    return false;

  }


  try {

    await shell.openPath(
      instalador
    );

    return true;

  } catch (error) {

    dialog.showErrorBox(
      "Stock Papel Server",
      "No se pudo ejecutar el instalador.\n\n" +
      error.message
    );

    return false;

  }

}


// ========================================
// DESINSTALAR
// ========================================

async function desinstalarServidor() {

  const resultado =
    await dialog.showMessageBox({

      type: "warning",

      title:
        "Desinstalar Stock Papel Server",

      message:
        "¿Querés desinstalar Stock Papel Server?",

      detail:
        "El programa será eliminado de Windows.\n\n" +
        "La base de datos ubicada en C:\\ProgramData\\Stock Papel Server\\data " +
        "no debería eliminarse automáticamente.",

      buttons: [
        "Cancelar",
        "Desinstalar"
      ],

      defaultId: 0,

      cancelId: 0

    });


  if (
    resultado.response !== 1
  ) {

    return false;

  }


  // --------------------------------------
  // DETENER SERVIDOR
  // --------------------------------------

  if (servidor) {

    cerrando =
      true;

    servidor.kill(
      "SIGTERM"
    );

    servidor =
      null;

  }


  // --------------------------------------
  // BUSCAR UNINSTALLER
  // --------------------------------------

  const posiblesRutas = [

    path.join(
      path.dirname(
        process.execPath
      ),
      "Uninstall Stock Papel Server.exe"
    ),

    path.join(
      obtenerBaseServidor(),
      "..",
      "Uninstall Stock Papel Server.exe"
    ),

    path.join(
      process.resourcesPath,
      "..",
      "Uninstall Stock Papel Server.exe"
    )

  ];


  const instalador =
    posiblesRutas.find(
      (ruta) =>
        fs.existsSync(ruta)
    );


  if (!instalador) {

    dialog.showErrorBox(
      "Stock Papel Server",
      "No se encontró el desinstalador de Stock Papel Server."
    );

    return false;

  }


  try {

    await shell.openPath(
      instalador
    );

    return true;

  } catch (error) {

    dialog.showErrorBox(
      "Stock Papel Server",
      "No se pudo iniciar la desinstalación.\n\n" +
      error.message
    );

    return false;

  }

}


// ========================================
// ALTERNAR SERVIDOR
// ========================================

function alternarServidor() {

  if (
    servidorActivo
  ) {

    detenerServidor();

  } else {

    iniciarServidor();

  }

}


// ========================================
// MOSTRAR VENTANA
// ========================================

function mostrarVentana() {

  if (!ventana) {

    crearVentana();

    return;

  }


  if (
    ventana.isMinimized()
  ) {

    ventana.restore();

  }


  ventana.show();

  ventana.focus();

}


// ========================================
// CERRAR APLICACIÓN
// ========================================

function cerrarAplicacion() {

  cerrandoAplicacion =
    true;


  app.quit();

}


// ========================================
// CREAR TRAY
// ========================================

function crearTray() {

  if (tray) {
    return;
  }


  tray =
    new Tray(
      obtenerIconoTray()
    );


  tray.setToolTip(
    servidorActivo
      ? "Stock Papel Server - Activo"
      : "Stock Papel Server - Detenido"
  );


  actualizarMenuTray();


  // --------------------------------------
  // DOBLE CLICK
  // --------------------------------------

  tray.on(
    "double-click",
    () => {

      mostrarVentana();

    }
  );

}


// ========================================
// ACTUALIZAR MENU TRAY
// ========================================

function actualizarMenuTray() {

  if (!tray) {
    return;
  }


  const menu =
    Menu.buildFromTemplate([

      // ----------------------------------
      // ESTADO
      // ----------------------------------

      {
        label:
          servidorActivo
            ? "● Servidor activo"
            : "● Servidor detenido",

        enabled:
          false

      },


      {
        type:
          "separator"
      },


      // ----------------------------------
      // ABRIR
      // ----------------------------------

      {
        label:
          "Abrir Stock Papel Server",

        click: () => {

          mostrarVentana();

        }

      },


      // ----------------------------------
      // DETENER / REACTIVAR
      // ----------------------------------

      {
        label:
          servidorActivo
            ? "Detener servidor"
            : "Reactivar servidor",

        click: () => {

          alternarServidor();

        }

      },


      {
        type:
          "separator"
      },


      // ----------------------------------
      // SALIR
      // ----------------------------------

      {
        label:
          "Salir",

        click: () => {

          cerrarAplicacion();

        }

      }

    ]);


  tray.setContextMenu(
    menu
  );


  // ======================================
  // ACTUALIZAR ICONO
  // ======================================

  tray.setImage(
    obtenerIconoTray()
  );


  tray.setToolTip(
    servidorActivo
      ? "Stock Papel Server - Activo"
      : "Stock Papel Server - Detenido"
  );

}

// ========================================
// IMPORTAR BASE DE DATOS
// ========================================

async function importarBaseDatos() {

  const BASE =
    obtenerBaseServidor();


  const MONGOD =
    path.join(
      BASE,
      "Mongodb",
      "bin",
      "mongod.exe"
    );


  const MONGORESTORE =
    path.join(
      BASE,
      "Mongodb",
      "bin",
      "mongorestore.exe"
    );


  const MONGO_DATA =
    path.join(
      process.env.ProgramData ||
        "C:\\ProgramData",
      "Stock Papel Server",
      "data"
    );


  // ======================================
  // COMPROBAR ARCHIVOS
  // ======================================

  if (
    !fs.existsSync(
      MONGOD
    )
  ) {

    dialog.showErrorBox(
      "Stock Papel Server",
      "No se encontró mongod.exe."
    );

    return false;

  }


  if (
    !fs.existsSync(
      MONGORESTORE
    )
  ) {

    dialog.showErrorBox(
      "Stock Papel Server",
      "No se encontró mongorestore.exe."
    );

    return false;

  }


  // ======================================
  // SELECCIONAR BACKUP
  // ======================================

  const resultado =
    await dialog.showOpenDialog(
      ventana,
      {

        title:
          "Seleccionar backup de Stock Papel",

        properties: [
          "openDirectory"
        ]

      }
    );


  if (
    resultado.canceled ||
    !resultado.filePaths.length
  ) {

    return false;

  }


  let carpetaSeleccionada =
    resultado.filePaths[0];


  // ======================================
  // DETECTAR ESTRUCTURA DEL BACKUP
  // ======================================

  /*
    Backup generado por Stock Papel:

    Stock-Papel-Backup-2026-09-21_10-00-00
    └── stock-papel
        ├── productos.bson
        ├── movimientos.bson
        ├── usuarios.bson
        └── ...

    mongorestore debe recibir la carpeta PADRE,
    no directamente "stock-papel".
  */

  let carpetaRestore =
    carpetaSeleccionada;


  const posibleBase =
    path.join(
      carpetaSeleccionada,
      "stock-papel"
    );


  if (
    fs.existsSync(
      posibleBase
    ) &&
    fs.statSync(
      posibleBase
    ).isDirectory()
  ) {

    carpetaRestore =
      carpetaSeleccionada;

  }


  // ======================================
  // COMPROBAR BACKUP
  // ======================================

  const carpetaDB =
    path.join(
      carpetaRestore,
      "stock-papel"
    );


  if (
    !fs.existsSync(
      carpetaDB
    )
  ) {

    dialog.showErrorBox(
      "Stock Papel Server",
      "La carpeta seleccionada no contiene una carpeta 'stock-papel'.\n\n" +
      "Seleccioná la carpeta principal del backup."
    );

    return false;

  }


  const archivos =
    fs.readdirSync(
      carpetaDB
    );


  const tieneBson =
    archivos.some(
      (archivo) =>
        archivo
          .toLowerCase()
          .endsWith(".bson")
    );


  if (!tieneBson) {

    dialog.showErrorBox(
      "Stock Papel Server",
      "La carpeta seleccionada no contiene archivos BSON válidos."
    );

    return false;

  }


  // ======================================
  // CONFIRMACIÓN
  // ======================================

  const confirmacion =
    await dialog.showMessageBox(
      ventana,
      {

        type:
          "warning",

        title:
          "Importar base de datos",

        message:
          "¿Querés reemplazar la base de datos actual?",

        detail:
          "La base de datos actual de Stock Papel será reemplazada por el backup seleccionado.\n\n" +
          "Esta operación no se puede deshacer.",

        buttons: [
          "Cancelar",
          "Importar base de datos"
        ],

        defaultId:
          0,

        cancelId:
          0

      }
    );


  if (
    confirmacion.response !== 1
  ) {

    return false;

  }


  // ======================================
  // LOG
  // ======================================

  escribirLog(
    "========================================"
  );

  escribirLog(
    "IMPORTACIÓN DE BASE DE DATOS"
  );

  escribirLog(
    "========================================"
  );

  escribirLog(
    "Backup seleccionado:"
  );

  escribirLog(
    carpetaRestore
  );

  escribirLog(
    "Base de datos detectada:"
  );

  escribirLog(
    carpetaDB
  );


  // ======================================
  // DETENER SERVIDOR PRINCIPAL
  // ======================================

  escribirLog(
    "Deteniendo Stock Papel Server..."
  );


  if (servidor) {

    cerrando =
      true;


    try {

      servidor.kill(
        "SIGTERM"
      );

    } catch {}


    await esperarSalidaServidor();


    servidor =
      null;

  }


  // ======================================
  // MONGODB TEMPORAL
  // ======================================

  escribirLog(
    "Iniciando MongoDB temporalmente..."
  );


  let mongoTemporal =
    null;


  try {

    mongoTemporal =
      spawn(

        MONGOD,

        [
          "--dbpath",
          MONGO_DATA,

          "--bind_ip",
          "127.0.0.1",

          "--port",
          "27017"
        ],

        {

          cwd:
            BASE,

          windowsHide:
            true,

          stdio: [
            "ignore",
            "pipe",
            "pipe"
          ]

        }

      );


    mongoTemporal.stdout.on(
      "data",
      (data) => {

        escribirLog(
          "[MongoDB] " +
          data
            .toString()
            .trimEnd()
        );

      }
    );


    mongoTemporal.stderr.on(
      "data",
      (data) => {

        escribirLog(
          "[MongoDB] " +
          data
            .toString()
            .trimEnd()
        );

      }
    );


    // ====================================
    // ESPERAR MONGODB
    // ====================================

    await esperarMongoDBTemporal();


    escribirLog(
      "MongoDB temporal disponible."
    );


    // ====================================
    // RESTAURAR
    // ====================================

    escribirLog(
      "Iniciando mongorestore..."
    );

    escribirLog(
      "Origen: " +
      carpetaRestore
    );


    const restauracion =
      await ejecutarMongoRestore(
        MONGORESTORE,
        carpetaRestore
      );


    // ====================================
    // CERRAR MONGODB TEMPORAL
    // ====================================

    if (mongoTemporal) {
        
      try {
      
        if (
          mongoTemporal.exitCode === null
        ) {
        
          const {
            spawnSync
          } = require("child_process");
        
        
          if (
            mongoTemporal.pid
          ) {
          
            spawnSync(
              "taskkill",
              [
                "/PID",
                String(
                  mongoTemporal.pid
                ),
                "/T",
                "/F"
              ],
              {
                windowsHide:
                  true
              }
            );
          
          }
        
        }
      
      } catch {}
    
      mongoTemporal =
        null;
    
    }


    // ====================================
    // RESULTADO
    // ====================================

    if (!restauracion) {

      escribirLog(
        "La importación finalizó con errores."
      );


      actualizarEstado(
        "error"
      );


      dialog.showErrorBox(
        "Stock Papel Server",
        "No se pudo importar la base de datos.\n\n" +
        "Revisá el Log para ver el motivo."
      );


      return false;

    }


    escribirLog(
      "========================================"
    );

    escribirLog(
      "BASE DE DATOS IMPORTADA CORRECTAMENTE"
    );

    escribirLog(
      "========================================"
    );


    await dialog.showMessageBox(
      ventana,
      {

        type:
          "info",

        title:
          "Importación completada",

        message:
          "La base de datos se importó correctamente.",

        detail:
          "Stock Papel Server se reiniciará para aplicar los cambios."

      }
    );


    // ====================================
    // REINICIAR SERVIDOR
    // ====================================

    cerrando =
      false;


    iniciarServidor();


    return true;

  } catch (error) {

    escribirLog(
      "ERROR durante la importación:"
    );

    escribirLog(
      error.message
    );


    // ====================================
    // ASEGURAR CIERRE DE MONGO TEMPORAL
    // ====================================

    if (mongoTemporal) {

      try {

        await detenerMongoTemporal(
          mongoTemporal
        );

      } catch {}

      mongoTemporal =
        null;

    }


    actualizarEstado(
      "error"
    );


    dialog.showErrorBox(
      "Stock Papel Server",
      "Ocurrió un error durante la importación.\n\n" +
      error.message
    );


    return false;

  }

}


// ========================================
// ESPERAR SALIDA SERVIDOR
// ========================================

function esperarSalidaServidor() {

  return new Promise(
    (resolve) => {

      if (!servidor) {

        resolve();

        return;

      }


      const proceso =
        servidor;


      const timeout =
        setTimeout(
          () => {

            try {

              proceso.kill(
                "SIGKILL"
              );

            } catch {}


            resolve();

          },
          10000
        );


      proceso.once(
        "exit",
        () => {

          clearTimeout(
            timeout
          );

          resolve();

        }
      );

    }
  );

}


// ========================================
// ESPERAR MONGODB
// ========================================

function esperarMongoDBTemporal() {

  return new Promise(
    async (resolve, reject) => {

      const limite =
        Date.now() + 15000;


      while (
        Date.now() < limite
      ) {

        const disponible =
          await comprobarPuertoMongo();


        if (disponible) {

          resolve();

          return;

        }


        await esperar(
          500
        );

      }


      reject(
        new Error(
          "MongoDB no estuvo disponible dentro del tiempo esperado."
        )
      );

    }
  );

}


// ========================================
// COMPROBAR PUERTO MONGO
// ========================================

function comprobarPuertoMongo() {

  return new Promise(
    (resolve) => {

      const net =
        require("net");


      const socket =
        new net.Socket();


      socket.setTimeout(
        500
      );


      socket.once(
        "connect",
        () => {

          socket.destroy();

          resolve(
            true
          );

        }
      );


      socket.once(
        "timeout",
        () => {

          socket.destroy();

          resolve(
            false
          );

        }
      );


      socket.once(
        "error",
        () => {

          socket.destroy();

          resolve(
            false
          );

        }
      );


      socket.connect(
        27017,
        "127.0.0.1"
      );

    }
  );

}

// ========================================
// DETENER MONGODB TEMPORAL
// ========================================

async function detenerMongoTemporal(
  proceso
) {

  if (!proceso) {
    return;
  }


  // ======================================
  // YA TERMINÓ
  // ======================================

  if (
    proceso.exitCode !== null
  ) {

    escribirLog(
      "MongoDB temporal ya estaba finalizado."
    );

    return;

  }


  const pid =
    proceso.pid;


  escribirLog(
    "Cerrando MongoDB temporal. PID: " +
    pid
  );


  // ======================================
  // WINDOWS → TASKKILL
  // ======================================

  if (
    process.platform === "win32" &&
    pid
  ) {

    const {
      spawnSync
    } = require("child_process");


    escribirLog(
      "Finalizando proceso mongod.exe..."
    );


    try {

      const resultado =
        spawnSync(

          "taskkill",

          [
            "/PID",
            String(pid),
            "/T",
            "/F"
          ],

          {
            windowsHide:
              true,

            encoding:
              "utf8"
          }

        );


      if (
        resultado.stdout
      ) {

        escribirLog(
          "[taskkill] " +
          resultado.stdout.trim()
        );

      }


      if (
        resultado.stderr
      ) {

        escribirLog(
          "[taskkill] " +
          resultado.stderr.trim()
        );

      }

    } catch (error) {

      escribirLog(
        "Error ejecutando taskkill:"
      );

      escribirLog(
        error.message
      );

    }

  } else {

    // ====================================
    // OTROS SISTEMAS
    // ====================================

    try {

      proceso.kill(
        "SIGTERM"
      );

    } catch {}

  }


  // ======================================
  // ESPERAR PROCESO
  // ======================================

  await esperar(
    1000
  );


  // ======================================
  // ESPERAR LIBERACIÓN DEL PUERTO
  // ======================================

  escribirLog(
    "Esperando que MongoDB libere el puerto 27017..."
  );


  const limite =
    Date.now() + 10000;


  while (
    Date.now() < limite
  ) {

    const disponible =
      await comprobarPuertoMongo();


    if (
      !disponible
    ) {

      escribirLog(
        "Puerto 27017 liberado correctamente."
      );


      return;

    }


    await esperar(
      300
    );

  }


  throw new Error(
    "No se pudo liberar el puerto 27017 después de cerrar MongoDB."
  );

}


// ========================================
// EJECUTAR MONGORESTORE
// ========================================

function ejecutarMongoRestore(
  mongorestore,
  carpetaBackup
) {

  return new Promise(
    (resolve) => {

      escribirLog(
        "Ejecutando mongorestore..."
      );


      escribirLog(
        "Base origen: " +
        path.join(
          carpetaBackup,
          "stock-papel"
        )
      );


      const restore =
        spawn(

          mongorestore,

          [
            "--host",
            "127.0.0.1",

            "--port",
            "27017",

            "--drop",

            "--nsInclude",
            "stock-papel.*",

            carpetaBackup

          ],

          {
            windowsHide:
              true,

            cwd:
              carpetaBackup

          }

        );


      let huboError =
        false;


      // ====================================
      // STDOUT
      // ====================================

      restore.stdout.on(
        "data",
        (data) => {

          const texto =
            data
              .toString()
              .trimEnd();


          if (texto) {

            escribirLog(
              "[Restore] " +
              texto
            );

          }

        }
      );


      // ====================================
      // STDERR
      // ====================================

      restore.stderr.on(
        "data",
        (data) => {

          const texto =
            data
              .toString()
              .trimEnd();


          if (texto) {

            escribirLog(
              "[Restore] " +
              texto
            );

          }

        }
      );


      // ====================================
      // ERROR
      // ====================================

      restore.on(
        "error",
        (error) => {

          huboError =
            true;


          escribirLog(
            "ERROR ejecutando mongorestore:"
          );

          escribirLog(
            error.message
          );


          resolve(
            false
          );

        }
      );


      // ====================================
      // EXIT
      // ====================================

      restore.on(
        "exit",
        (code, signal) => {

          if (huboError) {
            return;
          }


          escribirLog(
            "mongorestore finalizó."
          );


          escribirLog(
            "Código: " +
            code
          );


          if (signal) {

            escribirLog(
              "Señal: " +
              signal
            );

          }


          if (
            code === 0
          ) {

            escribirLog(
              "Todos los datos fueron restaurados correctamente."
            );


            resolve(
              true
            );

            return;

          }


          escribirLog(
            "mongorestore terminó con errores."
          );


          resolve(
            false
          );

        }

      );

    }
  );

}

// ========================================
// ESPERAR
// ========================================

function esperar(
  milisegundos
) {

  return new Promise(
    (resolve) => {

      setTimeout(
        resolve,
        milisegundos
      );

    }
  );

}


// ========================================
// ESPERAR PROCESO
// ========================================

function esperarProceso(
  proceso
) {

  return new Promise(
    (resolve) => {

      if (!proceso) {

        resolve();

        return;

      }


      // Ya terminó
      if (
        proceso.exitCode !== null
      ) {

        resolve();

        return;

      }


      const timeout =
        setTimeout(
          () => {

            resolve();

          },
          10000
        );


      proceso.once(
        "exit",
        () => {

          clearTimeout(
            timeout
          );


          resolve();

        }
      );

    }
  );

}


// ========================================
// IPC
// ========================================

ipcMain.handle(
  "obtener-estado",
  () => {

    return estadoServidor;

  }
);


ipcMain.handle(
  "iniciar-servidor",
  () => {

    iniciarServidor();

    return true;

  }
);


ipcMain.handle(
  "detener-servidor",
  () => {

    detenerServidor();

    return true;

  }
);

ipcMain.handle(
  "abrir-carpeta-datos",
  async () => {

    const carpetaDatos =
      path.join(
        process.env.ProgramData ||
          "C:\\ProgramData",
        "Stock Papel Server",
        "data"
      );


    try {

      fs.mkdirSync(
        carpetaDatos,
        {
          recursive: true
        }
      );


      const { shell } =
        require("electron");


      await shell.openPath(
        carpetaDatos
      );


      return true;

    } catch (error) {

      escribirLog(
        "ERROR abriendo carpeta de datos:"
      );

      escribirLog(
        error.message
      );


      return false;

    }

  }
);

ipcMain.handle(
  "crear-backup",
  async () => {

    const {
      dialog
    } = require("electron");

    const {
      spawn
    } = require("child_process");


    // ======================================
    // RUTAS
    // ======================================

    const BASE =
      obtenerBaseServidor();


    const MONGODUMP =
      path.join(
        BASE,
        "Mongodb",
        "bin",
        "mongodump.exe"
      );


    // ======================================
    // COMPROBAR MONGODUMP
    // ======================================

    if (
      !fs.existsSync(
        MONGODUMP
      )
    ) {

      escribirLog(
        "ERROR: No se encontró mongodump.exe"
      );

      dialog.showErrorBox(
        "Stock Papel Server",
        "No se encontró mongodump.exe."
      );

      return false;

    }


    // ======================================
    // ELEGIR CARPETA
    // ======================================

    const resultado =
      await dialog.showOpenDialog(
        ventana,
        {
          title:
            "Seleccionar ubicación para el backup",

          properties: [
            "openDirectory",
            "createDirectory"
          ]

        }
      );


    if (
      resultado.canceled ||
      !resultado.filePaths.length
    ) {

      return false;

    }


    const destino =
      resultado.filePaths[0];


    // ======================================
    // NOMBRE BACKUP
    // ======================================

    const ahora =
      new Date();


    const dosDigitos =
      (numero) =>
        String(numero)
          .padStart(2, "0");


    const nombreBackup =
      "Stock-Papel-Backup-" +

      ahora.getFullYear() +

      "-" +

      dosDigitos(
        ahora.getMonth() + 1
      ) +

      "-" +

      dosDigitos(
        ahora.getDate()
      ) +

      "_" +

      dosDigitos(
        ahora.getHours()
      ) +

      "-" +

      dosDigitos(
        ahora.getMinutes()
      ) +

      "-" +

      dosDigitos(
        ahora.getSeconds()
      );


    const carpetaBackup =
      path.join(
        destino,
        nombreBackup
      );


    fs.mkdirSync(
      carpetaBackup,
      {
        recursive: true
      }
    );


    // ======================================
    // LOG
    // ======================================

    escribirLog(
      "========================================"
    );

    escribirLog(
      "INICIANDO BACKUP"
    );

    escribirLog(
      "========================================"
    );

    escribirLog(
      "Destino: " +
      carpetaBackup
    );


    // ======================================
    // EJECUTAR MONGODUMP
    // ======================================

    return new Promise(
      (resolve) => {

        const backup =
          spawn(

            MONGODUMP,

            [
              "--host",
              "127.0.0.1",

              "--port",
              "27017",

              "--db",
              "stock-papel",

              "--out",
              carpetaBackup

            ],

            {
              windowsHide:
                true
            }

          );


        backup.stdout.on(
          "data",
          (data) => {

            escribirLog(
              "[Backup] " +
              data
                .toString()
                .trimEnd()
            );

          }
        );


        backup.stderr.on(
          "data",
          (data) => {

            escribirLog(
              "[Backup] " +
              data
                .toString()
                .trimEnd()
            );

          }
        );


        backup.on(
          "error",
          (error) => {

            escribirLog(
              "ERROR creando backup:"
            );

            escribirLog(
              error.message
            );


            dialog.showErrorBox(
              "Stock Papel Server",
              "No se pudo crear el backup.\n\n" +
              error.message
            );


            resolve(false);

          }
        );


        backup.on(
          "exit",
          (code) => {

            if (
              code === 0
            ) {

              escribirLog(
                "Backup creado correctamente."
              );

              escribirLog(
                "Ubicación: " +
                carpetaBackup
              );


              dialog.showMessageBox(
                ventana,
                {
                  type:
                    "info",

                  title:
                    "Backup creado",

                  message:
                    "El backup se creó correctamente.",

                  detail:
                    carpetaBackup
                }
              );


              resolve(true);

              return;

            }


            escribirLog(
              "ERROR: mongodump finalizó con código " +
              code
            );


            dialog.showErrorBox(
              "Stock Papel Server",
              "No se pudo completar el backup.\n\n" +
              "Código: " +
              code
            );


            resolve(false);

          }

        );

      }
    );

  }
);

ipcMain.handle(
  "importar-base-datos",
  async () => {

    return await importarBaseDatos();

  }
);

ipcMain.handle(
  "obtener-inicio-windows",
  () => {

    return obtenerInicioWindows();

  }
);


ipcMain.handle(
  "cambiar-inicio-windows",
  (_, habilitado) => {

    return cambiarInicioWindows(
      habilitado
    );

  }
);


ipcMain.handle(
  "instalar-vcredist",
  () => {

    return instalarVisualC();

  }
);


ipcMain.handle(
  "desinstalar-servidor",
  () => {

    return desinstalarServidor();

  }
);


// ========================================
// ELECTRON
// ========================================

app.whenReady().then(
  () => {

    // Primero creamos el Tray
    crearTray();

    // Después la ventana
    crearVentana();

    // Finalmente iniciamos el servidor
    iniciarServidor();

  }
);


// ========================================
// CIERRE
// ========================================

app.on(
  "before-quit",
  () => {

    cerrandoAplicacion =
      true;

    cerrando =
      true;


    if (servidor) {

      servidor.kill(
        "SIGTERM"
      );

      servidor =
        null;

    }

  }
);


// ========================================
// WINDOWS
// ========================================

app.on(
  "window-all-closed",
  () => {

    if (
      process.platform !==
      "darwin"
    ) {

      // No hacemos app.quit()
      // porque queremos mantener
      // el servidor en el Tray.

    }

  }
);