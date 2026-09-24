const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const productoRoutes = require("./routes/productoRoutes");
const movimientoRoutes = require("./routes/movimientoRoutes");
const stockRoutes = require("./routes/stockRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { iniciarDiscovery, detenerDiscovery, } = require("./discovery/serverDiscovery");
const cajaRoutes = require("./routes/cajaRoutes");
const chequeRoutes = require("./routes/chequeRoutes");

const app = express();

app.use(cors());
app.use(express.json());


// ========================================
// MONGODB
// ========================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB conectado");
  })
  .catch((err) => {
    console.log("Error MongoDB:", err);
  });


// ========================================
// API
// ========================================

app.get("/api", (req, res) => {
  res.json({
    ok: true,
    mensaje: "API Stock Papel funcionando",
  });
});

app.use("/api/productos", productoRoutes);
app.use("/api/movimientos", movimientoRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/caja", cajaRoutes);
app.use("/api/cheques", chequeRoutes);


// ========================================
// FRONTEND REACT
// ========================================

const frontendPath = path.join(
  __dirname,
  "../Frontend/dist"
);

app.use(express.static(frontendPath));


// ========================================
// REACT ROUTING
// ========================================

app.get(/.*/, (req, res) => {
  res.sendFile(
    path.join(frontendPath, "index.html")
  );
});


// ========================================
// SERVIDOR
// ========================================

const PORT =
  Number(process.env.PORT) || 5000;

const server = app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Servidor ejecutándose en puerto ${PORT}`
    );

    iniciarDiscovery();

  }
);


// ========================================
// CIERRE DEL SERVIDOR
// ========================================

function cerrarServidor() {

  console.log(
    "\nCerrando servidor..."
  );

  detenerDiscovery();

  server.close(() => {

    console.log(
      "Servidor cerrado."
    );

    process.exit(0);

  });

}

process.on(
  "SIGINT",
  cerrarServidor
);

process.on(
  "SIGTERM",
  cerrarServidor
);