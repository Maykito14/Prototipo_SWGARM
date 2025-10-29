# HU-014: Búsqueda y Filtrado

## 📋 Descripción
Como usuario quiero buscar y filtrar animales para localizar más fácilmente a los que cumplen con mis preferencias.

## ✅ Criterios de Aceptación Implementados

### 1. Filtro por edad con condición
- ✅ Implementado: Sistema completo de filtrado por edad con categorías.
- ✅ Categorías: Cachorro (0-1 año), Adulto (1-7 años), Senior (7+ años).
- ✅ Validación: Excluye animales sin edad especificada cuando se aplica el filtro.
- ✅ Actualización dinámica: La lista se actualiza automáticamente al seleccionar un filtro.

### 2. Filtro por estado con actualización dinámica
- ✅ Implementado: Dropdown con todos los estados disponibles.
- ✅ Estados disponibles: Disponible, En proceso, Adoptado, En tratamiento.
- ✅ Valor por defecto: "Disponible" seleccionado al cargar la página.
- ✅ Actualización inmediata: La lista se actualiza al cambiar el filtro.

### 3. Búsqueda por nombre con coincidencias
- ✅ Implementado: Campo de búsqueda que filtra en tiempo real.
- ✅ Búsqueda ampliada: Busca en nombre, raza y descripción.
- ✅ Sensibilidad: Búsqueda sin distinción entre mayúsculas y minúsculas.
- ✅ Actualización dinámica: Resultados se actualizan mientras el usuario escribe.

## 🛠️ Funcionalidades Implementadas

### Backend
- ✅ Endpoint existente utilizado (`GET /api/animales`)
  - Retorna todos los animales con sus datos completos.
  - Permite filtrar en el frontend según necesidades.

### Frontend
- ✅ Interfaz mejorada (`frontend/animales.html`)
  - Campo de búsqueda por nombre.
  - Filtro por especie (Perro/Gato/Otro).
  - Filtro por edad (Cachorro/Adulto/Senior).
  - Filtro por estado (Disponible/En proceso/Adoptado/En tratamiento).
  - Botón "Limpiar" para restablecer filtros.
  - Contador de resultados mostrando total y filtrados.

- ✅ JavaScript mejorado (`frontend/js/animales.js`)
  - Carga de todos los animales para permitir filtrado completo.
  - Búsqueda mejorada que busca en nombre, raza y descripción.
  - Filtrado combinado: Todos los filtros funcionan simultáneamente.
  - Validación de edad: Excluye animales sin edad cuando se aplica filtro.
  - Contador dinámico de resultados.
  - Mensajes informativos cuando no hay resultados.
  - Badges visuales para estados.
  - Botón de postulación solo para animales disponibles.

- ✅ Estilos CSS (`frontend/animales.html`)
  - Badges de estado con colores diferenciados:
    - Verde: Disponible
    - Naranja: En proceso
    - Azul: Adoptado
    - Rojo: En tratamiento

## 🔒 Rutas API

### Públicas
- `GET /api/animales` - Listar todos los animales (utilizado para filtrado completo).

## 🧪 Casos de Prueba

### ✅ Casos Exitosos
1. Filtro por edad "Cachorro" → Muestra solo animales de 0-1 año.
2. Filtro por edad "Adulto" → Muestra solo animales de 1-7 años.
3. Filtro por edad "Senior" → Muestra solo animales de más de 7 años.
4. Filtro por estado "Disponible" → Muestra solo animales disponibles.
5. Filtro por estado "Adoptado" → Muestra solo animales adoptados.
6. Búsqueda por nombre → Muestra coincidencias en nombre, raza o descripción.
7. Filtros combinados → Funciona correctamente con múltiples filtros activos.
8. Limpiar filtros → Restablece todos los filtros y muestra disponibles por defecto.

### ❌ Casos de Error
1. Sin resultados → Mensaje informativo con botón para limpiar filtros.
2. Animales sin edad → Excluidos cuando se aplica filtro de edad.
3. Búsqueda sin resultados → Mensaje claro indicando que no hay coincidencias.

## 📊 Estructura de Datos

### Filtros Disponibles
- **Búsqueda por texto:** Nombre, raza o descripción.
- **Especie:** Perro, Gato, Otro.
- **Edad:** Cachorro (0-1), Adulto (1-7), Senior (7+).
- **Estado:** Disponible, En proceso, Adoptado, En tratamiento.

## 🎨 Interfaz de Usuario

### Barra de Filtros
- **Campo de búsqueda:** Texto libre para buscar por nombre, raza o descripción.
- **Filtro de especie:** Dropdown con opciones.
- **Filtro de edad:** Dropdown con categorías.
- **Filtro de estado:** Dropdown con estados disponibles.
- **Botón limpiar:** Restablece todos los filtros.
- **Contador de resultados:** Muestra total y filtrados.

### Tarjetas de Animales
- **Estado visual:** Badge con color según estado.
- **Botón de acción:** 
  - "Postularme para adoptar" si está disponible.
  - "No disponible para adopción" si no está disponible (deshabilitado).

### Mensajes Informativos
- **Sin resultados:** Mensaje claro con botón para limpiar filtros.
- **Contador:** Muestra "Mostrando X de Y animales" cuando hay filtros activos.

## 📁 Archivos Modificados

### Archivos Modificados
- `frontend/animales.html` - Agregado filtro por estado, contador de resultados y estilos CSS.
- `frontend/js/animales.js` - Mejorada búsqueda y filtrado:
  - Cambio de `getAnimalesDisponibles()` a `getAnimales()`.
  - Agregado filtro por estado.
  - Búsqueda mejorada (nombre, raza, descripción).
  - Filtro de edad mejorado con validación.
  - Contador de resultados.
  - Badges de estado.
  - Validación de botón de postulación según estado.

## 🚀 Instrucciones de Uso

### Para Usuarios
1. Navegar a "Animales" en el menú.
2. Usar el campo de búsqueda para buscar por nombre, raza o descripción.
3. Seleccionar filtros según preferencias:
   - Especie (Perro/Gato/Otro).
   - Edad (Cachorro/Adulto/Senior).
   - Estado (Disponible/En proceso/Adoptado/En tratamiento).
4. Ver resultados actualizados automáticamente.
5. Observar contador de resultados para ver cuántos animales coinciden.
6. Hacer clic en "Limpiar" para restablecer todos los filtros.

### Comportamiento del Sistema
- **Por defecto:** Muestra solo animales disponibles al cargar la página.
- **Filtros combinados:** Todos los filtros funcionan simultáneamente.
- **Actualización en tiempo real:** Los resultados se actualizan mientras se escribe o cambia un filtro.
- **Búsqueda ampliada:** Busca en nombre, raza y descripción del animal.
- **Validación:** Excluye animales sin edad cuando se aplica filtro de edad.

## 🔄 Integración con Otras HU
- **HU-009:** Base de la funcionalidad de difusión de animales.
- **HU-004:** Los animales filtrados pueden ser seleccionados para postular adopción.
- **HU-003:** El estado del animal determina si se puede postular adopción.

## 💡 Mejoras Implementadas

### Búsqueda Mejorada
- Busca en múltiples campos (nombre, raza, descripción).
- Búsqueda sin distinción de mayúsculas/minúsculas.
- Actualización en tiempo real mientras se escribe.

### Filtros Mejorados
- Filtro de edad más preciso con validación.
- Filtro de estado completamente funcional.
- Filtros combinados funcionan correctamente.

### Experiencia de Usuario
- Contador de resultados para feedback visual.
- Badges de estado con colores diferenciados.
- Mensajes claros cuando no hay resultados.
- Botón de postulación solo para animales disponibles.

---

**Estado:** ✅ COMPLETADO  
**Fecha:** 2025-10-29  
**Desarrollador:** Asistente AI  
**Revisión:** Pendiente

