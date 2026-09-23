import {
createContext,
useContext,
useEffect,
useMemo,
useState,
} from "react";

const UsuarioContext =
createContext(null);

export const useUsuario =
() =>
useContext(
UsuarioContext
);

export default function UsuarioProvider({
children,
}) {

const [
usuarioActual,
setUsuarioActual,
] =
useState(null);

useEffect(() => {

const stored =
  localStorage.getItem(
    "usuario"
  );

if (stored) {

  try {

    setUsuarioActual(
      JSON.parse(
        stored
      )
    );

  } catch {

    localStorage.removeItem(
      "usuario"
    );

  }

}

}, []);

const login =
(usuario) => {

  setUsuarioActual(
    usuario
  );

  localStorage.setItem(
    "usuario",
    JSON.stringify(
      usuario
    )
  );

};

const actualizarUsuarioActual = (usuario) => {
  setUsuarioActual(usuario);
  localStorage.setItem(
    "usuario",
    JSON.stringify(usuario)
  );
};

const logout =
() => {

  setUsuarioActual(
    null
  );

  localStorage.removeItem(
    "usuario"
  );

};

const tienePermiso =
(permiso) => {

  if (
    !usuarioActual
  ) {

    return false;

  }

  return (
    usuarioActual
      .permisosEfectivos
      ?.includes(
        permiso
      ) ||
    false
  );

};

const esAdministrador =
tienePermiso(
"administrar_usuarios"
);

const value =
useMemo(
() => ({

    usuarioActual,

    login,

    logout,

    setUsuarioActual,

    actualizarUsuarioActual,

    tienePermiso,

    esAdministrador,

  }),
  [
    usuarioActual,
    esAdministrador,
  ]
);

return (
<UsuarioContext.Provider
value={value}
>
{children}
</UsuarioContext.Provider>
);

}