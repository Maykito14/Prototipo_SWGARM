# 📋 Informe de Errores, Inconsistencias y Bugs Detectados

## 🔴 CRÍTICOS (Deben corregirse inmediatamente)

### 1. **Vulnerabilidad SQL Injection en server.js**
**Ubicación:** `server.js` línea 82-84
**Problema:** Construcción de consulta SQL con interpolación de arrays sin validación adecuada
```javascript
const ids = pendientes.map(p => p.idSeguimiento);
await pool.query(
  `UPDATE seguimiento SET recordatorioEnviado = 1 WHERE idSeguimiento IN (${ids.map(() => '?').join(',')})`,
  ids
);
```
**Riesgo:** Si `ids` está vacío, la consulta falla. Además, aunque usa placeholders, la construcción es frágil.
**Solución:** Validar que `ids.length > 0` antes de ejecutar la consulta.

### 2. **Falta validación de rol en actualizarRol**
**Ubicación:** `backend/controllers/userController.js` línea 117-156
**Problema:** No valida que el usuario que hace la petición sea administrador antes de permitir cambio de roles.
**Riesgo:** Un usuario normal podría intentar cambiar roles si encuentra la ruta.
**Solución:** Ya está protegido por `adminMiddleware` en las rutas, pero debería verificarse también en el controlador.

### 3. **Inconsistencia en estado de adopciones activas**
**Ubicación:** `backend/models/adopcion.js` y `backend/controllers/adopcionController.js`
**Problema:** Aunque se implementó normalización, si un animal tiene múltiples adopciones y se cambia su estado manualmente, puede quedar inconsistente.
**Riesgo:** Datos inconsistentes en la base de datos.
**Solución:** ✅ Ya corregido en cambios recientes, pero verificar que todas las rutas que cambian estado de animal llamen a `normalizarActivaPorAnimal`.

## 🟠 IMPORTANTES (Deben corregirse pronto)

### 4. **Falta validación de transacciones en operaciones críticas**
**Ubicación:** Múltiples controladores
**Problema:** Operaciones que modifican múltiples tablas no usan transacciones.
**Ejemplos:**
- `formalizarAdopcion`: Crea adopción y actualiza estado del animal
- `actualizarSolicitud`: Actualiza solicitud, cambia estado de animal, marca otras solicitudes
- `crearSeguimiento`: Crea seguimiento y notificaciones

**Riesgo:** Si una operación falla a mitad, la base de datos queda inconsistente.
**Solución:** Envolver operaciones relacionadas en transacciones.

### 5. **Race condition en incrementarIntentosFallidos**
**Ubicación:** `backend/models/User.js` línea 22-40
**Problema:** Si dos intentos de login fallan simultáneamente, ambos leen el mismo valor de `intentosFallidos` y ambos lo incrementan, resultando en un conteo incorrecto.
**Riesgo:** Bloqueo de cuenta puede no funcionar correctamente bajo carga.
**Solución:** Usar `UPDATE usuario SET intentosFallidos = intentosFallidos + 1 WHERE email = ?` para incremento atómico.

### 6. **Falta validación de existencia de animal en adopciones**
**Ubicación:** `backend/controllers/adopcionController.js` línea 560-572
**Problema:** `obtenerAdopcionesPorAnimal` no valida que el animal exista antes de normalizar.
**Riesgo:** Puede ejecutar operaciones sobre un animal inexistente.
**Solución:** Validar existencia del animal antes de normalizar.

### 7. **Manejo de errores inconsistente**
**Ubicación:** Varios controladores
**Problema:** Algunos errores se loguean con `console.error`, otros no. Algunos devuelven mensajes genéricos, otros específicos.
**Riesgo:** Dificulta debugging y puede exponer información sensible.
**Solución:** Estandarizar manejo de errores con un middleware centralizado.

### 8. **Validación de fechas inconsistente**
**Ubicación:** `backend/controllers/saludController.js` y otros
**Problema:** Algunas validaciones de fecha permiten fechas futuras, otras no. No hay consistencia.
**Riesgo:** Datos inválidos en la base de datos.
**Solución:** Crear función helper centralizada para validación de fechas.

## 🟡 MODERADOS (Mejoras recomendadas)

### 9. **Importación de pool dentro de funciones**
**Ubicación:** `backend/controllers/adopcionController.js` línea 204, 305, 473
**Problema:** `pool` se importa dentro de funciones en lugar de al inicio del archivo.
**Riesgo:** No crítico, pero ineficiente y mala práctica.
**Solución:** Mover `const pool = require('../config/db');` al inicio del archivo.

### 10. **Falta validación de tipos en parámetros**
**Ubicación:** Múltiples controladores
**Problema:** No se valida que los IDs sean números antes de usarlos en consultas.
**Riesgo:** Errores SQL si se pasan strings o valores inválidos.
**Solución:** Validar tipos en middleware o al inicio de cada controlador.

### 11. **Consultas N+1 en attachFotos**
**Ubicación:** `backend/models/animal.js` línea 3-44
**Problema:** Aunque se optimizó con una consulta IN, si hay muchos animales, la consulta puede ser lenta.
**Riesgo:** Performance degradada con muchos registros.
**Solución:** Considerar paginación o límites en consultas grandes.

### 12. **Falta validación de longitud de campos**
**Ubicación:** Múltiples controladores
**Problema:** No se valida longitud máxima de campos VARCHAR antes de insertar.
**Riesgo:** Errores SQL si se excede longitud máxima.
**Solución:** Validar longitudes según esquema de base de datos.

### 13. **Manejo de archivos subidos sin validación de tipo**
**Ubicación:** `backend/controllers/animalController.js` línea 33-46
**Problema:** No se valida que los archivos subidos sean imágenes válidas.
**Riesgo:** Posible subida de archivos maliciosos o corruptos.
**Solución:** Validar tipo MIME y extensión de archivos.

### 14. **Falta sanitización de inputs**
**Ubicación:** Múltiples controladores
**Problema:** Textos de usuario no se sanitizan antes de guardar en base de datos.
**Riesgo:** XSS si los datos se muestran sin escapar en frontend.
**Solución:** Sanitizar inputs o usar prepared statements (ya se usan, pero validar que cubren todos los casos).

### 15. **Inconsistencia en nombres de campos**
**Ubicación:** Varios modelos
**Problema:** Algunos campos usan camelCase, otros snake_case. Ejemplo: `idUsuario` vs `id_usuario` (aunque en SQL se usa snake_case).
**Riesgo:** Confusión y posibles errores.
**Solución:** Documentar convención y mantener consistencia.

### 16. **Falta validación de estado del animal antes de crear seguimiento**
**Ubicación:** `backend/controllers/seguimientoController.js` línea 7-102
**Problema:** No se valida que el animal esté en estado "Adoptado" antes de crear seguimiento.
**Riesgo:** Seguimientos para animales no adoptados.
**Solución:** Validar estado del animal.

### 17. **Falta límite en consultas getAll**
**Ubicación:** Múltiples modelos
**Problema:** `getAll()` no tiene límite, puede devolver miles de registros.
**Riesgo:** Performance degradada y posible timeout.
**Solución:** Implementar paginación o límites por defecto.

### 18. **Validación de email inconsistente**
**Ubicación:** `backend/controllers/adopcionController.js` vs `backend/controllers/userController.js`
**Problema:** Diferentes validaciones de formato de email en diferentes lugares.
**Riesgo:** Emails inválidos pueden pasar en algunos lugares.
**Solución:** Crear función helper centralizada para validación de email.

### 19. **Falta validación de unicidad de nombre de animal**
**Ubicación:** `backend/controllers/animalController.js` línea 82-88
**Problema:** Se valida duplicado por nombre, pero no se considera case-insensitive.
**Riesgo:** Pueden crearse animales con nombres como "Max" y "max" como diferentes.
**Solución:** Validar con `LOWER(nombre)` en la consulta.

### 20. **Falta manejo de errores en sincronizarEstadoAnimal**
**Ubicación:** `backend/controllers/saludController.js` línea 184-277
**Problema:** Si `sincronizarEstadoAnimal` falla, el error se captura pero no se propaga, y la operación principal continúa.
**Riesgo:** Estado del animal puede quedar inconsistente sin que se sepa.
**Solución:** Al menos loguear el error de forma más visible o notificar al administrador.

## 🟠 IMPORTANTES - FRONTEND

### 35. **Vulnerabilidades XSS potenciales con innerHTML**
**Ubicación:** Múltiples archivos frontend (`admin_seguimiento.js`, `admin_solicitudes.js`, `admin_usuarios.js`, etc.)
**Problema:** Uso extensivo de `innerHTML` con datos que vienen del servidor sin sanitización explícita.
**Ejemplos:**
```javascript
// admin_seguimiento.js línea 175
tablaPendientes.innerHTML = pendientes.map(s => {
  return `<tr>
    <td>${s.idSeguimiento}</td>
    <td>${s.nombreAnimal || s.idAnimal}${s.especie ? ` (${s.especie})` : ''}</td>
    <td>${nombreCompleto}</td>
    ...
  </tr>`;
}).join('');
```
**Riesgo:** Si algún campo contiene HTML malicioso, se ejecutará en el navegador.
**Solución:** 
- Usar `textContent` en lugar de `innerHTML` cuando sea posible
- Sanitizar datos con librería como DOMPurify antes de insertar en `innerHTML`
- Usar template literals con escape: crear función `escapeHtml()`

### 36. **Uso de document.write en admin_reportes.js**
**Ubicación:** `frontend/js/admin_reportes.js` línea 477-545
**Problema:** Uso de `document.write()` para generar PDF, lo cual es una práctica obsoleta y puede causar problemas.
**Riesgo:** Puede sobrescribir el documento completo si se llama después de que la página carga.
**Solución:** Usar librerías modernas para generación de PDF como jsPDF o generar PDF en el servidor.

### 37. **Falta validación de datos del servidor en frontend**
**Ubicación:** Múltiples archivos frontend
**Problema:** Los datos recibidos del servidor se usan directamente sin validar estructura o tipos.
**Riesgo:** Si el servidor devuelve datos inesperados, puede causar errores JavaScript.
**Solución:** Validar estructura de datos antes de usarlos (ej: usar TypeScript o validación manual).

### 38. **Falta manejo de errores en algunas funciones async**
**Ubicación:** Varios archivos frontend
**Problema:** Algunas funciones async no tienen try-catch o manejo de errores adecuado.
**Ejemplo:** `frontend/js/index.js` línea 97-110 - `loadPublicMetrics` tiene try-catch pero no muestra error al usuario.
**Solución:** Implementar manejo de errores consistente y mostrar mensajes al usuario.

### 39. **Falta validación de autenticación en algunas páginas**
**Ubicación:** Algunos archivos frontend
**Problema:** No todas las páginas protegidas verifican autenticación al cargar.
**Solución:** Crear función helper que verifique autenticación y redirija si es necesario.

### 40. **Falta escape de HTML en mensajes de error**
**Ubicación:** Múltiples archivos frontend
**Problema:** Mensajes de error del servidor se muestran directamente sin escapar.
**Riesgo:** XSS si el servidor devuelve mensajes con HTML.
**Solución:** Escapar todos los mensajes antes de mostrar.

## 🔵 MENORES (Mejoras de calidad)

### 21. **Código duplicado en validaciones de fecha**
**Ubicación:** `backend/controllers/saludController.js` y otros
**Problema:** Lógica de normalización de fecha duplicada en múltiples lugares.
**Solución:** Mover a función helper compartida.

### 22. **Falta validación de rango de edad**
**Ubicación:** `backend/controllers/animalController.js` línea 65-67
**Problema:** Límite de 30 años es arbitrario y no se documenta.
**Solución:** Documentar o hacer configurable.

### 23. **Falta validación de puntaje mínimo**
**Ubicación:** `backend/controllers/animalController.js` línea 76-79
**Problema:** Se valida rango 0-100, pero no se valida lógica de negocio (¿puede ser 0?).
**Solución:** Documentar reglas de negocio.

### 24. **Falta validación de estado válido**
**Ubicación:** Múltiples controladores
**Problema:** No se valida que el estado sea uno de los permitidos antes de actualizar.
**Riesgo:** Estados inválidos en base de datos.
**Solución:** Crear enum o constante con estados válidos y validar.

### 25. **Falta índice en consultas frecuentes**
**Ubicación:** Base de datos
**Problema:** Algunas consultas frecuentes no tienen índices apropiados.
**Ejemplo:** `SELECT * FROM solicitud WHERE idAnimal = ?` - verificar si hay índice.
**Solución:** Revisar y agregar índices según necesidad.

### 26. **Falta validación de formato de contrato**
**Ubicación:** `backend/controllers/adopcionController.js` línea 571-633
**Problema:** No se valida formato o contenido del campo `contrato`.
**Solución:** Validar según reglas de negocio.

### 27. **Falta manejo de timezone en fechas**
**Ubicación:** Múltiples lugares
**Problema:** Fechas se manejan sin considerar timezone explícitamente.
**Riesgo:** Inconsistencias en diferentes servidores.
**Solución:** Usar UTC consistentemente.

### 28. **Falta validación de longitud de contraseña en registro**
**Ubicación:** `backend/controllers/userController.js` línea 7-22
**Problema:** No se valida longitud mínima de contraseña en registro (solo en reset).
**Riesgo:** Contraseñas débiles.
**Solución:** Validar longitud mínima (ej: 6 caracteres).

### 29. **Falta rate limiting en endpoints públicos**
**Ubicación:** Rutas públicas
**Problema:** Endpoints como login, registro, recuperación de contraseña no tienen rate limiting.
**Riesgo:** Ataques de fuerza bruta o abuso.
**Solución:** Implementar rate limiting con express-rate-limit.

### 30. **Falta validación de CORS en producción**
**Ubicación:** `backend/app.js` línea 20
**Problema:** CORS está habilitado para todos los orígenes.
**Riesgo:** En producción, debería restringirse a dominios específicos.
**Solución:** Configurar CORS según entorno.

## 📝 INCONSISTENCIAS DE LÓGICA

### 31. **Lógica de sincronización de estado de animal**
**Ubicación:** `backend/controllers/saludController.js` línea 184-277
**Problema:** La función `sincronizarEstadoAnimal` tiene lógica compleja que puede no cubrir todos los casos.
**Ejemplo:** Si un animal está "En proceso" y se crea un control de salud, ¿debe cambiar a "En tratamiento"?
**Solución:** Revisar y documentar todas las reglas de negocio para estados.

### 32. **Validación de transición de estado**
**Ubicación:** `backend/models/estadoAnimal.js` línea 231-240
**Problema:** Permite transición de "Adoptado" a otros estados, pero no está claro cuándo debería permitirse.
**Solución:** Documentar casos de uso y validar según reglas de negocio.

### 33. **Manejo de adopciones múltiples**
**Ubicación:** Sistema completo
**Problema:** Aunque se implementó normalización, la lógica de qué hacer cuando un animal es devuelto y readoptado no está completamente clara.
**Solución:** Documentar flujo completo y asegurar que todas las rutas lo respetan.

### 34. **Validación de puntaje de evaluación**
**Ubicación:** `backend/controllers/adopcionController.js`
**Problema:** No está claro si el puntaje de evaluación se usa para algo o es solo informativo.
**Solución:** Documentar propósito y validar según reglas de negocio.

## 🔧 RECOMENDACIONES GENERALES

1. **Implementar logging estructurado**: Usar un sistema de logging como Winston o Pino en lugar de `console.log/error`.

2. **Agregar tests**: El proyecto no tiene tests. Implementar tests unitarios y de integración.

3. **Documentar API**: Usar Swagger/OpenAPI para documentar endpoints.

4. **Validación centralizada**: Usar librerías como Joi o express-validator para validaciones.

5. **Manejo de errores centralizado**: Middleware de manejo de errores para respuestas consistentes.

6. **Variables de entorno**: Validar que todas las variables de entorno requeridas estén presentes al iniciar.

7. **Backup y recovery**: Documentar procedimientos de backup y recovery de base de datos.

8. **Monitoreo**: Implementar monitoreo de errores (ej: Sentry) en producción.

---

## ✅ VERIFICACIONES REALIZADAS

- ✅ Uso de prepared statements (protección contra SQL injection básica)
- ✅ Autenticación JWT implementada
- ✅ Middleware de autorización para rutas protegidas
- ✅ Validación de existencia de registros antes de operaciones
- ✅ Manejo básico de errores en la mayoría de controladores
- ✅ Normalización de adopciones activas implementada

---

**Fecha del informe:** 2024
**Revisado por:** AI Assistant
**Prioridad de corrección:** 🔴 Críticos → 🟠 Importantes → 🟡 Moderados → 🔵 Menores

