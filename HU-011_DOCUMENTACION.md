# HU-011: Gestión de Roles

## 📋 Descripción
Como administrador quiero asignar roles a los usuarios para controlar los permisos y accesos al sistema.

## ✅ Criterios de Aceptación Implementados

### 1. Actualización de permisos al asignar rol
- ✅ Implementado: Al cambiar el rol de un usuario, el sistema actualiza inmediatamente los permisos.
- ✅ Validación: El rol se actualiza en la base de datos y se refleja en el siguiente login.
- ✅ Protección: Los administradores no pueden cambiar su propio rol de administrador.

### 2. Validación de rol inexistente
- ✅ Implementado: Validación estricta de roles válidos (`administrador`, `adoptante`).
- ✅ Error claro: Mensaje de error específico indicando roles válidos cuando se intenta asignar un rol inválido.
- ✅ Validación en backend: El modelo valida antes de actualizar.

### 3. Listado de usuarios con rol actual
- ✅ Implementado: Endpoint que retorna todos los usuarios con su rol actual.
- ✅ Interfaz: Tabla completa mostrando ID, Email y Rol de cada usuario.
- ✅ Visualización: Badges de colores para identificar fácilmente los roles.

## 🛠️ Funcionalidades Implementadas

### Backend
- ✅ Modelo actualizado (`backend/models/User.js`)
  - `getAll()`: Lista todos los usuarios con su rol.
  - `updateRol()`: Actualiza el rol con validación de roles válidos.

- ✅ Controlador actualizado (`backend/controllers/userController.js`)
  - `listarUsuarios()`: Retorna lista completa de usuarios.
  - `actualizarRol()`: Valida usuario existente, previene auto-cambio de rol de admin, actualiza rol.

- ✅ Rutas protegidas (`backend/routes/userRoutes.js`)
  - `GET /api/usuarios/usuarios` - Listar usuarios (solo admin).
  - `PUT /api/usuarios/usuarios/:id/rol` - Actualizar rol (solo admin).

### Frontend
- ✅ Interfaz de administración (`frontend/admin_usuarios.html`)
  - Tabla completa de usuarios con ID, Email y Rol.
  - Botón para cambiar rol de cada usuario.
  - Modal para seleccionar nuevo rol.

- ✅ JavaScript (`frontend/js/admin_usuarios.js`)
  - Carga dinámica de usuarios.
  - Apertura de modal con información del usuario.
  - Actualización de rol con validación.
  - Recarga automática de lista después de actualizar.

- ✅ API cliente (`frontend/js/api.js`)
  - `getUsuarios()`: Obtener lista de usuarios.
  - `actualizarRol(idUsuario, nuevoRol)`: Actualizar rol.

- ✅ Navegación (`frontend/js/header.js`)
  - Enlace "Gestión Usuarios" agregado al menú de administración.

## 🔒 Rutas API

### Protegidas (Solo administradores)
- `GET /api/usuarios/usuarios` - Listar todos los usuarios con sus roles.
- `PUT /api/usuarios/usuarios/:id/rol` - Actualizar rol de un usuario.
  - Body: `{ rol: "administrador" | "adoptante" }`

## 🧪 Casos de Prueba

### ✅ Casos Exitosos
1. Listar usuarios → Lista completa con roles mostrados.
2. Cambiar rol de adoptante a administrador → Rol actualizado correctamente.
3. Cambiar rol de administrador a adoptante → Rol actualizado correctamente.
4. Verificar permisos → El usuario obtiene los permisos del nuevo rol al hacer login.

### ❌ Casos de Error
1. Rol inválido → Error: "Rol inválido. Roles válidos: administrador, adoptante".
2. Usuario no encontrado → Error: "Usuario no encontrado".
3. Administrador cambiando su propio rol → Error: "No puede cambiar su propio rol de administrador".
4. Sin permisos → Error 403: "Acceso denegado - Solo administradores".

## 📊 Estructura de Datos

### Tabla `usuario` (existente)
- `idUsuario` - ID único del usuario
- `email` - Email del usuario
- `rol` - Rol actual (`administrador` o `adoptante`)
- `password` - Contraseña hasheada
- Otros campos de bloqueo (HU-010)

### Roles Disponibles
- **administrador**: Acceso completo al sistema (gestión de animales, solicitudes, reportes, usuarios).
- **adoptante**: Acceso público (ver animales, postular adopciones).

## 🎨 Interfaz de Usuario

### Página de Gestión de Usuarios
- **Tabla de usuarios:**
  - Columna ID (identificador único).
  - Columna Email (correo del usuario).
  - Columna Rol (badge con color según rol).
  - Columna Acciones (botón "Cambiar Rol").

- **Modal de cambio de rol:**
  - Información del usuario actual.
  - Selector de nuevo rol (Administrador/Adoptante).
  - Botones: Actualizar Rol / Cancelar.

- **Badges visuales:**
  - Administrador: Badge rojo.
  - Adoptante: Badge azul.

## 📁 Archivos Creados/Modificados

### Nuevos Archivos
- `frontend/admin_usuarios.html` - Interfaz de gestión de usuarios.
- `frontend/js/admin_usuarios.js` - Lógica de gestión de roles.

### Archivos Modificados
- `backend/models/User.js` - Métodos `getAll()` y `updateRol()`.
- `backend/controllers/userController.js` - Métodos `listarUsuarios()` y `actualizarRol()`.
- `backend/routes/userRoutes.js` - Rutas protegidas para gestión de usuarios.
- `frontend/js/api.js` - Métodos `getUsuarios()` y `actualizarRol()`.
- `frontend/js/header.js` - Enlace "Gestión Usuarios" agregado.

## 🚀 Instrucciones de Uso

### Para Administradores
1. Acceder como administrador al sistema.
2. Navegar a "Gestión Usuarios" en el menú.
3. Ver lista completa de usuarios con sus roles actuales.
4. Hacer clic en "Cambiar Rol" en el usuario deseado.
5. Seleccionar nuevo rol del dropdown.
6. Confirmar cambio.
7. El usuario obtendrá los nuevos permisos en su próximo login.

## 🔐 Seguridad Implementada

- ✅ Solo administradores pueden acceder a esta funcionalidad.
- ✅ Validación de roles válidos en backend.
- ✅ Protección contra auto-cambio de rol de administrador.
- ✅ Validación de existencia de usuario antes de actualizar.

## 🔄 Integración con Otras HU
- **HU-010:** Los usuarios autenticados tienen roles asignados.
- **HU-005/HU-006/HU-007/HU-008:** Requieren rol de administrador para acceder.
- **HU-004:** Los adoptantes pueden postularse sin autenticación.
- **HU-009:** Los usuarios públicos pueden ver animales disponibles.

## 🎯 Permisos por Rol

### Administrador
- Acceso a todas las páginas de administración.
- Gestión de animales, salud, estados.
- Evaluación de solicitudes.
- Formalización de adopciones.
- Seguimiento de adopciones.
- Reportes.
- Gestión de usuarios y roles.

### Adoptante
- Ver animales disponibles.
- Postular adopciones.
- Acceso a páginas públicas.

---

**Estado:** ✅ COMPLETADO  
**Fecha:** 2025-10-29  
**Desarrollador:** Asistente AI  
**Revisión:** Pendiente

