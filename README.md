# Stock Papel

Sistema de gestión y control de stock para una imprenta gráfica.

Stock Papel permite administrar productos de papel, controlar existencias, registrar movimientos y gestionar usuarios y permisos desde una aplicación web conectada a un servidor local.

El proyecto también incluye un cliente de escritorio para conectarse al servidor dentro de una red LAN y una aplicación para instalar y administrar el servidor.

---

## Estructura del proyecto

```text
Stock-Papel/
│
├── backend/
│   └── API, servidor Node.js, MongoDB y descubrimiento LAN
│
├── frontend/
│   └── Aplicación web React
│
├── cliente/
│   └── Aplicación Electron para los puestos de trabajo
│
├── servidorinstaller/
│   └── Aplicación Electron para instalar y administrar el servidor
│
├── .gitignore
└── README.md
```

---

## Arquitectura

```text
                    RED LOCAL (LAN)
                           │
                           │
                ┌──────────▼──────────┐
                │   Stock Papel       │
                │      Server         │
                │                     │
                │ Node.js + Express   │
                │ MongoDB             │
                └──────────┬──────────┘
                           │
                           │ HTTP / API
                           │
                ┌──────────▼──────────┐
                │      Cliente        │
                │      Electron       │
                │                     │
                │ React + Axios       │
                └─────────────────────┘
```

El sistema está compuesto por:

* **Backend:** API REST, lógica del servidor, conexión con MongoDB y descubrimiento del servidor dentro de la red.
* **Frontend:** interfaz principal desarrollada con React y Chakra UI.
* **Cliente:** aplicación Electron utilizada para ejecutar el frontend y conectarse al servidor dentro de la red LAN.
* **Servidor Installer:** aplicación Electron utilizada para instalar, iniciar, detener y administrar el servidor Stock Papel.

---

# Tecnologías

## Frontend

* React
* Vite
* Chakra UI
* Axios

## Backend

* Node.js
* Express
* MongoDB
* Mongoose
* CORS
* dotenv

## Aplicaciones de escritorio

* Electron
* Electron Builder

---

# Funcionalidades

## Gestión de stock

* Consulta del stock actual.
* Ingreso de papel.
* Egreso de papel.
* Ajustes de stock.
* Control de stock mínimo.
* Clasificación de productos por prioridad.
* Gestión de tipos de papel.
* Gestión de gramajes.
* Gestión de medidas.
* Activación y desactivación de productos.

## Movimientos

El sistema registra los movimientos realizados sobre el stock, permitiendo mantener un historial de las operaciones.

Entre los movimientos principales se encuentran:

* Ingresos.
* Egresos.
* Ajustes.

## Usuarios y permisos

Stock Papel cuenta con un sistema de usuarios y roles.

Roles principales:

* Administrador.
* Administrativo.
* Guillotinista.
* Espectador.

Los permisos permiten controlar qué operaciones puede realizar cada usuario dentro del sistema.

## Administración

El sistema contempla módulos administrativos para la gestión de operaciones internas, incluyendo:

* Caja diaria.
* Registro de cheques.
* Consulta de información histórica.

---

# Instalación para desarrollo

## Requisitos

Antes de comenzar es necesario tener instalado:

* Node.js
* npm
* MongoDB

---

# Backend

Entrar en la carpeta:

```bash
cd backend
```

Instalar dependencias:

```bash
npm install
```

Configurar las variables de entorno necesarias.

Ejemplo:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/stock-papel
```

Iniciar el servidor:

```bash
npm start
```

El backend utiliza:

```text
http://localhost:5000
```

La API se encuentra disponible bajo:

```text
http://localhost:5000/api
```

---

# Frontend

Entrar en la carpeta:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Iniciar el entorno de desarrollo:

```bash
npm run dev
```

Vite proporcionará la dirección local correspondiente, normalmente:

```text
http://localhost:5173
```

---

# Cliente Electron

Entrar en:

```bash
cd cliente
```

Instalar dependencias:

```bash
npm install
```

Ejecutar:

```bash
npm start
```

El cliente Electron carga la aplicación frontend compilada y utiliza Axios para comunicarse con el servidor Stock Papel.

El cliente puede utilizar el mecanismo de descubrimiento LAN para localizar el servidor dentro de la red.

---

# Servidor Installer

Entrar en:

```bash
cd servidorinstaller
```

Instalar dependencias:

```bash
npm install
```

Ejecutar durante el desarrollo:

```bash
npm start
```

La aplicación permite administrar el servidor Stock Papel y sus servicios asociados.

---

# Descubrimiento del servidor

Stock Papel utiliza descubrimiento dentro de la red LAN para facilitar la conexión de los clientes.

El servidor anuncia información similar a:

```json
{
  "servicio": "stock-papel",
  "id": "servidor-principal",
  "nombre": "Stock Papel",
  "puerto": 5000
}
```

El cliente utiliza esta información para localizar el servidor sin depender exclusivamente de una IP configurada manualmente.

---

# Base de datos

Stock Papel utiliza MongoDB.

La base de datos utilizada por el sistema es:

```text
stock-papel
```

Los datos de MongoDB son locales al servidor y **no forman parte del repositorio Git**.

Los backups de la base de datos tampoco deben subirse al repositorio.

---

# Seguridad

No subir al repositorio:

* Contraseñas.
* Tokens.
* Claves privadas.
* Archivos `.env`.
* Bases de datos.
* Backups.
* Datos reales de usuarios.
* Instaladores generados.
* Ejecutables generados.

Las configuraciones sensibles deben mantenerse fuera del repositorio.

Cuando sea necesario documentar variables de entorno, utilizar un archivo:

```text
.env.example
```

sin credenciales reales.

---

# Build

Los instaladores y ejecutables generados para distribución no forman parte del código fuente del proyecto.

Los builds deben generarse localmente utilizando las configuraciones de Electron Builder correspondientes a cada aplicación.

---

# Flujo de trabajo recomendado

Actualizar el repositorio:

```bash
git pull
```

Instalar dependencias cuando sea necesario:

```bash
npm install
```

Después de realizar cambios:

```bash
git status
```

Agregar los archivos:

```bash
git add .
```

Crear el commit:

```bash
git commit -m "Descripción del cambio"
```

Subir los cambios:

```bash
git push
```

---

# Convención de commits

Se recomienda utilizar mensajes de commit descriptivos.

Ejemplos:

```text
feat: agregar módulo de caja diaria
feat: agregar registro de cheques
feat: agregar permisos administrativos
fix: corregir descubrimiento del servidor
fix: corregir actualización del stock
refactor: reorganizar módulo de usuarios
style: mejorar modal de perfil
docs: actualizar documentación
```

---

# Estado del proyecto

Stock Papel se encuentra actualmente en desarrollo.

El repositorio contiene:

* Backend.
* Frontend.
* Cliente Electron.
* Servidor/instalador Electron.
* Sistema de usuarios y permisos.
* Gestión de stock.
* Registro de movimientos.
* Comunicación mediante API REST.
* MongoDB.
* Descubrimiento del servidor dentro de la red LAN.

Nuevos módulos y funcionalidades serán incorporados progresivamente.

---

# Licencia

Este proyecto es de uso privado.

La licencia y las condiciones de distribución podrán definirse posteriormente.
