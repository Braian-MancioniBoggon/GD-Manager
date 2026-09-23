const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
} = require("electron");

const path = require("path");
const fs = require("fs");
const http = require("http");

const {
  buscarServidor,
} = require("./discovery");

let mainWindow = null;

const CONFIG_FILE = () =>
  path.join(
    app.getPath("userData"),
    "servidor.json"
  );


// =====================================================
// CREAR VENTANA
// =====================================================

function createWindow() {

  mainWindow = new BrowserWindow({

    width: 1400,
    height: 900,

    minWidth: 1000,
    minHeight: 700,

    autoHideMenuBar: true,

    icon: path.join(
      __dirname,
      "../assets/icon.ico"
    ),

    webPreferences: {

      preload: path.join(
        __dirname,
        "preload.js"
      ),

      contextIsolation: true,

      nodeIntegration: false,

    },

  });


  mainWindow.on(
    "closed",
    () => {

      mainWindow = null;

    }
  );

}


// =====================================================
// LEER CONFIGURACIÓN
// =====================================================

function obtenerConfiguracion() {

  try {

    if (
      !fs.existsSync(
        CONFIG_FILE()
      )
    ) {

      return null;

    }


    const contenido =
      fs.readFileSync(
        CONFIG_FILE(),
        "utf8"
      );


    return JSON.parse(
      contenido
    );

  } catch (error) {

    console.log(
      "No se pudo leer configuración:",
      error.message
    );

    return null;

  }

}


// =====================================================
// GUARDAR CONFIGURACIÓN
// =====================================================

function guardarConfiguracion(
  servidor
) {

  try {

    fs.writeFileSync(

      CONFIG_FILE(),

      JSON.stringify(
        servidor,
        null,
        2
      ),

      "utf8"

    );


    console.log(
      "Servidor guardado:",
      servidor.url
    );

  } catch (error) {

    console.log(
      "No se pudo guardar servidor:",
      error.message
    );

  }

}


// =====================================================
// COMPROBAR SERVIDOR
// =====================================================

function comprobarServidor(
  url
) {

  return new Promise(
    (resolve) => {

      const request =
        http.get(
          url,
          {
            timeout: 3000,
          },
          (response) => {

            response.resume();

            resolve(
              response.statusCode >= 200 &&
              response.statusCode < 500
            );

          }
        );


      request.on(
        "timeout",
        () => {

          request.destroy();

          resolve(false);

        }
      );


      request.on(
        "error",
        () => {

          resolve(false);

        }
      );

    }
  );

}


// =====================================================
// BUSCAR SERVIDOR
// =====================================================

async function obtenerServidor() {

  // ---------------------------------------------------
  // 1. INTENTAR ÚLTIMO SERVIDOR
  // ---------------------------------------------------

  const configuracion =
    obtenerConfiguracion();


  if (
    configuracion?.url
  ) {

    console.log(
      "Último servidor:",
      configuracion.url
    );


    const responde =
      await comprobarServidor(
        configuracion.url
      );


    if (responde) {

      console.log(
        "Servidor disponible:",
        configuracion.url
      );


      return configuracion;

    }


    console.log(
      "El último servidor no responde."
    );

  }


  // ---------------------------------------------------
  // 2. BUSCAR POR UDP
  // ---------------------------------------------------

  console.log(
    "Buscando servidor por UDP..."
  );


  const servidor =
    await buscarServidor(
      8000
    );


  if (servidor) {

    console.log(
      "Servidor encontrado:",
      servidor.url
    );


    guardarConfiguracion(
      servidor
    );


    return servidor;

  }


  // ---------------------------------------------------
  // 3. NO ENCONTRADO
  // ---------------------------------------------------

  console.log(
    "No se encontró ningún servidor."
  );


  return null;

}


// =====================================================
// CONECTAR AL SERVIDOR
// =====================================================

async function conectarServidor() {

  console.log(
    "Buscando Stock Papel Server..."
  );


  const servidor =
    await obtenerServidor();


  if (!servidor) {

    console.error(
      "No fue posible encontrar Stock Papel Server."
    );


    await dialog.showMessageBox({

      type: "error",

      title: "Stock Papel",

      message:
        "No se encontró el servidor Stock Papel.",

      detail:
        "Verificá que Stock Papel Server esté iniciado y que ambas computadoras estén conectadas a la misma red.",

      buttons: [
        "Reintentar",
        "Cerrar"
      ],

      defaultId: 0,

      cancelId: 1,

    }).then(
      async (resultado) => {

        if (
          resultado.response === 0
        ) {

          await conectarServidor();

        } else {

          app.quit();

        }

      }
    );


    return;

  }


  console.log(
    "Cargando frontend:",
    servidor.url
  );


  try {

    await mainWindow.loadURL(
      servidor.url
    );


    console.log(
      "✓ Frontend cargado correctamente."
    );

  } catch (error) {

    console.error(
      "Error cargando frontend:",
      error.message
    );


    await dialog.showMessageBox({

      type: "error",

      title: "Stock Papel",

      message:
        "No se pudo cargar el sistema.",

      detail:
        `Servidor encontrado en ${servidor.url}, pero no fue posible cargar el frontend.`,

      buttons: [
        "Cerrar"
      ],

    });


    app.quit();

  }

}


// =====================================================
// IPC
// =====================================================

ipcMain.handle(
  "buscar-servidor",
  async () => {

    return await obtenerServidor();

  }
);


// =====================================================
// ELECTRON
// =====================================================

app.whenReady().then(
  async () => {

    createWindow();

    await conectarServidor();


    app.on(
      "activate",
      () => {

        if (
          BrowserWindow
            .getAllWindows()
            .length === 0
        ) {

          createWindow();

        }

      }
    );

  }
);


// =====================================================
// CIERRE
// =====================================================

app.on(
  "window-all-closed",
  () => {

    if (
      process.platform !== "darwin"
    ) {

      app.quit();

    }

  }
);