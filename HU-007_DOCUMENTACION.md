# HU-007: Seguimiento de Adopción

## 📋 Descripción
Como administrador quiero realizar el seguimiento de las adopciones para garantizar el bienestar del animal en su nuevo hogar.

## ✅ Criterios de Aceptación Implementados

### 1. Registro de observaciones en controles
- ✅ Implementado: Completar un seguimiento permite registrar `observaciones` y `fechaRealizada`.
- ✅ Validación: Solo se programa seguimiento para animales en estado "Adoptado".

### 2. Recordatorio al administrador en fecha programada
- ✅ Implementado: Proceso en `server.js` revisa cada 5 minutos seguimientos vencidos y genera notificaciones en tabla `notificacion` para todos los administradores.
- ✅ Idempotencia: Marca `recordatorioEnviado=1` para no duplicar avisos.

### 3. Historial ordenado por fechas
- ✅ Implementado: Listados ordenan por `COALESCE(fechaRealizada, fechaProgramada)` descendente.

## 🛠️ Funcionalidades Implementadas

### Backend
- ✅ Modelo `backend/models/seguimiento.js`
  - `create`, `getById`, `getByAnimal`, `getByAdopcion`, `getPendientesHasta`, `completar`, `marcarRecordatorioEnviado`.
  - Validación de estado "Adoptado" al crear.

- ✅ Controlador `backend/controllers/seguimientoController.js`
  - `crearSeguimiento`, `completarSeguimiento`, `listarPorAnimal`, `listarPorAdopcion`, `listarPendientes`.

- ✅ Rutas `backend/routes/seguimientoRoutes.js` (protegidas admin)
  - `GET /api/seguimiento/pendientes`
  - `GET /api/seguimiento/animal/:animalId`
  - `GET /api/seguimiento/adopcion/:adopcionId`
  - `POST /api/seguimiento`
  - `PUT /api/seguimiento/:id/completar`

- ✅ Recordatorios `server.js`
  - Job cada 5 min → inserta registros en `notificacion` y marca `recordatorioEnviado`.

### Frontend
- ✅ API cliente `frontend/js/api.js`
  - `crearSeguimiento`, `completarSeguimiento`, `getSeguimientosPendientes`, `getSeguimientosPorAnimal`, `getSeguimientosPorAdopcion`.

- ✅ Vista `frontend/admin_seguimiento.html` + lógica `frontend/js/admin_seguimiento.js`
  - Programar seguimiento (animal adoptado, adopción, fecha, observaciones).
  - Listar pendientes con acción de completar (registra observaciones).
  - Historial por animal, ordenado por fecha.

## 🔒 Rutas API
- `POST /api/seguimiento` — Programar seguimiento.
- `PUT /api/seguimiento/:id/completar` — Completar seguimiento con observaciones.
- `GET /api/seguimiento/pendientes` — Listar seguimientos pendientes (hasta hoy).
- `GET /api/seguimiento/animal/:animalId` — Historial por animal.
- `GET /api/seguimiento/adopcion/:adopcionId` — Historial por adopción.

## 🧪 Casos de Prueba

### ✅ Casos Exitosos
1. Programar seguimiento para animal adoptado → estado "Pendiente".
2. Completar seguimiento con observaciones → estado "Completado".
3. Recordatorio generado en fecha programada → notificación creada y marcado enviado.
4. Historial por animal → orden correcto por fecha.

### ❌ Casos de Error
1. Animal no adoptado al programar → error de validación.
2. Adopción no corresponde al animal → error 400.
3. Falta de permisos → 403.

## 📊 Estructura de Datos

### Tabla `seguimiento`
```
CREATE TABLE IF NOT EXISTS `seguimiento` (
  `idSeguimiento` int NOT NULL AUTO_INCREMENT,
  `idAdopcion` int NOT NULL,
  `idAnimal` int NOT NULL,
  `fechaProgramada` date NOT NULL,
  `fechaRealizada` date DEFAULT NULL,
  `observaciones` varchar(500) DEFAULT NULL,
  `estado` varchar(45) NOT NULL DEFAULT 'Pendiente',
  `recordatorioEnviado` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`idSeguimiento`),
  KEY `seg_adopcion_idx` (`idAdopcion`),
  KEY `seg_animal_idx` (`idAnimal`),
  CONSTRAINT `seg_adopcion` FOREIGN KEY (`idAdopcion`) REFERENCES `adopcion` (`idAdopcion`),
  CONSTRAINT `seg_animal` FOREIGN KEY (`idAnimal`) REFERENCES `animal` (`idAnimal`)
);
```

## 🎨 Interfaz de Usuario
- Programar seguimiento y listar pendientes.
- Completar seguimiento con observaciones.
- Historial filtrable por animal.

## 📁 Archivos Creados/Modificados
- `create_seguimiento_table.sql` — Script de tabla.
- `backend/models/seguimiento.js` — Modelo.
- `backend/controllers/seguimientoController.js` — Controlador.
- `backend/routes/seguimientoRoutes.js` — Rutas.
- `backend/app.js` — Registro de rutas.
- `server.js` — Job recordatorios.
- `frontend/admin_seguimiento.html` — Vista.
- `frontend/js/admin_seguimiento.js` — Lógica UI.
- `frontend/js/api.js` — Métodos cliente.

## 🚀 Instrucciones de Uso
1. Acceder como administrador.
2. Ir a "Seguimiento".
3. Programar seguimiento para animal adoptado.
4. Completar seguimiento cuando se realiza el control y registrar observaciones.

---

**Estado:** ✅ COMPLETADO  
**Fecha:** 2025-10-29  
**Desarrollador:** Asistente AI  
**Revisión:** Pendiente
