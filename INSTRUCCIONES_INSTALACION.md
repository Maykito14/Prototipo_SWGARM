# Guía Completa de Instalación y Ejecución - SWGARM

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación del Servidor](#instalación-del-servidor)
3. [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
4. [Configuración del Proyecto](#configuración-del-proyecto)
5. [Iniciar la Aplicación](#iniciar-la-aplicación)
6. [Verificación](#verificación)
7. [Solución de Problemas](#solución-de-problemas)
8. [Estructura del Proyecto](#estructura-del-proyecto)

---

## 📦 Requisitos Previos

### Software Necesario:

1. **Node.js** (versión 14 o superior)
   - Descargar desde: https://nodejs.org/
   - Verificar instalación:
   ```bash
   node --version
   npm --version
   ```

2. **MySQL** (versión 8.0 o superior)
   - Descargar desde: https://dev.mysql.com/downloads/mysql/
   - O usar XAMPP/WAMP que incluye MySQL
   - Verificar instalación:
   ```bash
   mysql --version
   ```

3. **Editor de Código** (opcional pero recomendado)
   - Visual Studio Code
   - O cualquier editor de texto

---

## 🖥️ Instalación del Servidor

### Paso 1: Clonar o Descargar el Proyecto

Si tienes el proyecto en un repositorio Git:
```bash
git clone [URL_DEL_REPOSITORIO]
cd Prototipo_SWGARM
```

Si solo tienes los archivos, asegúrate de estar en la carpeta del proyecto.

### Paso 2: Instalar Dependencias de Node.js

Abre una terminal en la carpeta raíz del proyecto (`Prototipo_SWGARM`) y ejecuta:

```bash
npm install
```

Esto instalará todas las dependencias necesarias:
- express
- mysql2
- bcrypt
- jsonwebtoken
- dotenv
- cors
- ejs

**Verificación:** Deberías ver una carpeta `node_modules` creada después de la instalación.

---

## 🗄️ Configuración de la Base de Datos

### Paso 1: Crear la Base de Datos MySQL

1. Abre MySQL (Workbench, línea de comandos, o phpMyAdmin si usas XAMPP/WAMP)

2. Crea la base de datos:
```sql
CREATE DATABASE swgarm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Verifica que se creó correctamente:
```sql
SHOW DATABASES;
```

### Paso 2: Importar la Estructura Completa de la Base de Datos

**Importante:** El archivo `estructura.sql` ya incluye todas las tablas y actualizaciones necesarias. Solo necesitas ejecutar este único archivo.

Opción A - Usando MySQL Workbench:
1. Abre MySQL Workbench
2. Conecta a tu servidor MySQL
3. Selecciona la base de datos `swgarm`
4. File → Open SQL Script → Selecciona `estructura.sql`
5. Ejecuta el script completo (Execute o F5)

Opción B - Usando línea de comandos:
```bash
mysql -u root -p swgarm < estructura.sql
```
(Te pedirá la contraseña de MySQL)

**Nota:** Este script crea todas las tablas con todas las actualizaciones ya aplicadas. No necesitas ejecutar ningún otro script SQL.

### Paso 3: Verificar la Estructura de la Base de Datos

Ejecuta en MySQL:
```sql
USE swgarm;
SHOW TABLES;
```

Deberías ver las siguientes 12 tablas:
- adopcion
- adoptante
- animal
- campaña
- estado_animal
- notificacion
- preferencias_notificacion
- reporte
- salud
- seguimiento
- solicitud
- usuario

Si ves todas estas tablas, la base de datos está correctamente configurada. ✅

---

## ⚙️ Configuración del Proyecto

### Paso 1: Crear Archivo de Variables de Entorno

1. En la raíz del proyecto (`Prototipo_SWGARM`), copia el archivo `ENV.example`:
   - Windows: `copy ENV.example .env`
   - Linux/Mac: `cp ENV.example .env`

2. Abre el archivo `.env` y configura las siguientes variables:

```env
# Configuración de Base de Datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_contraseña_mysql
DB_NAME=swgarm

# Configuración del Servidor
PORT=3001

# JWT Secret Key (cambiar en producción por una clave segura)
JWT_SECRET=devsecret_cambiar_en_produccion
```

**Importante:**
- Reemplaza `tu_contraseña_mysql` con tu contraseña real de MySQL
- Si MySQL no tiene contraseña, deja `DB_PASS=` vacío
- El `JWT_SECRET` puede ser cualquier cadena de texto, pero en producción usa una clave segura y aleatoria

### Paso 2: Verificar la Configuración

Asegúrate de que:
- ✅ El archivo `.env` existe en la raíz del proyecto
- ✅ Todas las variables están configuradas correctamente
- ✅ La contraseña de MySQL es correcta
- ✅ El nombre de la base de datos coincide (`swgarm`)

---

## 🚀 Iniciar la Aplicación

### Paso 1: Iniciar el Servidor

Abre una terminal en la carpeta raíz del proyecto y ejecuta:

**Para producción:**
```bash
npm start
```

**Para desarrollo (con auto-reload):**
```bash
npm run dev
```

Si todo está correcto, deberías ver:
```
🚀 Servidor SWGARM corriendo en http://localhost:3001
📝 API disponible en http://localhost:3001/api
⏰ Recordatorios de seguimiento activos (cada 5 min)
```

### Paso 2: Acceder a la Aplicación

Abre tu navegador web y navega a:

**Frontend (Interfaz de Usuario):**
```
http://localhost:3001
```

**API (Endpoint de prueba):**
```
http://localhost:3001/api
```

Deberías ver el mensaje: "API SWGARM funcionando correctamente 🚀"

---

## ✅ Verificación

### Verificar que Todo Funciona:

1. **Servidor funcionando:**
   - ✅ Deberías ver mensajes en la consola sin errores
   - ✅ La página principal se carga en `http://localhost:3001`

2. **Base de datos conectada:**
   - ✅ No deberías ver errores de conexión en la consola
   - ✅ Puedes probar crear un usuario desde la interfaz

3. **Funcionalidades principales:**
   - ✅ Login/Registro funcionan
   - ✅ Puedes ver la lista de animales
   - ✅ Los administradores pueden acceder a paneles admin

### Probar la Conexión a la Base de Datos:

Puedes crear un usuario de prueba desde la interfaz:
1. Ve a `http://localhost:3001/register.html`
2. Regístrate con un email y contraseña
3. Verifica en MySQL que se creó el usuario:
```sql
SELECT * FROM usuario;
```

---

## 🔧 Solución de Problemas

### Error: "Cannot find module 'express'"
**Solución:** Ejecuta `npm install` nuevamente

### Error: "Access denied for user 'root'@'localhost'"
**Solución:** 
- Verifica que `DB_USER` y `DB_PASS` en `.env` sean correctos
- Asegúrate de que MySQL esté corriendo
- Verifica que el usuario tenga permisos

### Error: "Unknown database 'swgarm'"
**Solución:** 
- Asegúrate de haber creado la base de datos
- Verifica que `DB_NAME` en `.env` sea `swgarm`

### Error: "Table 'swgarm.usuario' doesn't exist"
**Solución:** 
- Ejecuta `estructura.sql` completamente
- Verifica que todos los scripts de actualización se ejecutaron en orden

### Puerto 3001 ya está en uso
**Solución:** 
- Cambia el puerto en `.env` a otro número (ej: 3002)
- O cierra la aplicación que está usando el puerto 3001

### Error: "Token inválido" al hacer login
**Solución:**
- Verifica que `JWT_SECRET` está configurado en `.env`
- Limpia el localStorage del navegador (F12 → Application → Local Storage → Clear)

### La página carga pero no aparecen datos
**Solución:**
- Verifica que la base de datos tenga datos
- Revisa la consola del navegador (F12) para ver errores
- Verifica que el servidor esté corriendo en el puerto correcto

### Headers duplicados en la página
**Solución:**
- Limpia la caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)
- Verifica que todos los archivos HTML usen `header.js`

---

## 📂 Estructura del Proyecto

```
Prototipo_SWGARM/
├── backend/
│   ├── config/
│   │   └── db.js              # Configuración de base de datos
│   ├── controllers/           # Controladores de la API
│   │   ├── adopcionController.js
│   │   ├── animalController.js
│   │   ├── campanaController.js
│   │   ├── estadoAnimalController.js
│   │   ├── notificacionController.js
│   │   ├── reportesController.js
│   │   ├── saludController.js
│   │   ├── seguimientoController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   └── autMiddleware.js   # Middleware de autenticación
│   ├── models/                # Modelos de base de datos
│   │   ├── adopcion.js
│   │   ├── animal.js
│   │   ├── campana.js
│   │   ├── estadoAnimal.js
│   │   ├── notificacion.js
│   │   ├── preferenciasNotificacion.js
│   │   ├── salud.js
│   │   ├── seguimiento.js
│   │   └── User.js
│   ├── routes/                # Rutas de la API
│   │   ├── adopcionRoutes.js
│   │   ├── animalRoutes.js
│   │   ├── campanaRoutes.js
│   │   ├── estadoAnimalRoutes.js
│   │   ├── notificacionRoutes.js
│   │   ├── reportesRoutes.js
│   │   ├── saludRoutes.js
│   │   ├── seguimientoRoutes.js
│   │   └── userRoutes.js
│   └── app.js                 # Configuración de Express
├── frontend/
│   ├── css/                   # Estilos CSS
│   │   ├── admin_solicitudes.css
│   │   └── styles.css
│   ├── images/                # Imágenes del proyecto
│   ├── js/                    # JavaScript del frontend
│   │   ├── api.js             # Cliente API
│   │   ├── auth.js            # Gestión de sesión
│   │   ├── header.js          # Header dinámico
│   │   ├── login.js
│   │   ├── register.js
│   │   └── [otros archivos JS]
│   └── *.html                 # Páginas HTML
├── .env                       # Variables de entorno (crear desde ENV.example)
├── ENV.example               # Ejemplo de variables de entorno
├── package.json              # Dependencias del proyecto
├── server.js                 # Archivo principal del servidor
└── *.sql                     # Scripts de base de datos
```

---

## 📝 Notas Adicionales

### Datos de Prueba

Puedes crear usuarios de prueba desde la interfaz de registro. Para crear un administrador manualmente:

```sql
INSERT INTO usuario (email, password, rol) 
VALUES ('admin@corazondetrapo.com', 'password_hash_aqui', 'administrador');
```

**Nota:** El password debe estar hasheado con bcrypt. Es mejor crear un usuario desde la interfaz y luego cambiar el rol en la base de datos.

### Cambiar Rol de Usuario

Para cambiar un usuario a administrador:
```sql
UPDATE usuario SET rol = 'administrador' WHERE email = 'tu_email@ejemplo.com';
```

### Crear Datos de Prueba

Puedes crear animales de prueba desde la interfaz de administración una vez que inicies sesión como administrador.

---

## 🔐 Seguridad en Producción

Cuando despliegues en producción, asegúrate de:

1. ✅ Cambiar `JWT_SECRET` por una clave segura y aleatoria
2. ✅ Usar contraseñas seguras para MySQL
3. ✅ Habilitar HTTPS
4. ✅ Configurar CORS correctamente
5. ✅ Validar todas las entradas del usuario
6. ✅ Implementar rate limiting
7. ✅ Usar variables de entorno para todas las configuraciones sensibles

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa la consola del navegador (F12) para ver errores
2. Revisa la consola del servidor para ver errores de backend
3. Verifica que todos los pasos de instalación se completaron
4. Verifica que la base de datos tiene todas las tablas y estructura correcta

---

## ✨ Funcionalidades Implementadas

El sistema incluye las siguientes funcionalidades:

- ✅ Autenticación de usuarios (login/registro)
- ✅ Gestión de animales (CRUD completo)
- ✅ Gestión de solicitudes de adopción
- ✅ Sistema de evaluación de solicitudes
- ✅ Formalización de adopciones
- ✅ Seguimiento de adopciones
- ✅ Reportes y estadísticas
- ✅ Notificaciones para usuarios
- ✅ Gestión de campañas
- ✅ Gestión de roles de usuario
- ✅ Perfil de adoptante
- ✅ Búsqueda y filtrado de animales

---

**¡Listo para usar! 🎉**

Si sigues estos pasos, deberías tener el sistema funcionando completamente en tu localhost.

