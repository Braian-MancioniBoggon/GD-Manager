import api from "../../../shared/services/api";

const API = "/usuarios";

// =====================================================
// USUARIOS
// =====================================================

export const obtenerUsuarios = async () => {
const res = await api.get(API);
return res.data;
};

export const obtenerUsuariosLogin = async () => {
  const res = await api.get(
    `${API}/login-lista`
  );

  return res.data;
};

export const crearUsuario = async (data) => {
const res = await api.post(API, data);
return res.data;
};

export const loginUsuario = async (
nombre,
password
) => {
const res = await api.post(
`${API}/login`,
{
nombre,
password,
}
);

return res.data;
};

// =====================================================
// MI PERFIL
// =====================================================

export const editarMiPerfil = async (data) => {
const res = await api.put(
`${API}/perfil`,
data
);

return res.data;
};

export const cambiarMiPassword = async (
passwordActual,
nuevaPassword
) => {
const res = await api.put(
`${API}/perfil/password`,
{
passwordActual,
nuevaPassword,
}
);

return res.data;
};

// =====================================================
// ADMINISTRACIÓN DE USUARIOS
// =====================================================

export const editarUsuario = async (
id,
data
) => {
const res = await api.put(
`${API}/${id}`,
data
);

return res.data;
};

export const cambiarEstadoUsuario = async (
id
) => {
const res = await api.put(
`${API}/${id}/estado`
);

return res.data;
};

// =====================================================
// PERMISOS
// =====================================================

export const obtenerPermisos = async () => {
const res = await api.get(
`${API}/permisos`
);

return res.data;
};

// =====================================================
// ROLES
// =====================================================

export const obtenerRoles = async () => {
const res = await api.get(
`${API}/roles`
);

return res.data;
};

export const crearRol = async (data) => {
const res = await api.post(
`${API}/roles`,
data
);

return res.data;
};

export const editarRol = async (
id,
data
) => {
const res = await api.put(
`${API}/roles/${id}`,
data
);

return res.data;
};

export const obtenerRol = async (id) => {
  const res = await api.get(
    `${API}/roles/${id}`
  );

  return res.data;
};

// =====================================================
// ACTIVAR / DESACTIVAR ROL
// =====================================================

export const cambiarEstadoRol = async (
  id
) => {

  const res = await api.put(
    `${API}/roles/${id}/estado`
  );

  return res.data;

};