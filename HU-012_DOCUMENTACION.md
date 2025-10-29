# HU-012: Perfil de Adoptante

## 📋 Descripción
Como adoptante quiero visualizar y editar mi perfil para mantener actualizada mi información personal.

## ✅ Criterios de Aceptación Implementados

### 1. Validación de campos obligatorios vacíos
- ✅ Implementado: Validación completa en frontend y backend.
- ✅ Campos obligatorios: Nombre y Apellido (marcados con *).
- ✅ Mensajes de error: Se muestran mensajes específicos por campo cuando falta información.
- ✅ Validación en tiempo real: Los errores se muestran al intentar guardar.

### 2. Confirmación al guardar cambios
- ✅ Implementado: Mensaje de éxito al actualizar el perfil.
- ✅ Actualización inmediata: El formulario se recarga automáticamente con los datos actualizados.
- ✅ Persistencia: Los cambios se guardan en la base de datos.

### 3. Visualización de información vigente
- ✅ Implementado: Carga automática del perfil al acceder a la página.
- ✅ Datos actualizados: Siempre muestra la información más reciente desde la base de datos.
- ✅ Creación automática: Si el adoptante no existe, se crea uno nuevo vinculado al email del usuario.

## 🛠️ Funcionalidades Implementadas

### Backend
- ✅ Modelo actualizado (`backend/models/adopcion.js`)
  - Métodos existentes `getByEmail()`, `create()`, `update()` utilizados.
  - Relación con usuario mediante email.

- ✅ Controlador actualizado (`backend/controllers/adopcionController.js`)
  - `obtenerMiPerfil()`: Obtiene o crea el perfil del adoptante autenticado.
  - `actualizarMiPerfil()`: Valida y actualiza el perfil del adoptante autenticado.
  - Validación de campos obligatorios (nombre, apellido).
  - Validación de formato de teléfono (opcional pero validado si se proporciona).

- ✅ Rutas protegidas (`backend/routes/adopcionRoutes.js`)
  - `GET /api/adopcion/mi-perfil` - Obtener perfil del adoptante autenticado.
  - `PUT /api/adopcion/mi-perfil` - Actualizar perfil del adoptante autenticado.

### Frontend
- ✅ Interfaz de perfil (`frontend/perfil.html`)
  - Formulario completo con todos los campos del perfil.
  - Campos obligatorios marcados con *.
  - Email de solo lectura (no modificable).
  - Mensajes de éxito y error visibles.

- ✅ JavaScript (`frontend/js/perfil.js`)
  - Carga automática del perfil al iniciar.
  - Validación de campos obligatorios.
  - Validación de formato de teléfono.
  - Manejo de valores "Pendiente" al crear perfil inicial.
  - Mensajes de confirmación al guardar.

- ✅ API cliente (`frontend/js/api.js`)
  - `obtenerMiPerfil()`: Obtener perfil del adoptante autenticado.
  - `actualizarMiPerfil(datos)`: Actualizar perfil del adoptante.

- ✅ Navegación (`frontend/js/header.js` y `frontend/js/auth.js`)
  - Enlace "Mi Perfil" agregado al header (visible solo para usuarios autenticados).
  - Funcionalidad de mostrar/ocultar según estado de autenticación.

## 🔒 Rutas API

### Protegidas (Usuarios autenticados)
- `GET /api/adopcion/mi-perfil` - Obtener perfil del adoptante autenticado.
- `PUT /api/adopcion/mi-perfil` - Actualizar perfil del adoptante autenticado.
  - Body: `{ nombre, apellido, telefono?, direccion?, ocupacion? }`

## 🧪 Casos de Prueba

### ✅ Casos Exitosos
1. Cargar perfil existente → Datos mostrados correctamente.
2. Crear perfil nuevo → Se crea automáticamente con email del usuario.
3. Actualizar todos los campos → Cambios guardados y confirmados.
4. Actualizar solo campos obligatorios → Guardado exitoso.
5. Actualizar solo campos opcionales → Guardado exitoso.

### ❌ Casos de Error
1. Nombre vacío → Error: "Este campo es obligatorio".
2. Apellido vacío → Error: "Este campo es obligatorio".
3. Teléfono con formato inválido → Error: "Formato de teléfono inválido".
4. Sin autenticación → Redirección a login.
5. Usuario no encontrado → Error: "Usuario no encontrado".

## 📊 Estructura de Datos

### Tabla `adoptante` (existente)
```sql
CREATE TABLE `adoptante` (
  `idAdoptante` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `apellido` varchar(45) NOT NULL,
  `email` varchar(45) DEFAULT NULL,
  `telefono` varchar(45) DEFAULT NULL,
  `direccion` varchar(45) DEFAULT NULL,
  `ocupacion` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idAdoptante`)
);
```

### Relación con Usuario
- **Relación:** El adoptante se relaciona con el usuario mediante el campo `email`.
- **Creación automática:** Si el adoptante no existe para un usuario, se crea uno nuevo con valores por defecto ("Pendiente" para nombre/apellido).

### Campos del Formulario
- **Obligatorios:** nombre, apellido
- **Opcionales:** telefono, direccion, ocupacion
- **Solo lectura:** email (vinculado al usuario autenticado)

## 🎨 Interfaz de Usuario

### Página de Perfil
- **Formulario estructurado:**
  - Primera fila: Nombre (*) y Apellido (*)
  - Segunda fila: Email (readonly) y Teléfono
  - Tercera fila: Dirección y Ocupación

- **Mensajes de estado:**
  - Mensaje de éxito (verde): Aparece al guardar exitosamente.
  - Mensaje de error (rojo): Aparece cuando hay errores de validación.
  - Errores por campo: Mensajes específicos debajo de cada campo.

- **Botones:**
  - "Guardar Cambios": Valida y guarda el perfil.
  - "Restablecer": Limpia el formulario y recarga los datos originales.

### Navegación
- Enlace "Mi Perfil" visible en el header solo para usuarios autenticados.
- Reemplaza el botón "Iniciar sesión" cuando el usuario está autenticado.

## 📁 Archivos Creados/Modificados

### Nuevos Archivos
- `frontend/perfil.html` - Interfaz del perfil de adoptante.
- `frontend/js/perfil.js` - Lógica de gestión del perfil.

### Archivos Modificados
- `backend/controllers/adopcionController.js` - Métodos `obtenerMiPerfil()` y `actualizarMiPerfil()`.
- `backend/routes/adopcionRoutes.js` - Rutas protegidas para perfil.
- `frontend/js/api.js` - Métodos `obtenerMiPerfil()` y `actualizarMiPerfil()`.
- `frontend/js/header.js` - Enlace "Mi Perfil" agregado.
- `frontend/js/auth.js` - Lógica para mostrar/ocultar enlace de perfil.

## 🚀 Instrucciones de Uso

### Para Adoptantes
1. Iniciar sesión en el sistema.
2. Hacer clic en "Mi Perfil" en el header.
3. Completar los campos obligatorios (Nombre y Apellido).
4. Opcionalmente completar Teléfono, Dirección y Ocupación.
5. Hacer clic en "Guardar Cambios".
6. Ver mensaje de confirmación y datos actualizados.

### Comportamiento del Sistema
- **Primera visita:** Si el adoptante no existe, se crea automáticamente con el email del usuario.
- **Perfil incompleto:** Se puede guardar incluso con solo nombre y apellido completados.
- **Validación:** El sistema valida formato de teléfono si se proporciona.
- **Email:** No se puede modificar (siempre coincide con el email del usuario autenticado).

## 🔐 Seguridad Implementada

- ✅ Solo usuarios autenticados pueden acceder al perfil.
- ✅ El email siempre coincide con el usuario autenticado (no modificable).
- ✅ Validación de campos en frontend y backend.
- ✅ El adoptante se relaciona automáticamente con el usuario mediante email.

## 🔄 Integración con Otras HU
- **HU-010:** Requiere autenticación para acceder al perfil.
- **HU-004:** El perfil puede ser usado al crear solicitudes de adopción.
- **HU-006/HU-007:** Los datos del perfil se utilizan en las adopciones formalizadas y seguimientos.

## 💡 Notas Técnicas

- **Valores por defecto:** Cuando se crea un perfil nuevo, se usa "Pendiente" para nombre/apellido (ya que son NOT NULL en la BD).
- **Frontend:** El formulario muestra campos vacíos cuando los valores son "Pendiente".
- **Relación:** La relación usuario-adoptante se establece mediante el campo `email`.

---

**Estado:** ✅ COMPLETADO  
**Fecha:** 2025-10-29  
**Desarrollador:** Asistente AI  
**Revisión:** Pendiente

