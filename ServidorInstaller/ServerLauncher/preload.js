const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("stockPapel", {

  obtenerEstado: () =>
    ipcRenderer.invoke("obtener-estado"),

  detenerServidor: () =>
    ipcRenderer.invoke("detener-servidor"),

  iniciarServidor: () =>
    ipcRenderer.invoke("iniciar-servidor"),

  abrirCarpetaDatos: () =>
    ipcRenderer.invoke("abrir-carpeta-datos"),

  crearBackup: () =>
    ipcRenderer.invoke("crear-backup"),

  importarBaseDatos: () =>
    ipcRenderer.invoke("importar-base-datos"),

  obtenerInicioWindows: () =>
    ipcRenderer.invoke("obtener-inicio-windows"),


  cambiarInicioWindows: (habilitado) =>
    ipcRenderer.invoke("cambiar-inicio-windows", habilitado),


  instalarVcredist: () =>
    ipcRenderer.invoke("instalar-vcredist"),


  desinstalarServidor: () =>
    ipcRenderer.invoke("desinstalar-servidor"),
  

  onEstado: (callback) => {

    ipcRenderer.on(
      "estado-servidor",
      (_, estado) => {
        callback(estado);
      }
    );

  },

  onLog: (callback) => {

    ipcRenderer.on(
      "log-servidor",
      (_, mensaje) => {
        callback(mensaje);
      }
    );

  }

});