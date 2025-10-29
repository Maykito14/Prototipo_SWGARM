# HU-013: Notificaciones

## 📋 Descripción
Como adoptante quiero recibir notificaciones del estado de mi proceso de adopción para estar informado.

## ✅ Criterios de Aceptación Implementados

### 1. Notificación al aprobar o rechazar solicitud
- ✅ Implementado: Sistema completo de notificaciones cuando se cambia el estado de una solicitud a "Aprobada" o "Rechazada".
- ✅ Mensajes personalizados: Mensajes específicos según el tipo de notificación.
- ✅ Integración: Automática en el proceso de actualización de solicitudes.
- ✅ Respeto de preferencias: Se respetan las preferencias del usuario.

### 2. Recordatorio de seguimiento programado
- ✅ Implementado: Sistema de recordatorios que revisa cada 5 minutos seguimientos próximos.
- ✅ Notificación dual: Se notifica tanto a administradores como a adoptantes.
- ✅ Mensajes informativos: Incluyen nombre del animal y fecha programada.
- ✅ Respeto de preferencias: Solo se notifica si el usuario tiene habilitado este tipo de notificación.

### 3. Configuración de preferencias de notificación
- ✅ Implementado: Sistema completo de preferencias por usuario.
- ✅ Interfaz de configuración: Formulario para gestionar preferencias.
- ✅ Valores por defecto: Todos habilitados si no se configuran preferencias.
- ✅ Persistencia: Las preferencias se guardan y se respetan en todas las notificaciones.

## 🛠️ Funcionalidades Implementadas

### Backend
- ✅ Modelo Notificacion (`backend/models/notificacion.js`)
  - `create()`: Crear nueva notificación.
  - `getByUsuario()`: Obtener todas las notificaciones de un usuario.
  - `getNoLeidasByUsuario()`: Obtener solo notificaciones no leídas.
  - `marcarComoLeida()`: Marcar notificación como leída.
  - `marcarTodasComoLeidas()`: Marcar todas como leídas.
  - `contarNoLeidas()`: Contar notificaciones no leídas.
  - `delete()`: Eliminar notificación.

- ✅ Modelo PreferenciasNotificacion (`backend/models/preferenciasNotificacion.js`)
  - `getByUsuario()`: Obtener preferencias de un usuario.
  - `createOrUpdate()`: Crear o actualizar preferencias.

- ✅ Controlador (`backend/controllers/notificacionController.js`)
  - `getMisNotificaciones()`: Listar todas las notificaciones del usuario autenticado.
  - `getMisNotificacionesNoLeidas()`: Listar solo no leídas.
  - `contarNoLeidas()`: Contar no leídas.
  - `marcarComoLeida()`: Marcar una como leída.
  - `marcarTodasComoLeidas()`: Marcar todas como leídas.
  - `eliminarNotificacion()`: Eliminar una notificación.
  - `getMisPreferencias()`: Obtener preferencias del usuario.
  - `actualizarMisPreferencias()`: Actualizar preferencias.

- ✅ Integración en `adopcionController.js`
  - Función `enviarNotificacionAdoptante()`: Helper para enviar notificaciones.
  - Integración en `actualizarSolicitud()`: Envía notificaciones cuando se aprueba o rechaza.

- ✅ Actualización de `server.js`
  - Recordatorios de seguimiento ahora notifican también a adoptantes.
  - Respeto de preferencias de notificación.
  - Consulta optimizada con JOINs.

- ✅ Base de datos (`update_notificacion_table.sql`)
  - Campos agregados a `notificacion`: `leido`, `fechaLeido`, `idSolicitud`, `idSeguimiento`.
  - Campo `mensaje` extendido a VARCHAR(500).
  - Nueva tabla `preferencias_notificacion` con todas las preferencias.

### Frontend
- ✅ Interfaz de notificaciones (`frontend/notificaciones.html`)
  - Lista completa de notificaciones con estado de leído/no leído.
  - Badge "Nueva" para notificaciones no leídas.
  - Botones para marcar como leída y eliminar.
  - Botón "Marcar todas como leídas".
  - Sección de preferencias de notificación.

- ✅ JavaScript (`frontend/js/notificaciones.js`)
  - Carga automática de notificaciones y preferencias.
  - Gestión de preferencias con formulario.
  - Funciones para marcar como leída y eliminar.
  - Visualización diferenciada de leídas/no leídas.

- ✅ Navegación (`frontend/js/header.js` y `frontend/js/auth.js`)
  - Enlace "Notificaciones" agregado al header.
  - Badge con contador de notificaciones no leídas.
  - Actualización automática del contador cada 30 segundos.
  - Gestión de intervalo para evitar múltiples ejecuciones.

- ✅ API cliente (`frontend/js/api.js`)
  - Métodos completos para gestión de notificaciones.
  - Métodos para preferencias de notificación.

## 🔒 Rutas API

### Protegidas (Usuarios autenticados)
- `GET /api/notificaciones` - Listar todas las notificaciones del usuario.
- `GET /api/notificaciones/no-leidas` - Listar solo no leídas.
- `GET /api/notificaciones/contar` - Contar no leídas.
- `PUT /api/notificaciones/:id/leida` - Marcar como leída.
- `PUT /api/notificaciones/marcar-todas-leidas` - Marcar todas como leídas.
- `DELETE /api/notificaciones/:id` - Eliminar notificación.
- `GET /api/notificaciones/preferencias` - Obtener preferencias.
- `PUT /api/notificaciones/preferencias` - Actualizar preferencias.

## 🧪 Casos de Prueba

### ✅ Casos Exitosos
1. Aprobar solicitud → Notificación enviada al adoptante.
2. Rechazar solicitud → Notificación enviada con motivo (si existe).
3. Seguimiento programado → Recordatorio enviado a adoptante y administradores.
4. Preferencias deshabilitadas → No se envía notificación si está deshabilitada.
5. Contador de notificaciones → Se actualiza automáticamente.

### ❌ Casos de Error
1. Usuario sin preferencias → Usa valores por defecto (todos habilitados).
2. Notificación de otro usuario → Error 403 al intentar marcar/eliminar.
3. Sin autenticación → Redirección a login.

## 📊 Estructura de Datos

### Tabla `notificacion` (Actualizada)
```sql
ALTER TABLE `notificacion` 
ADD COLUMN `leido` TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN `fechaLeido` DATETIME DEFAULT NULL,
ADD COLUMN `idSolicitud` INT DEFAULT NULL,
ADD COLUMN `idSeguimiento` INT DEFAULT NULL,
MODIFY COLUMN `mensaje` VARCHAR(500) DEFAULT NULL;
```

### Tabla `preferencias_notificacion` (Nueva)
```sql
CREATE TABLE `preferencias_notificacion` (
  `idPreferencia` INT NOT NULL AUTO_INCREMENT,
  `idUsuario` INT NOT NULL,
  `notificarSolicitudAprobada` TINYINT(1) NOT NULL DEFAULT 1,
  `notificarSolicitudRechazada` TINYINT(1) NOT NULL DEFAULT 1,
  `notificarRecordatorioSeguimiento` TINYINT(1) NOT NULL DEFAULT 1,
  `notificarPorEmail` TINYINT(1) NOT NULL DEFAULT 1,
  `notificarEnSistema` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`idPreferencia`),
  UNIQUE KEY `pref_usuario_unique` (`idUsuario`),
  CONSTRAINT `pref_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
);
```

### Tipos de Notificación
- **Solicitud Aprobada**: Cuando se aprueba una solicitud de adopción.
- **Solicitud Rechazada**: Cuando se rechaza una solicitud.
- **Recordatorio Seguimiento**: Cuando se acerca la fecha de un seguimiento.
- **Seguimiento**: Para administradores sobre seguimientos pendientes.

## 🎨 Interfaz de Usuario

### Página de Notificaciones
- **Sección de preferencias:**
  - Checkboxes para cada tipo de notificación.
  - Checkbox para habilitar/deshabilitar notificaciones en sistema.
  - Botón "Guardar Preferencias".

- **Lista de notificaciones:**
  - Tarjetas con información completa.
  - Badge "Nueva" para no leídas.
  - Botón para marcar como leída (solo en no leídas).
  - Botón para eliminar.
  - Botón "Marcar todas como leídas" (solo si hay no leídas).

- **Visualización:**
  - Notificaciones no leídas: Borde amarillo, badge "Nueva".
  - Notificaciones leídas: Opacidad reducida, borde gris.

### Header
- Enlace "Notificaciones" visible solo para usuarios autenticados.
- Badge con contador de no leídas (se oculta si es 0).
- Actualización automática cada 30 segundos.

## 📁 Archivos Creados/Modificados

### Nuevos Archivos
- `update_notificacion_table.sql` - Script para actualizar tabla y crear preferencias.
- `backend/models/notificacion.js` - Modelo de notificaciones.
- `backend/models/preferenciasNotificacion.js` - Modelo de preferencias.
- `backend/controllers/notificacionController.js` - Controlador de notificaciones.
- `backend/routes/notificacionRoutes.js` - Rutas de notificaciones.
- `frontend/notificaciones.html` - Interfaz de notificaciones.
- `frontend/js/notificaciones.js` - Lógica de notificaciones.

### Archivos Modificados
- `backend/controllers/adopcionController.js` - Integración de notificaciones en actualización de solicitudes.
- `backend/app.js` - Agregadas rutas de notificaciones.
- `server.js` - Actualizado recordatorios para notificar adoptantes.
- `frontend/js/api.js` - Métodos de API para notificaciones y preferencias.
- `frontend/js/header.js` - Enlace a notificaciones con badge.
- `frontend/js/auth.js` - Lógica para mostrar enlace y actualizar contador.

## 🚀 Instrucciones de Uso

### Para Adoptantes
1. Iniciar sesión en el sistema.
2. Ver badge con contador de notificaciones en el header.
3. Hacer clic en "Notificaciones" para ver todas.
4. Configurar preferencias según necesidades.
5. Marcar notificaciones como leídas cuando se revisen.
6. Eliminar notificaciones que ya no sean necesarias.

### Comportamiento del Sistema
- **Notificaciones automáticas:** Se generan cuando:
  - Se aprueba o rechaza una solicitud.
  - Se acerca la fecha de un seguimiento programado.
- **Respeto de preferencias:** Solo se envían si están habilitadas.
- **Contador automático:** Se actualiza cada 30 segundos.
- **Valores por defecto:** Todos habilitados si no se configuran preferencias.

## 🔐 Seguridad Implementada

- ✅ Solo usuarios autenticados pueden acceder a sus notificaciones.
- ✅ Validación de propiedad: No se puede marcar/eliminar notificaciones de otros usuarios.
- ✅ Preferencias individuales por usuario.
- ✅ Integración con sistema de autenticación existente.

## 🔄 Integración con Otras HU
- **HU-004:** Las notificaciones se envían cuando se actualiza el estado de solicitudes.
- **HU-006:** Las notificaciones se envían cuando se formaliza una adopción.
- **HU-007:** Los recordatorios de seguimiento notifican a adoptantes.
- **HU-010:** Requiere autenticación para recibir notificaciones.
- **HU-012:** El perfil del adoptante se usa para identificar al usuario.

## 💡 Notas Técnicas

- **Recordatorios automáticos:** El servidor revisa cada 5 minutos seguimientos próximos.
- **Preferencias por defecto:** Si un usuario no tiene preferencias configuradas, se usan valores por defecto (todos habilitados).
- **Relación adoptante-usuario:** Se hace mediante el email del adoptante.
- **Contador en tiempo real:** Se actualiza automáticamente cada 30 segundos sin recargar la página.

---

**Estado:** ✅ COMPLETADO  
**Fecha:** 2025-10-29  
**Desarrollador:** Asistente AI  
**Revisión:** Pendiente

