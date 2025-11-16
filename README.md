# Sistema Web Para la Gestión de Adopciones Responsables de Mascotas (SWGARM)

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

El servidor estará disponible en `http://localhost:3001`


## 👥 Perfiles de Usuario

### Administrador: 
Usuario: admin@admin.com
Contraseña: admin
- Gestionar animales
- Revisar y aprobar solicitudes de adopción
- Gestión de Salud
- Gestión de Estados
- Seguimiento de Solicitudes
- Generar reportes
- Administrar usuarios
- Gestión de Campañas

### Adoptante
Usuario: usuario@usuario.com
Contraseña: usuario
- Ver animales disponibles
- Editar perfil
- Crear solicitudes de adopción
- Ver estado de sus solicitudes
- Ver notificaciones


## 📸 Sistema de Subida de Imágenes

✅ **Implementado:** Sistema completo para subir y gestionar imágenes de animales.

**Características:**
- Subida de imágenes directamente desde la computadora
- Validación de tipo (JPG, PNG, GIF, WEBP) y tamaño (máx. 5MB)
- Vista previa antes de subir
- Almacenamiento automático en servidor
- Acceso desde todas las páginas del sistema


## 👨‍💻 Autor

Desarrollado como proyecto final de grado por Mayco Alexis Vassalle

## 📄 Licencia

Este proyecto es privado y solo para uso académico.

