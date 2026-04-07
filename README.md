# SakuraBlog - Full Stack Anime Platform

SakuraBlog es una plataforma web moderna y full-stack diseñada bajo una estética *cyberpunk/editorial* para la publicación de artículos y reseñas (reviews) orientados a la cultura pop y japonesa, con soporte nativo de Base de Datos relacional, autenticación vía JWT en cookies y URLs limpias sin extensiones.

## 🚀 Tecnologías Principales

- **Frontend:** HTML5, Vanilla JavaScript, Vanilla CSS, Bootstrap 5 (Modals), JQuery.
- **Backend:** Node.js, Express.js.
- **Base de Datos:** MySQL (con proxy dinámico para "High-Availability Fallback").
- **Seguridad:** JSON Web Tokens (JWT) sellados en cookies `HttpOnly`, `bcrypt` para hashing de contraseñas.

## 📦 Requisitos Previos

Cualquier persona que desee clonar y correr este proyecto de manera local necesita instalar:
1. **[Node.js](https://nodejs.org/es/)** (v16.x o superior): Para ejecutar el servidor backend.
2. **[Git](https://git-scm.com/)**: Para clonar el código.
3. **Pila LAMP/XAMPP (Opcional)**: El código trae internamente una base de datos MySQL en la nube (Clever Cloud) que interviene de emergencia. Si XAMPP falla o no está encendido, la web seguirá funcionando, pero para desarrollar velozmente se recomienda instanciar XAMPP / MySQL de madera local.

## ⚙️ Pasos de Instalación

**1. Clonar el repositorio:**
```bash
git clone https://github.com/EliasColli/BlogAnime-proyecto.git
cd BlogAnime-proyecto
```

**2. Instalar las dependencias de Backend:**
Debes situarte dentro de la carpeta `/backend` y ejecutar la instalación de paquetes con Node Package Manager (NPM).
```bash
cd backend
npm install
```
*(Esto descargará dependencias clave como `express`, `mysql2`, `dotenv`, `cookie-parser`, `cors`, `jsonwebtoken` y `bcrypt` en una carpeta invisible llamada `node_modules`)*.

**3. Configurar el Entorno (Local MySQL):**
Si decides hostear tu propia Base de Datos, dentro de la carpeta `backend/db`, encontrarás el archivo `database.sql`. Puedes importarlo en phpMyAdmin (usuario root sin contraseña) o en tu gestor MySQL para crear automáticamente un esquema `blog_anime` con las tablas `users` y `articles`.

**4. Arrancar el Servidor:**
Estando en el directorio principal de backend:
```bash
node server.js
```
El servidor se montará en `http://localhost:3000`. Conéctate ahí usando cualquier navegador web.

## 🛡️ Estructura del Enrutador
El framework de servidor despacha los archivos sin las extensiones tradicionales, mapeando estáticamente la carpeta `css`, `js` y `img`, y ofreciendo *Pretty URLs* desde la raíz (ej: `/login` en vez de `/html/login.html`). Las APIs están firmemente aseguradas e insertan tokens indetectables (`HttpOnly`).
