# 🎲 Dice & Notes

**Dice & Notes** es una aplicación web para gestionar tus partidas de **Dungeons & Dragons 5e**. Todo en un solo lugar: campañas, fichas, apuntes y mucho más.

---

## 📌 Funcionalidades principales

### 🗺️ Campañas y encuentros
Organiza tus campañas de D&D 5e desde un solo panel.  
- Crea campañas.  
- Invita jugadores mediante un enlace único.  
- Añade y gestiona sesiones y encuentros.  
- Usa un sistema de iniciativa para reproducir encuentros.  

### 🧝‍♂️ Fichas de personaje
Crea personajes con todas las propiedades clásicas de un aventurero:  
- Estadísticas, raza, clase, nivel, habilidades, etc.  
- Guarda y accede fácilmente a su evolución.  
- Visualiza todos los personajes de una campaña en una barra lateral compacta.

### 🧠 Apuntes y lore
Registra todo lo que ocurra en tus sesiones:  
- Añade notas estilo post-it en tiempo real.  
- Revela información importante a los jugadores.  
- Crea apuntes colaborativos entre el grupo.  

### 🔄 Conexión en tiempo real
Sincroniza tus campañas con todos los participantes:  
- Comparte datos, personajes, sesiones y notas al instante.  
- Flujo constante de información entre DM y jugadores.

---

## 🎮 ¿Qué puedes hacer con Dice & Notes?

✅ Crear campañas, sesiones y encuentros  
✅ Invitar a tus jugadores con un enlace único  
✅ Crear personajes y enemigos personalizados  
✅ Asignar enemigos a encuentros  
✅ Jugar encuentros con iniciativa en tiempo real  
✅ Tomar notas públicas o privadas en vivo  
✅ Crear un perfil personal visible con tus personajes y campañas  
✅ Visualizar la información esencial de cada campaña rápidamente

---

## 🚀 Ideal para
- DMs que quieren llevar un control completo de su mundo.
- Jugadores que desean tener sus fichas y apuntes centralizados.
- Grupos que juegan tanto en mesa como a distancia y necesitan una herramienta colaborativa.

---

¡Lleva tu aventura al siguiente nivel con **Dice & Notes**!

---

# 🐳 Guía para levantar Docker localmente - Dice & Notes

Este proyecto utiliza Docker para levantar un entorno de desarrollo con **backend** (Django), **frontend** (React) y **servicios adicionales** como PostgreSQL y Redis.

---

## ⚙️ Requisitos previos

- Tener instalado [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/).
- Tener una cuenta de Firebase y un proyecto creado.

---

## 📁 Archivos necesarios

Antes de ejecutar Docker, asegúrate de tener los siguientes archivos configurados:

### 1. 🔐 Variables de entorno

#### Backend (`.env` en el directorio del backend)

DJANGO_SECRET_KEY=django-insecure-<tu-clave>
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

DATABASE_URL=postgresql://<usuario>:<contraseña>@db:5432/<nombre_base_datos>
REDIS_URL=redis://redis:6379
FIREBASE_CONFIG=jsonconfig

Esta última variable debe contener las credenciales de tu servicio de Firebase (descargadas desde la consola de Firebase).  
Formato esperado:

{
  "type": "service_account",
  "project_id": "<tu-proyecto>",
  "private_key_id": "<clave_id>",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "<correo@firebaseapp.com>",
  ...
}

#### Frontend (`.env` en el directorio del frontend)

# Firebase
VITE_FIREBASE_API_KEY=clave
VITE_FIREBASE_AUTH_DOMAIN=clave
VITE_FIREBASE_PROJECT_ID=clave
VITE_FIREBASE_STORAGE_BUCKET=clave
VITE_FIREBASE_MESSAGING_SENDER_ID=clave
VITE_FIREBASE_APP_ID=clave
VITE_FIREBASE_MEASUREMENT_ID=clave

# Local
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000/ws
VITE_FRONT_BASE_URL=http://localhost:5173

---

### 2. 🔐 Archivo de credenciales de Firebase

Debes crear un archivo llamado `firebase_config.json` en el directorio raíz del backend.



---

## 🧪 Configuración en Firebase

1. Habilita el proveedor de autenticación (por ejemplo, email/contraseña o Google).
2. Agrega `http://127.0.0.1` y `http://localhost` a los **dominios autorizados**.

---

## 🚀 Levantar los contenedores

Ubícate en la raíz del proyecto donde esté tu archivo `docker-compose.yml` y ejecuta:


docker compose up


Si deseas forzar la reconstrucción de las imágenes:


docker compose up --build


Para apagar y eliminar los contenedores, volúmenes y redes creadas:


docker compose down


---

## 📦 Contenedores que se levantan

- `backend` (Django)
- `frontend` (React + Vite)
- `db` (PostgreSQL)
- `redis` (Redis)

---

## ✅ Estado final

Una vez ejecutado, deberías tener:

- Frontend corriendo en: `http://localhost:5173`
- Backend API en: `http://localhost:8000/api`
- Base de datos y Redis funcionando dentro de sus contenedores
- Autenticación Firebase conectada al frontend y backend

---

¡Ya tienes tu entorno local listo para jugar y desarrollar! 🧙‍♂️

---

# 🧾 Changelog

## 🐣 0.0.1 - Inicialización
- Creación del proyecto
- Pruebas con Django Templates

## 🚀 0.1.0 - Primeras funcionalidades
- Creación de las primeras páginas y navbar
- Primeras pruebas con Django REST API
- Creación del primer modelo de datos

## 🔐 0.1.1 - Firebase básico
- Conexión con Firebase para autenticación
- Mejora del modelo de datos básico

## 🔄 0.2.0 - Backend conectado con Frontend
- CORS funcionando correctamente
- Creación de usuario y perfil tras iniciar sesión con Firebase
- Expansión del modelo de datos
- Vistas de perfil de usuario y "Mis campañas"

## 📁 0.2.1 - Campañas y tabs
- Reforma del modelo de datos
- Vista detalle de campaña
- Creación de tabs en campañas

## 🗓️ 0.2.2 - Vista de sesiones
- Vista de lista y detalle de sesiones

## 🧩 0.3.0 - WebSockets y autenticación avanzada
- Nueva lógica de sesión usando tokens de Firebase + sesión local de Django
- Autorización con permisos en peticiones al servidor
- WebSockets en sesiones: notas (post-its) en tiempo real entre usuarios

## 🧾 0.3.1 - Rediseño de notas e ítems
- Rediseño de notas y componentes
- Modelos y funcionalidades para ítems

## 🛠️ 0.3.2 - Encuentros y sesiones
- Modal de creación y edición de sesiones
- Vista detalle de encuentros

## ⚔️ 0.4.0 - Encuentros en tiempo real
- Lógica de encuentros implementada
- WebSockets en encuentros
- Cambios menores en tablas relacionadas

## 🧪 0.4.1 - Fixes en encuentros (26/05/2025)
- Correcciones en la lógica de encuentros
- Creación de la vista Detalle de Encuentro

## 🧱 0.4.2 - Avances en formularios (30/05/2025)
- Comienzo del formulario de creación de encuentros

## 🧱 0.5.0 - Gestión de personajes (31/05/2025)
- Formulario de creación de encuentros
- Vistas de lista y detalle de personajes
- Formulario de edición de personaje

## 🧙 0.5.1 - Personajes mejorados (01/06/2025)
- Formulario de creación de personaje
- Cambios de diseño generales

## 👹 0.5.2 - Enemigos implementados (02/06/2025)
- Formularios de creación y edición de enemigos
- Vista detalle de enemigos
- Fix: Bug en enemigos seleccionados al crear un encuentro

## 🔧 0.5.3 - Ajustes visuales (03/06/2025)
- Arreglo de bugs varios
- Campo "creador" añadido a enemigos
- Mantenimiento de componentes
- Rediseño de botones laterales

## 🧭 0.6.0 - Verificación y navegación (04/06/2025)
- Sidebar para campañas
- Verificación de email al registrarse
- Rediseño del footer

## 🎉 1.0.0 - Primera versión estable (05/06/2025)
- Página principal (Home)
- Rediseño menor de varias vistas
- Corrección de bugs menores en sesiones y encuentros
- Preparación para despliegue

## 🔧 1.0.1 - Arreglos varios de primera versión (09/06/2025)
- Arreglos varios en invitaciones, enemigos, notas e imagenes 