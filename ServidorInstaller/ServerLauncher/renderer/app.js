// ========================================
// ELEMENTOS
// ========================================

const tabs =
  document.querySelectorAll(".tab");

const contenidos =
  document.querySelectorAll(".tab-content");

const btnServidor =
  document.getElementById("btn-servidor");

const estadoTitulo =
  document.getElementById("estado-titulo");

const estadoMensaje =
  document.getElementById("estado-mensaje");

const estadoIcono =
  document.getElementById("estado-icono");

const indicadorHeader =
  document.getElementById("indicador-header");

const log =
  document.getElementById("log");

const btnLimpiarLog =
  document.getElementById("btn-limpiar-log");


// ========================================
// CAMBIO DE PESTAÑAS
// ========================================

tabs.forEach((tab) => {

  tab.addEventListener(
    "click",
    () => {

      const destino =
        tab.dataset.tab;


      // -------------------------------
      // BOTONES
      // -------------------------------

      tabs.forEach((item) => {

        item.classList.remove(
          "active"
        );

      });


      tab.classList.add(
        "active"
      );


      // -------------------------------
      // CONTENIDO
      // -------------------------------

      contenidos.forEach((contenido) => {

        contenido.classList.remove(
          "active"
        );

      });


      const contenidoActivo =
        document.getElementById(
          `tab-${destino}`
        );


      if (contenidoActivo) {

        contenidoActivo.classList.add(
          "active"
        );

      }

    }
  );

});


// ========================================
// ACTUALIZAR ESTADO VISUAL
// ========================================

function actualizarEstado(
  estado
) {

  if (!estado) {
    return;
  }


  // ======================================
  // INICIANDO
  // ======================================

  if (estado === "iniciando") {

    estadoTitulo.textContent =
      "Iniciando servidor...";

    estadoMensaje.textContent =
      "Esperando a que Stock Papel Server esté disponible.";

    estadoIcono.textContent =
      "●";

    estadoIcono.className =
      "server-icon starting";

    indicadorHeader.className =
      "status-dot starting";

    btnServidor.disabled =
      true;

    btnServidor.textContent =
      "INICIANDO...";

    btnServidor.classList.remove(
      "danger"
    );

    return;

  }


  // ======================================
  // ACTIVO
  // ======================================

  if (estado === "activo") {

    estadoTitulo.textContent =
      "Servidor activo";

    estadoMensaje.textContent =
      "Stock Papel Server está funcionando correctamente.";

    estadoIcono.textContent =
      "●";

    estadoIcono.className =
      "server-icon active";

    indicadorHeader.className =
      "status-dot active";

    btnServidor.disabled =
      false;

    btnServidor.textContent =
      "DETENER SERVIDOR";

    btnServidor.classList.remove(
      "danger"
    );

    return;

  }


  // ======================================
  // DETENIDO
  // ======================================

  if (estado === "detenido") {

    estadoTitulo.textContent =
      "Servidor detenido";

    estadoMensaje.textContent =
      "Stock Papel Server está detenido.";

    estadoIcono.textContent =
      "●";

    estadoIcono.className =
      "server-icon stopped";

    indicadorHeader.className =
      "status-dot stopped";

    btnServidor.disabled =
      false;

    btnServidor.textContent =
      "REACTIVAR SERVIDOR";

    btnServidor.classList.add(
      "danger"
    );

    return;

  }


  // ======================================
  // ERROR
  // ======================================

  if (estado === "error") {

    estadoTitulo.textContent =
      "Error del servidor";

    estadoMensaje.textContent =
      "Ocurrió un problema al iniciar Stock Papel Server. Revisá el Log.";

    estadoIcono.textContent =
      "●";

    estadoIcono.className =
      "server-icon error";

    indicadorHeader.className =
      "status-dot error";

    btnServidor.disabled =
      false;

    btnServidor.textContent =
      "REACTIVAR SERVIDOR";

    btnServidor.classList.add(
      "danger"
    );

  }

}


// ========================================
// BOTÓN SERVIDOR
// ========================================

btnServidor.addEventListener(
  "click",
  async () => {

    const estado =
      await window.stockPapel.obtenerEstado();


    if (
      estado === "activo" ||
      estado === "iniciando"
    ) {

      if (estado === "activo") {

        btnServidor.disabled =
          true;

        btnServidor.textContent =
          "DETENIENDO...";

        await window.stockPapel.detenerServidor();

      }

      return;

    }


    if (
      estado === "detenido" ||
      estado === "error"
    ) {

      btnServidor.disabled =
        true;

      btnServidor.textContent =
        "INICIANDO...";

      await window.stockPapel.iniciarServidor();

    }

  }
);


// ========================================
// RECIBIR ESTADO DESDE ELECTRON
// ========================================

window.stockPapel.onEstado(
  (estado) => {

    actualizarEstado(
      estado
    );

  }
);


// ========================================
// RECIBIR LOG
// ========================================

window.stockPapel.onLog(
  (mensaje) => {

    if (!log) {
      return;
    }


    log.textContent +=
      mensaje + "\n";


    // Mantener siempre abajo
    log.scrollTop =
      log.scrollHeight;

  }
);


// ========================================
// LIMPIAR LOG
// ========================================

btnLimpiarLog.addEventListener(
  "click",
  () => {

    log.textContent =
      "";

  }
);

// ========================================
// SISTEMA
// ========================================

const btnInicioWindows =
  document.getElementById(
    "btn-inicio-windows"
  );

const indicadorInicioWindows =
  document.getElementById(
    "inicio-windows"
  );

const btnVcredist =
  document.getElementById(
    "btn-vcredist"
  );

const btnDesinstalar =
  document.getElementById(
    "btn-desinstalar"
  );


// ========================================
// ACTUALIZAR INICIO CON WINDOWS
// ========================================

function actualizarInicioWindows(
  habilitado
) {

  if (!indicadorInicioWindows) {
    return;
  }


  if (habilitado) {

    indicadorInicioWindows.textContent =
      "ON";

    indicadorInicioWindows.classList.add(
      "on"
    );

  } else {

    indicadorInicioWindows.textContent =
      "OFF";

    indicadorInicioWindows.classList.remove(
      "on"
    );

  }

}


// ========================================
// CARGAR CONFIGURACIÓN DE WINDOWS
// ========================================

async function cargarInicioWindows() {

  try {

    const habilitado =
      await window.stockPapel
        .obtenerInicioWindows();


    actualizarInicioWindows(
      habilitado
    );

  } catch (error) {

    console.error(
      "No se pudo obtener la configuración de inicio:",
      error
    );

  }

}


// ========================================
// TOGGLE INICIO CON WINDOWS
// ========================================

if (btnInicioWindows) {

  btnInicioWindows.addEventListener(
    "click",
    async () => {

      btnInicioWindows.disabled =
        true;


      try {

        const actualmenteHabilitado =
          await window.stockPapel
            .obtenerInicioWindows();


        const nuevoEstado =
          !actualmenteHabilitado;


        const resultado =
          await window.stockPapel
            .cambiarInicioWindows(
              nuevoEstado
            );


        actualizarInicioWindows(
          resultado
        );


      } catch (error) {

        console.error(
          "No se pudo cambiar el inicio con Windows:",
          error
        );

      } finally {

        btnInicioWindows.disabled =
          false;

      }

    }
  );

}


// ========================================
// INSTALAR VISUAL C++
// ========================================

if (btnVcredist) {

  btnVcredist.addEventListener(
    "click",
    async () => {

      btnVcredist.disabled =
        true;


      btnVcredist.style.opacity =
        "0.6";


      try {

        await window.stockPapel
          .instalarVcredist();

      } finally {

        btnVcredist.disabled =
          false;

        btnVcredist.style.opacity =
          "1";

      }

    }
  );

}


// ========================================
// DESINSTALAR SERVIDOR
// ========================================

if (btnDesinstalar) {

  btnDesinstalar.addEventListener(
    "click",
    async () => {

      btnDesinstalar.disabled =
        true;


      btnDesinstalar.style.opacity =
        "0.6";


      try {

        await window.stockPapel
          .desinstalarServidor();

      } finally {

        btnDesinstalar.disabled =
          false;

        btnDesinstalar.style.opacity =
          "1";

      }

    }
  );

}


// ========================================
// ESTADO INICIAL
// ========================================

async function cargarEstadoInicial() {

  try {

    const estado =
      await window.stockPapel.obtenerEstado();


    actualizarEstado(
      estado
    );

  } catch (error) {

    console.error(
      "No se pudo obtener el estado:",
      error
    );

  }

}

const btnAbrirDatos =
  document.getElementById(
    "btn-abrir-datos"
  );


if (btnAbrirDatos) {

  btnAbrirDatos.addEventListener(
    "click",
    async () => {

      await window.stockPapel
        .abrirCarpetaDatos();

    }
  );

}

const btnCrearBackup =
  document.getElementById(
    "btn-crear-backup"
  );


if (btnCrearBackup) {

  btnCrearBackup.addEventListener(
    "click",
    async () => {

      btnCrearBackup.disabled =
        true;

      btnCrearBackup.style.opacity =
        "0.6";


      try {

        await window.stockPapel
          .crearBackup();

      } finally {

        btnCrearBackup.disabled =
          false;

        btnCrearBackup.style.opacity =
          "1";

      }

    }
  );

}

// ========================================
// IMPORTAR BASE DE DATOS
// ========================================

const btnImportarBase =
  document.getElementById(
    "btn-importar-base"
  );


if (btnImportarBase) {

  btnImportarBase.addEventListener(
    "click",
    async () => {

      btnImportarBase.disabled =
        true;

      btnImportarBase.style.opacity =
        "0.6";


      try {

        await window.stockPapel
          .importarBaseDatos();

      } finally {

        btnImportarBase.disabled =
          false;

        btnImportarBase.style.opacity =
          "1";

      }

    }
  );

}

cargarEstadoInicial();
cargarInicioWindows();