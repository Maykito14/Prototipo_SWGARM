# HU-009: Difusión de Animales

## 📋 Descripción
Como usuario quiero visualizar la lista de animales disponibles para conocer sus características antes de postularme.

## ✅ Criterios de Aceptación Implementados

### 1. Listado con nombre, edad, estado y foto
- ✅ Implementado: La página muestra dinámicamente todos los animales disponibles.
- ✅ Campos mostrados: nombre, especie, edad, estado, raza (si existe), descripción (si existe).
- ✅ Foto: Se muestra la foto del animal si está disponible, sino imagen genérica.

### 2. Imagen genérica para animales sin foto
- ✅ Implementado: Función `obtenerImagenGenerica()` que asigna imagen según especie.
- ✅ Fallback: Si no hay foto, se usa imagen de ejemplo según especie (perro/gato) o SVG genérico.
- ✅ Manejo de errores: Si la imagen falla al cargar, se usa el fallback automáticamente.

### 3. Buscador y filtros dinámicos
- ✅ Implementado: Buscador por nombre que filtra en tiempo real.
- ✅ Filtros: Por especie (Perro/Gato/Otro) y por edad (Cachorro/Adulto/Senior).
- ✅ Actualización dinámica: La lista se actualiza automáticamente al escribir o cambiar filtros.
- ✅ Botón limpiar: Restablece todos los filtros.

## 🛠️ Funcionalidades Implementadas

### Backend
- ✅ Modelo actualizado (`backend/models/animal.js`)
  - Método `getDisponibles()`: Retorna solo animales con estado "Disponible".
  - Métodos `create` y `update` actualizados para incluir campo `foto`.

- ✅ Controlador actualizado (`backend/controllers/animalController.js`)
  - Nuevo método `listarAnimalesDisponibles()`.
  - Métodos `crearAnimal` y `actualizarAnimal` incluyen campo `foto`.

- ✅ Rutas actualizadas (`backend/routes/animalRoutes.js`)
  - Nueva ruta pública: `GET /api/animales/disponibles`.

- ✅ Base de datos (`update_animal_foto.sql`)
  - Script SQL para agregar campo `foto` a tabla `animal`.

### Frontend
- ✅ Página principal (`frontend/animales.html`)
  - Lista completamente dinámica generada desde la API.
  - Buscador por nombre con filtrado en tiempo real.
  - Filtros por especie y edad.
  - Botón limpiar filtros.

- ✅ JavaScript (`frontend/js/animales.js`)
  - Carga animales disponibles desde API.
  - Renderizado dinámico de tarjetas con información completa.
  - Sistema de filtros múltiples con actualización inmediata.
  - Función `obtenerImagenGenerica()` para manejar imágenes faltantes.
  - Manejo de errores de carga de imágenes.

- ✅ API cliente (`frontend/js/api.js`)
  - Nuevo método `getAnimalesDisponibles()`.

- ✅ Formulario admin (`frontend/admin_animales.html` y `frontend/js/admin_animales.js`)
  - Campo para URL de foto agregado al formulario.
  - Campo `foto` incluido al crear animales.

## 🔒 Rutas API

### Públicas
- `GET /api/animales/disponibles` - Lista solo animales con estado "Disponible".
- `GET /api/animales/:id` - Obtener animal específico.

## 🧪 Casos de Prueba

### ✅ Casos Exitosos
1. Carga de animales disponibles → Lista completa mostrada.
2. Animal con foto → Se muestra la foto personalizada.
3. Animal sin foto → Se muestra imagen genérica según especie.
4. Búsqueda por nombre → Lista filtrada dinámicamente.
5. Filtro por especie → Solo muestra animales de esa especie.
6. Filtro por edad → Categoriza correctamente (Cachorro/Adulto/Senior).
7. Combinación de filtros → Funciona correctamente con múltiples filtros activos.

### ❌ Casos de Error
1. Sin animales disponibles → Mensaje informativo.
2. Error de API → Mensaje de error amigable.
3. Imagen no encontrada → Fallback a imagen genérica automático.

## 🎨 Interfaz de Usuario

### Buscador y Filtros
- **Buscador:** Campo de texto para buscar por nombre (filtrado en tiempo real).
- **Filtro especie:** Dropdown con opciones (Todas, Perros, Gatos, Otros).
- **Filtro edad:** Dropdown con categorías (Todas, Cachorro 0-1 año, Adulto 1-7 años, Senior 7+ años).
- **Botón limpiar:** Restablece todos los filtros.

### Tarjetas de Animales
- **Foto:** Imagen del animal o imagen genérica según especie.
- **Información mostrada:**
  - Nombre (destacado)
  - Especie
  - Edad (con unidad "años")
  - Estado
  - Raza (si existe)
  - Descripción (si existe)
- **Botón de acción:** "Postularme para adoptar" con link al formulario con ID del animal.

## 📁 Archivos Creados/Modificados

### Nuevos Archivos
- `update_animal_foto.sql` - Script para agregar campo foto.

### Archivos Modificados
- `backend/models/animal.js` - Método `getDisponibles()` y soporte para campo `foto`.
- `backend/controllers/animalController.js` - Nuevo método y actualización para `foto`.
- `backend/routes/animalRoutes.js` - Nueva ruta `/disponibles`.
- `frontend/animales.html` - Reestructurado completamente con lista dinámica.
- `frontend/js/animales.js` - Reescrito completamente con filtros dinámicos.
- `frontend/js/api.js` - Nuevo método `getAnimalesDisponibles()`.
- `frontend/admin_animales.html` - Campo foto agregado al formulario.
- `frontend/js/admin_animales.js` - Campo `foto` incluido al crear animales.

## 🚀 Instrucciones de Uso

### Para Usuarios Públicos
1. Navegar a "Animales" en el menú.
2. Ver lista de animales disponibles automáticamente.
3. Usar buscador para filtrar por nombre.
4. Usar filtros de especie y edad para refinar búsqueda.
5. Hacer clic en "Postularme para adoptar" en el animal deseado.

### Para Administradores
1. En "Gestión Animales", completar formulario incluyendo campo "URL de la foto" (opcional).
2. Si no se proporciona foto, el sistema asignará imagen genérica automáticamente.
3. Los animales con estado "Disponible" aparecerán en la lista pública.

## 🔄 Integración con Otras HU
- **HU-001:** Animales registrados por admin aparecen en la lista si están disponibles.
- **HU-004:** Los animales listados tienen enlace directo al formulario de adopción con ID.
- **HU-003:** El estado del animal determina si aparece en la lista (solo "Disponible").

---

**Estado:** ✅ COMPLETADO  
**Fecha:** 2025-10-29  
**Desarrollador:** Asistente AI  
**Revisión:** Pendiente

