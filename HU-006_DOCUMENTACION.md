# HU-006: Formalizar Adopción

## 📋 Descripción
Como administrador quiero formalizar la adopción de un animal para registrar oficialmente el vínculo adoptante-animal.

## ✅ Criterios de Aceptación Implementados

### 1. Actualización de estado del animal a “Adoptado”
- ✅ Implementado: Al formalizar la adopción, el sistema cambia el estado del animal a "Adoptado".
- ✅ Historial: Se registra el cambio en `estado_animal` con motivo "Adopción formalizada" y usuario.
- ✅ Validación: No permite formalizar si el animal ya está en estado "Adoptado".

### 2. Contrato de adopción vinculado a adoptante y animal
- ✅ Implementado: Se crea un registro en `adopcion` con `idSolicitud` y `idUsuario` (admin que formaliza), más `fecha` y `contrato` (referencia opcional).
- ✅ Enlace lógico: `idSolicitud` enlaza a `adoptante` y `animal` (vía tabla `solicitud`).

### 3. Consulta de adopciones registradas
- ✅ Implementado: Endpoints para listar y obtener adopciones con datos enriquecidos (adoptante, animal, usuario, fecha, contrato).

## 🛠️ Funcionalidades Implementadas

### Backend
- ✅ Controlador actualizado (`backend/controllers/adopcionController.js`)
  - `formalizarAdopcion`: validación de solicitud aprobada, creación del registro en `adopcion`, y cambio de estado del animal a "Adoptado" con historial.
  - `listarAdopciones`, `obtenerAdopcion`: consulta de adopciones con joins.

- ✅ Modelo actualizado (`backend/models/adopcion.js`)
  - Nuevo objeto `Adopcion` con `getAll`, `getById`, `create`.
  - Consultas que devuelven datos enriquecidos (adoptante, animal, usuario).

- ✅ Integración con estados (`backend/models/estadoAnimal.js`)
  - Uso de `updateAnimalStatus` para actualizar estado y registrar historial.

### Frontend
- ✅ API cliente (`frontend/js/api.js`)
  - `getAdopciones`, `getAdopcion`, `formalizarAdopcion(idSolicitud, contrato)`.

- ✅ UI de solicitudes (`frontend/js/admin_solicitudes.js`)
  - Botón "✅" para formalizar visible cuando la solicitud está "Aprobada".
  - Flujo de confirmación y referencia de contrato opcional; recarga de datos tras formalizar.

## 🔒 Rutas API

### Protegidas (Solo administradores)
- `POST /api/adopcion/formalizar` — Formaliza una adopción a partir de `idSolicitud` y `contrato` opcional.
- `GET /api/adopcion/adopciones` — Listar adopciones formalizadas.
- `GET /api/adopcion/adopciones/:id` — Obtener adopción específica.

## 🧪 Casos de Prueba

### ✅ Casos Exitosos
1. Formalización válida: Solicitud "Aprobada" → Registro en `adopcion` + estado animal "Adoptado".
2. Contrato opcional: Se guarda referencia textual si es provista.
3. Consulta: `GET /adopciones` devuelve adopciones con datos de adoptante, animal y usuario.

### ❌ Casos de Error
1. Solicitud inexistente: "Solicitud no encontrada".
2. Solicitud no aprobada: Error indicando que debe estar "Aprobada".
3. Animal ya adoptado: "El animal ya está adoptado".
4. Sin permisos: Acceso denegado si no es administrador autenticado.

## 📊 Estructura de Datos

### Tabla `adopcion` (existente en `estructura.sql`)
```
CREATE TABLE `adopcion` (
  `idAdopcion` int NOT NULL AUTO_INCREMENT,
  `idSolicitud` int NOT NULL,
  `idUsuario` int NOT NULL,
  `fecha` date DEFAULT NULL,
  `contrato` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idAdopcion`),
  KEY `adopcion_usuario_idx` (`idUsuario`),
  KEY `adopcion_solicitud_idx` (`idSolicitud`),
  CONSTRAINT `adopcion_solicitud` FOREIGN KEY (`idSolicitud`) REFERENCES `solicitud` (`idSolicitud`),
  CONSTRAINT `adopcion_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
);
```

### Tabla `solicitud` (referenciada)
- `idAdoptante`, `idAnimal`, `estado` (requiere estado "Aprobada" para formalizar).

### Tabla `estado_animal` (historial)
- Se agrega registro con `estadoNuevo = 'Adoptado'` al formalizar.

## 🎨 Interfaz de Usuario

### Panel de Evaluación de Solicitudes (`frontend/admin_solicitudes.html`)
- Botón "✅" en filas con estado "Aprobada" para formalizar.
- Diálogo para referencia de contrato (opcional) y confirmación.

## 📁 Archivos Creados/Modificados

### Modificados
- `backend/models/adopcion.js` — Se añadió objeto `Adopcion` y export.
- `backend/controllers/adopcionController.js` — Nuevas acciones listar/obtener/formalizar.
- `backend/routes/adopcionRoutes.js` — Nuevas rutas protegidas de adopción.
- `frontend/js/api.js` — Métodos de cliente para adopciones formalizadas.
- `frontend/js/admin_solicitudes.js` — Botón y flujo de formalización.

## 🚀 Instrucciones de Uso

### Para Administradores
1. Aprobar una solicitud desde "Evaluar Solicitudes" (HU-005).
2. Hacer clic en "✅" en la fila aprobada.
3. Ingresar referencia/numero de contrato (opcional) y confirmar.
4. Ver confirmación y verificar que el animal quedó "Adoptado".

## 🔄 Integración con Otras HU
- **HU-004:** Las solicitudes provienen del formulario de adopción.
- **HU-005:** Debe existir una solicitud en estado "Aprobada".
- **HU-003:** Cambio de estado del animal a "Adoptado" con historial.

---

**Estado:** ✅ COMPLETADO  
**Fecha:** 2025-10-29  
**Desarrollador:** Asistente AI  
**Revisión:** Pendiente
