# HU-008: Reportes de Adopciones

## 📋 Descripción
Como administrador quiero generar reportes de adopciones para analizar estadísticas y resultados del proceso.

## ✅ Criterios de Aceptación Implementados

### 1) Reporte por rango de fechas
- ✅ Endpoint recibe `desde` y `hasta` (YYYY-MM-DD) y devuelve adopciones del período.
- ✅ Incluye datos del adoptante y del animal.

### 2) Exportación a PDF o Excel
- ✅ Exportación a CSV (compatible con Excel) desde la UI.
- ✅ Exportación a PDF mediante impresión del navegador (contenido formateado).

### 3) Presentación con gráficos y tablas
- ✅ Tabla detallada con todas las adopciones del período.
- ✅ Gráfico de barras por especie (Chart.js).
- ✅ Gráfico de línea de evolución mensual.
- ✅ Tabla de Top 5 razas más adoptadas con porcentajes.
- ✅ Resumen estadístico con total, desglose por especie, rango de fechas y promedio mensual.

## 🛠️ Funcionalidades Implementadas

### Backend
- `backend/controllers/reportesController.js`
  - `reporteAdopciones`: consulta con JOIN y múltiples agregados.
  - Métricas calculadas: por especie, por raza, por mes, top 5 razas, evolución mensual.
- `backend/routes/reportesRoutes.js`
  - `GET /api/reportes/adopciones` (protegido admin).
- `backend/app.js`
  - Registro de rutas `/api/reportes`.

### Frontend
- `frontend/admin_reportes.html`:
  - Filtros de fecha, botones de exportación.
  - Resumen con 4 tarjetas estadísticas (total, por especie, rango, promedio/mes).
  - Dos gráficos lado a lado: barras por especie y línea de evolución mensual.
  - Tabla de Top 5 razas con porcentajes.
  - Tabla detallada de todas las adopciones.
  - Chart.js por CDN.
- `frontend/js/admin_reportes.js`:
  - Generación de reporte con renderizado de múltiples gráficos.
  - Funciones: `renderChartEspecie`, `renderChartEvolucion`, `renderTablaRazas`.
  - Exportación CSV y PDF.
- `frontend/js/api.js`:
  - `getReporteAdopciones(desde, hasta)`.
- `frontend/js/header.js`:
  - Enlace a "Reportes" agregado al menú de administración.

## 🔒 Rutas API
- `GET /api/reportes/adopciones?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`
  - Respuesta: `{ rango: {desde, hasta}, total, porEspecie: {}, porRaza: {}, topRazas: [{raza, cantidad}], evolucionMensual: [{mes, cantidad}], datos: [] }`.

## 🧪 Casos de Prueba
- Rango válido con datos → devuelve lista y totales correctos.
- Rango sin datos → tabla vacía y total 0.
- Fechas faltantes → 400 con mensaje claro.
- Acceso sin permisos → 403.

## 🎨 Interfaz
- **Filtros:** fecha desde/hasta, botones: Generar, Exportar CSV, Exportar PDF.
- **Resumen (4 tarjetas):**
  - Total de adopciones
  - Desglose por especie
  - Rango de fechas
  - Promedio por mes
- **Gráficos (2 lado a lado):**
  - Gráfico de barras por especie
  - Gráfico de línea de evolución mensual
- **Tabla Top 5 razas:** Posición, Raza, Cantidad, Porcentaje.
- **Tabla detallada:** ID, Fecha, Adoptante, Animal, Especie, Raza, Contrato.

## 📁 Archivos Creados/Modificados
- `backend/controllers/reportesController.js`
- `backend/routes/reportesRoutes.js`
- `backend/app.js`
- `frontend/admin_reportes.html`
- `frontend/js/admin_reportes.js`
- `frontend/js/api.js`
- Enlaces al menú: añadí `admin_reportes.html` en paneles.

## 🚀 Instrucciones de Uso
1. Ingresar como administrador.
2. Ir a "Reportes" en el menú.
3. Seleccionar rango de fechas y presionar "Generar".
4. Exportar CSV o PDF si es necesario.

---

**Estado:** ✅ COMPLETADO  
**Fecha:** 2025-10-29  
**Desarrollador:** Asistente AI  
**Revisión:** Pendiente
