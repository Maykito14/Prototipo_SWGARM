# Documentación: Sistema de Imágenes de Animales

## 📋 Resumen

El sistema permite a los administradores subir, administrar y visualizar **múltiples imágenes** para cada animal. Las fotos se almacenan localmente en el servidor y se registran en la tabla `animal_foto`, garantizando trazabilidad y control sobre los archivos.

---

## 🎯 Objetivo

- Reemplazar las URLs manuales por un proceso de subida guiado.
- Asociar varias fotos a un mismo animal y definir una foto principal.
- Facilitar la limpieza de imágenes huérfanas y mantener la base de datos consistente.

---

## 🏗️ Arquitectura

```
backend/
  middlewares/uploadMiddleware.js   # Configuración de Multer
  controllers/animalController.js   # Alta/edición con múltiples imágenes
  models/animal.js                  # Devuelve la galería completa
  routes/animalRoutes.js            # Uso de upload.fields(...)
  uploads/images/                   # Repositorio de archivos
  scripts/validar_fotos.js          # Auditoría de archivos huérfanos

frontend/
  admin_animales.html               # Formulario con selección múltiple
  js/admin_animales.js              # Vista previa + galería existente
  js/animales.js                    # Modal público (galería)
```

---

## 📦 Dependencias

- `multer@^1.4.5-lts.1`
- Dependencies ya existentes (`mysql2`, `dotenv`, etc.)

Instalación general:
```bash
npm install
```

---

## 🔧 Componentes Clave

### 1. Middleware (`uploadMiddleware.js`)
- Crea `uploads/images` si no existe.
- Valida MIME y tamaño (máx. 5MB).
- Genera nombres únicos (`nombre-timestamp-random.ext`).

### 2. Controlador (`animalController.js`)
- Usa `upload.fields([{ name: 'foto' }, { name: 'fotos', maxCount: 10 }])`.
- Procesa múltiples archivos en alta y edición.
- Inserta registros en `animal_foto` y marca la primera como principal.
- Devuelve el animal con la galería (`fotos` y `fotoPrincipal`).

### 3. Modelo (`animal.js`)
- Adjunta automáticamente `fotos` (array) y `fotoPrincipal`.
- Expone `foto` para compatibilidad con vistas existentes.

### 4. Rutas (`animalRoutes.js`)
```javascript
const uploadFotos = upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'fotos', maxCount: 10 }
]);

router.post('/', authMiddleware, adminMiddleware, uploadFotos, animalController.crearAnimal);
router.put('/:id', authMiddleware, adminMiddleware, uploadFotos, animalController.actualizarAnimal);
```

### 5. Script de Validación (`scripts/validar_fotos.js`)
- Ejecutar `npm run validar:fotos`.
- Reporta archivos huérfanos (en disco sin referencia) y referencias inválidas en BD.

### 6. Frontend Administración (`admin_animales.html` + `admin_animales.js`)
- Input múltiple con vista previa en grilla.
- Galería actual al editar (miniaturas).
- Uso de `FormData` y token JWT.

### 7. Sitio Público (`animales.js`)
- Construye una galería por animal.
- Modal accesible (mouse/teclado) para ver todas las fotos.

---

## 🗄️ Base de Datos

### `animal`
- Información del animal (sin ruta de imagen).

### `animal_foto`
```sql
idFoto INT PK
idAnimal INT FK -> animal.idAnimal
ruta VARCHAR(255)
esPrincipal TINYINT(1)
fechaSubida TIMESTAMP
```
- Índice único `(idAnimal, ruta)` evita duplicados.
- `esPrincipal` garantiza la foto destacada (una por animal).

---

## 📝 Uso del Sistema

1. Registrar o editar un animal en el panel admin.
2. Seleccionar una o varias imágenes (input `multiple`).
3. Revisar la vista previa (se puede limpiar la selección).
4. Guardar; las imágenes se suben y quedan asociadas en `animal_foto`.
5. En edición, revisar la galería actual y añadir nuevas fotos si es necesario.

**Formatos permitidos:** JPG, JPEG, PNG, GIF, WEBP  
**Tamaño máximo:** 5MB por imagen (configurable)  
**Límite actual:** 10 archivos por operación (configurable)

---

## 🔒 Validaciones y Seguridad

1. **Autenticación**: sólo administradores autenticados pueden subir.
2. **MIME / extensión**: validaciones en cliente y servidor.
3. **Tamaño**: límite duro en Multer y validación en frontend.
4. **Nombres seguros**: se sanitiza y se generan nombres únicos por archivo.

---

## 🧹 Mantenimiento y Limpieza

- Ejecutar `npm run validar:fotos` para detectar:
  - Archivos presentes en disco pero sin referencia (`huérfanos`).
  - Registros que apuntan a archivos inexistentes.
- Los archivos reportados pueden eliminarse manualmente según corresponda.

---

## 🔄 Flujo Simplificado

```
1. Selección de imágenes en el formulario admin.
2. Validación y vista previa en frontend.
3. Envío mediante FormData (token JWT).
4. Multer guarda en /uploads/images y devuelve req.files.
5. Controlador registra rutas en animal_foto y marca principal.
6. Modelo entrega animal con fotos[] y fotoPrincipal.
7. Frontend público arma la galería y el modal.
```

---

## ✅ Checklist

- [x] Multer configurado y carpeta `uploads/images` creada.
- [x] Servir `/uploads` como ruta estática.
- [x] Validaciones de tipo y tamaño.
- [x] Selección múltiple y vista previa.
- [x] Galería pública funcionando.
- [x] Script de validación de imágenes huérfanas.
- [ ] Backup periódico de la carpeta `uploads/`.
- [ ] Estrategia de compresión / thumbnails (pendiente).

---

## 📝 Notas

- Las imágenes se guardan localmente y están fuera de control de versiones (ver `.gitignore`).
- Se recomienda monitorear el espacio en disco y realizar respaldos periódicos.
- Para producción considerar almacenamiento externo (S3, CDN, etc.).

---

## 🚀 Próximos Pasos Recomendados

- Compresión y redimensionamiento automático.
- Eliminación automática de imágenes al borrar un animal.
- Interfaz para reordenar o eliminar fotos existentes desde el panel admin.

---

**Versión:** 2.0  
**Fecha:** Noviembre 2025  
**Autor:** Equipo SWGARM  
**Estado:** ✅ En producción

