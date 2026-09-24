const mongoose = require("mongoose");

const permisosDisponibles = [
  "ver_stock",
  "ingresar_papel",
  "retirar_papel",
  "ajustar_stock",
  "crear_producto",
  "editar_producto",
  "desactivar_producto",
  "ver_historial",
  "administrar_usuarios",
  "crear_usuarios",
  "editar_usuarios",
  "desactivar_usuarios",
  "administrar_roles",

  // ========================================
  // ADMINISTRACIÓN - CAJA
  // ========================================

  "ver_caja",
  "crear_caja",
  "editar_caja",
  "cerrar_caja",

  // ========================================
  // ADMINISTRACIÓN - CHEQUES
  // ========================================

  "ver_cheques",
  "crear_cheque",
  "editar_cheque",
  "cambiar_estado_cheque",
];

const UsuarioSchema = new mongoose.Schema(
{
nombre: {
type: String,
required: true,
unique: true,
trim: true,
},

password: {
  type: String,
  required: true,
},

color: {
  type: String,
  default: "#E20A19",
},

avatar: {
  type: String,
  default: "logo",
},

rol: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Rol",
  required: true,
},

permisosOtorgados: {
  type: [String],
  default: [],
  enum: permisosDisponibles,
},

permisosRevocados: {
  type: [String],
  default: [],
  enum: permisosDisponibles,
},

activo: {
  type: Boolean,
  default: true,
},

ultimoIngreso: {
  type: Date,
  default: null,
},

},
{
timestamps: true,
}
);

const RolSchema = new mongoose.Schema(
{
nombre: {
type: String,
required: true,
unique: true,
trim: true,
},

descripcion: {
  type: String,
  default: "",
},

permisos: {
  type: [String],
  default: [],
  enum: permisosDisponibles,
},

activo: {
  type: Boolean,
  default: true,
},

},
{
timestamps: true,
}
);

const Usuario = mongoose.model(
"Usuario",
UsuarioSchema
);

const Rol = mongoose.model(
"Rol",
RolSchema
);

module.exports = Usuario;

module.exports.Rol = Rol;

module.exports.permisosDisponibles =
permisosDisponibles;