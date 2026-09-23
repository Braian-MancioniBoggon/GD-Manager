const {
  contextBridge,
  ipcRenderer,
} = require("electron");

contextBridge.exposeInMainWorld(
  "stockPapel",
  {

    buscarServidor: () =>
      ipcRenderer.invoke(
        "buscar-servidor"
      ),

  }
);