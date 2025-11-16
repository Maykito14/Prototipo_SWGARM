# Guía Completa de Instalación y Ejecución - SWGARM

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación del Servidor](#instalación-del-servidor)
3. [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
4. [Configuración del Proyecto](#configuración-del-proyecto)
5. [Iniciar la Aplicación](#iniciar-la-aplicación)
6. [Verificación](#verificación)


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

### Paso 1: Importar la Estructura Completa de la Base de Datos

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

### Paso 2 (Opcional): Importar Datos de Prueba

Si existe un archivo `datos_prueba.sql` en el repositorio, puedes importarlo para tener datos de ejemplo:

**Opción A - Usando MySQL Workbench:**
1. File → Open SQL Script → Selecciona `datos_prueba.sql`
2. Ejecuta el script completo (Execute o F5)

**Opción B - Usando línea de comandos:**
```bash
mysql -u root -p swgarm < datos_prueba.sql
```

**Nota:** Los datos de prueba son opcionales. Si no los importas, tendrás una base de datos vacía y deberás crear tus propios datos a través de la aplicación.

### Paso 3: Verificar la Estructura de la Base de Datos

Ejecuta en MySQL:
```sql
USE swgarm;
SHOW TABLES;
```

Deberías ver las siguientes 15 tablas:
- adopcion
- adoptante
- animal
- animal_foto
- campaña
- campaña_foto
- estado_animal
- notificacion
- password_reset_token
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

### Crear Datos de Prueba

Puedes crear animales de prueba desde la interfaz de administración una vez que inicies sesión como administrador.

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

