# HU-015: Registro de Campañas

## 📋 Descripción
Como administrador quiero registrar campañas de concientización para difundir actividades y eventos de la asociación.

## ✅ Criterios de Aceptación Implementados

### 1. Validación de formulario incompleto
- ✅ Implementado: Validación completa en frontend y backend.
- ✅ Campo obligatorio: Título (mínimo 3 caracteres, máximo 45).
- ✅ Mensajes específicos: Se muestran errores claros por campo.
- ✅ Validación en tiempo real: Errores se muestran al intentar guardar.
- ✅ Campos opcionales: Descripción (máx 500), Responsable (máx 45), Fecha.

### 2. Visualización de campaña registrada
- ✅ Implementado: Visualización completa de información cargada.
- ✅ Detalle completo: Título, descripción, responsable, fecha evento, fecha creación.
- ✅ Modal de edición: Permite ver y editar toda la información.
- ✅ Tabla completa: Muestra todos los datos en formato tabular.

### 3. Listado ordenado por fecha de creación
- ✅ Implementado: Lista ordenada por fecha de creación descendente (más recientes primero).
- ✅ Consulta SQL: `ORDER BY fechaCreacion DESC`.
- ✅ Visualización clara: Fechas formateadas en formato local.

## 🛠️ Funcionalidades Implementadas

### Backend
- ✅ Modelo (`backend/models/campana.js`)
  - `getAll()`: Lista todas las campañas ordenadas por fechaCreacion DESC.
  - `getById()`: Obtiene campaña específica.
  - `create()`: Crea nueva campaña con idUsuario del admin autenticado.
  - `update()`: Actualiza campaña existente.
  - `delete()`: Elimina campaña.

- ✅ Controlador (`backend/controllers/campanaController.js`)
  - `listarCampanas()`: Lista todas ordenadas por fecha de creación.
  - `obtenerCampana()`: Obtiene campaña por ID.
  - `crearCampana()`: Valida y crea nueva campaña.
  - `actualizarCampana()`: Valida y actualiza campaña existente.
  - `eliminarCampana()`: Elimina campaña.
  - Validaciones completas: Título obligatorio (3-45 caracteres), descripción (máx 500), etc.

- ✅ Rutas protegidas (`backend/routes/campanaRoutes.js`)
  - `GET /api/campanas` - Listar campañas (solo admin).
  - `GET /api/campanas/:id` - Obtener campaña (solo admin).
  - `POST /api/campanas` - Crear campaña (solo admin).
  - `PUT /api/campanas/:id` - Actualizar campaña (solo admin).
  - `DELETE /api/campanas/:id` - Eliminar campaña (solo admin).

- ✅ Base de datos (`update_campana_table.sql`)
  - Campo `fechaCreacion` agregado a tabla `campaña`.
  - Campo `descripcion` extendido a VARCHAR(500).

### Frontend
- ✅ Interfaz de administración (`frontend/admin_campanas.html`)
  - Formulario completo para registrar campaña.
  - Campos: Título (obligatorio), Descripción, Responsable, Fecha.
  - Contador de caracteres para descripción.
  - Tabla completa de campañas.
  - Modal para editar campañas.

- ✅ JavaScript (`frontend/js/admin_campanas.js`)
  - Validación completa en frontend antes de enviar.
  - Validación de campo obligatorio (título).
  - Validación de longitudes máximas.
  - Contador de caracteres en tiempo real.
  - Carga de campañas ordenadas por fecha.
  - Funciones de crear, editar, ver y eliminar.
  - Mensajes de éxito y error.

- ✅ API cliente (`frontend/js/api.js`)
  - `getCampanas()`: Listar todas las campañas.
  - `getCampana(id)`: Obtener campaña específica.
  - `crearCampana(datos)`: Crear nueva campaña.
  - `actualizarCampana(id, datos)`: Actualizar campaña.
  - `eliminarCampana(id)`: Eliminar campaña.

- ✅ Navegación (`frontend/js/header.js`)
  - Enlace "Gestión Campañas" agregado al menú de administración.

## 🔒 Rutas API

### Protegidas (Solo administradores)
- `GET /api/campanas` - Listar todas las campañas ordenadas por fecha de creación.
- `GET /api/campanas/:id` - Obtener campaña específica.
- `POST /api/campanas` - Crear nueva campaña.
  - Body: `{ titulo, descripcion?, responsable?, fecha? }`
- `PUT /api/campanas/:id` - Actualizar campaña existente.
- `DELETE /api/campanas/:id` - Eliminar campaña.

## 🧪 Casos de Prueba

### ✅ Casos Exitosos
1. Crear campaña con todos los campos → Campaña registrada exitosamente.
2. Crear campaña solo con título → Campaña creada (campos opcionales en null).
3. Consultar campaña → Muestra toda la información cargada.
4. Listar campañas → Ordenadas por fecha de creación (más recientes primero).
5. Editar campaña → Actualización exitosa.
6. Eliminar campaña → Eliminación confirmada.

### ❌ Casos de Error
1. Título vacío → Error: "El título es obligatorio".
2. Título muy corto (< 3 caracteres) → Error: "El título debe tener al menos 3 caracteres".
3. Título muy largo (> 45 caracteres) → Error: "El título no puede exceder 45 caracteres".
4. Descripción muy larga (> 500 caracteres) → Error: "La descripción no puede exceder 500 caracteres".
5. Responsable muy largo (> 45 caracteres) → Error: "El responsable no puede exceder 45 caracteres".
6. Formato de fecha inválido → Error: "Formato de fecha inválido".
7. Campaña no encontrada → Error 404: "Campaña no encontrada".

## 📊 Estructura de Datos

### Tabla `campaña` (Actualizada)
```sql
CREATE TABLE `campaña` (
  `idCampaña` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `fechaCreacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `titulo` varchar(45) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `responsable` varchar(45) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  PRIMARY KEY (`idCampaña`),
  FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
);
```

### Campos del Formulario
- **Obligatorios:** titulo (3-45 caracteres)
- **Opcionales:** 
  - descripcion (máx 500 caracteres)
  - responsable (máx 45 caracteres)
  - fecha (formato date)

## 🎨 Interfaz de Usuario

### Formulario de Registro
- **Campo título:** Obligatorio, máx 45 caracteres.
- **Campo descripción:** Opcional, máx 500 caracteres, con contador.
- **Campo responsable:** Opcional, máx 45 caracteres.
- **Campo fecha:** Opcional, selector de fecha.
- **Validación visual:** Mensajes de error específicos bajo cada campo.
- **Botones:** Registrar Campaña / Limpiar Formulario.

### Tabla de Campañas
- **Columnas:**
  - ID
  - Título
  - Descripción (truncada si es muy larga)
  - Responsable
  - Fecha Evento
  - Fecha Creación
  - Acciones (Ver, Editar, Eliminar)

- **Ordenamiento:** Por fecha de creación descendente (más recientes primero).

### Modal de Edición
- **Campos editables:** Todos los campos del formulario.
- **Validación:** Mismas validaciones que formulario de creación.
- **Botones:** Guardar Cambios / Cancelar.

## 📁 Archivos Creados/Modificados

### Nuevos Archivos
- `update_campana_table.sql` - Script para agregar fechaCreacion y extender descripción.
- `backend/models/campana.js` - Modelo de campañas.
- `backend/controllers/campanaController.js` - Controlador de campañas.
- `backend/routes/campanaRoutes.js` - Rutas de campañas.
- `frontend/admin_campanas.html` - Interfaz de gestión de campañas.
- `frontend/js/admin_campanas.js` - Lógica de gestión de campañas.

### Archivos Modificados
- `backend/app.js` - Agregadas rutas de campañas.
- `frontend/js/api.js` - Métodos de API para campañas.
- `frontend/js/header.js` - Enlace "Gestión Campañas" agregado.

## 🚀 Instrucciones de Uso

### Para Administradores
1. Acceder como administrador al sistema.
2. Navegar a "Gestión Campañas" en el menú.
3. Completar formulario:
   - Título (obligatorio, mínimo 3 caracteres).
   - Descripción (opcional, máximo 500 caracteres).
   - Responsable (opcional).
   - Fecha del evento (opcional).
4. Hacer clic en "Registrar Campaña".
5. Ver mensaje de confirmación y campaña agregada a la lista.
6. Usar acciones de la tabla para ver, editar o eliminar campañas.

### Comportamiento del Sistema
- **Validación:** El sistema valida antes de guardar.
- **Ordenamiento:** Las campañas se muestran ordenadas por fecha de creación (más recientes primero).
- **Usuario automático:** El idUsuario se asigna automáticamente según el admin autenticado.
- **Fecha de creación:** Se asigna automáticamente al crear la campaña.

## 🔐 Seguridad Implementada

- ✅ Solo administradores pueden acceder a esta funcionalidad.
- ✅ Validación completa en frontend y backend.
- ✅ El idUsuario se asigna automáticamente según el token JWT.
- ✅ Validación de longitudes máximas en todos los campos.

## 🔄 Integración con Otras HU
- **HU-010:** Requiere autenticación como administrador.
- **HU-011:** Requiere rol de administrador para acceder.
- **HU-006/HU-007/HU-008:** Misma estructura de administración.

## 💡 Notas Técnicas

- **Fecha de creación:** Campo agregado automáticamente con valor por defecto CURRENT_TIMESTAMP.
- **Descripción extendida:** Campo extendido de VARCHAR(45) a VARCHAR(500) para permitir descripciones más largas.
- **Ordenamiento:** Las campañas se ordenan por fechaCreacion DESC (más recientes primero) tanto en backend como en frontend.
- **Validación doble:** Validación en frontend para mejor UX y en backend para seguridad.

---

**Estado:** ✅ COMPLETADO  
**Fecha:** 2025-10-29  
**Desarrollador:** Asistente AI  
**Revisión:** Pendiente

