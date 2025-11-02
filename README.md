# Sistema Web de Gestión de Adopción y Rescate de Mascotas (SWGARM)

Sistema web desarrollado para la gestión de adopción de mascotas de un refugio local. Permite gestionar animales disponibles para adopción, solicitudes de adopción y perfiles de usuario.

## 🚀 Tecnologías Utilizadas

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Base de Datos:** MySQL
- **Autenticación:** JWT (JSON Web Tokens)
- **Subida de Archivos:** Multer

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v8.0 o superior)
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio** (si aplica)

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar base de datos:**
   - Crear una base de datos MySQL llamada `swgarm`
   - Importar el archivo `estructura.sql` en tu base de datos:
   ```bash
   mysql -u root -p swgarm < estructura.sql
   ```

4. **Configurar variables de entorno:**
   - Copiar el archivo `.env.example` a `.env`
   - Modificar las variables según tu configuración:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=tu_contraseña
   DB_NAME=swgarm
   PORT=3001
   JWT_SECRET=tu_secret_key_segura
   ```

5. **Iniciar el servidor:**
```bash
npm start
```

Para desarrollo con auto-reload:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

## 📂 Estructura del Proyecto

```
Prototipo_SWGARM/
├── backend/
│   ├── config/
│   │   └── db.js           # Configuración de base de datos
│   ├── controllers/
│   │   ├── animalController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   ├── autMiddleware.js # Middleware de autenticación
│   │   └── uploadMiddleware.js # Middleware de subida de archivos
│   ├── models/
│   │   ├── animal.js
│   │   └── User.js
│   ├── routes/
│   │   ├── animalRoutes.js
│   │   └── userRoutes.js
│   ├── uploads/
│   │   └── images/         # Carpeta para imágenes subidas
│   └── app.js              # Configuración de Express
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── api.js          # Cliente API
│   │   ├── auth.js         # Funciones de autenticación
│   │   ├── login.js
│   │   ├── register.js
│   │   └── animales.js
│   ├── images/
│   └── *.html              # Páginas del frontend
├── estructura.sql          # Esquema de la base de datos
├── package.json
├── server.js              # Punto de entrada de la aplicación
└── README.md
```

## 👥 Perfiles de Usuario

### Administrador
- Gestionar animales
- Revisar y aprobar solicitudes de adopción
- Generar reportes
- Administrar usuarios

### Adoptante
- Ver animales disponibles
- Crear solicitudes de adopción
- Ver estado de sus solicitudes

## 🔐 Endpoints API

### Autenticación
- `POST /api/usuarios/register` - Registro de usuarios
- `POST /api/usuarios/login` - Inicio de sesión

### Animales
- `GET /api/animales` - Listar todos los animales
- `GET /api/animales/:id` - Obtener un animal por ID
- `POST /api/animales` - Crear un nuevo animal (requiere auth)
- `PUT /api/animales/:id` - Actualizar un animal (requiere auth)
- `DELETE /api/animales/:id` - Eliminar un animal (requiere auth)

## 📸 Sistema de Subida de Imágenes

✅ **Implementado:** Sistema completo para subir y gestionar imágenes de animales.

**Características:**
- Subida de imágenes directamente desde la computadora
- Validación de tipo (JPG, PNG, GIF, WEBP) y tamaño (máx. 5MB)
- Vista previa antes de subir
- Almacenamiento automático en servidor
- Acceso desde todas las páginas del sistema

📖 **Documentación Completa:** Ver [DOCUMENTACION_SUBIDA_IMAGENES.md](./DOCUMENTACION_SUBIDA_IMAGENES.md)

## 🐛 Problemas Conocidos y Mejoras Futuras

1. **Autenticación:** ✅ Protección completa de rutas implementada
2. **Validación:** ✅ Validación robusta implementada
3. **Imágenes:** ✅ Sistema de subida de imágenes implementado
4. **Email:** Agregar notificaciones por email
5. **Reportes:** Implementar generación de reportes PDF

## 📝 Notas de Desarrollo

- El frontend y backend están separados, pero comparten la misma base de datos
- Las rutas de API siguen el prefijo `/api`
- Los archivos estáticos del frontend se sirven desde `backend/public`
- La autenticación usa JWT con expiración de 8 horas

## 👨‍💻 Autor

Desarrollado como proyecto final de grado.

## 📄 Licencia

Este proyecto es privado y solo para uso académico.

