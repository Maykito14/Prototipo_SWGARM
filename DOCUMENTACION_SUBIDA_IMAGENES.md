# Documentación: Sistema de Subida de Imágenes

## 📋 Resumen

Se ha implementado un sistema completo para la subida y gestión de imágenes de animales en lugar de usar URLs. Los administradores ahora pueden subir imágenes directamente desde sus computadoras cuando registran o editan animales.

---

## 🎯 Objetivo

**Problema anterior:** Los administradores debían proporcionar una URL o ruta de archivo manualmente para las fotos de los animales.

**Solución implementada:** Sistema completo de subida de archivos que permite:
- Subir imágenes directamente desde la computadora del administrador
- Almacenamiento automático en el servidor
- Validación de tipo y tamaño de archivo
- Vista previa antes de subir
- Acceso automático desde todas las páginas del sistema

---

## 🏗️ Arquitectura

### Estructura de Archivos

```
backend/
  ├── middlewares/
  │   └── uploadMiddleware.js     # Middleware de Multer para subida de archivos
  ├── controllers/
  │   └── animalController.js     # Controlador actualizado para manejar archivos
  ├── routes/
  │   └── animalRoutes.js         # Rutas actualizadas con middleware de upload
  ├── uploads/                    # Carpeta creada automáticamente
  │   └── images/                 # Aquí se guardan las imágenes subidas
  └── app.js                      # Configuración para servir archivos estáticos

frontend/
  ├── admin_animales.html         # Formulario actualizado con input file
  └── js/
      ├── admin_animales.js       # Lógica de subida y vista previa
      └── animales.js             # Actualizado para mostrar imágenes subidas
```

---

## 📦 Dependencias Agregadas

### multer
```json
"multer": "^1.4.5-lts.1"
```

**¿Qué es Multer?**
Multer es un middleware de Node.js para manejar `multipart/form-data`, que se usa principalmente para la subida de archivos.

**Instalación:**
```bash
npm install multer@^1.4.5-lts.1
```

---

## 🔧 Componentes Implementados

### 1. Middleware de Upload (`backend/middlewares/uploadMiddleware.js`)

**Funcionalidad:**
- Crea automáticamente la carpeta `uploads/images` si no existe
- Valida que solo se suban imágenes (JPG, PNG, GIF, WEBP)
- Limita el tamaño máximo a 5MB
- Genera nombres únicos para evitar colisiones de archivos
- Guarda los archivos con formato: `nombre-original-timestamp-random.ext`

**Características:**
```javascript
- Validación de tipo MIME
- Validación de extensión
- Límite de tamaño: 5MB
- Nombres únicos: timestamp + random number
```

### 2. Actualización del Controlador (`backend/controllers/animalController.js`)

**Cambios:**
- Recibe el archivo desde `req.file` (proporcionado por multer)
- Guarda la ruta relativa en la base de datos: `uploads/images/nombre-archivo.ext`
- Si no se sube imagen, guarda `null` (se usará imagen genérica)

**Flujo:**
1. Multer procesa el archivo y lo guarda en `uploads/images/`
2. El controlador obtiene `req.file.filename`
3. Construye la ruta: `uploads/images/${req.file.filename}`
4. Guarda la ruta en la base de datos

### 3. Configuración de Rutas (`backend/routes/animalRoutes.js`)

**Cambios:**
```javascript
// ANTES
router.post('/', authMiddleware, adminMiddleware, animalController.crearAnimal);

// DESPUÉS
router.post('/', authMiddleware, adminMiddleware, upload.single('foto'), animalController.crearAnimal);
```

**Explicación:**
- `upload.single('foto')` procesa un único archivo del campo llamado 'foto'
- Debe ir después de los middlewares de autenticación pero antes del controlador

### 4. Servir Archivos Estáticos (`backend/app.js`)

**Agregado:**
```javascript
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

**Resultado:**
Las imágenes son accesibles desde: `http://localhost:3001/uploads/images/nombre-archivo.jpg`

### 5. Formulario Frontend (`frontend/admin_animales.html`)

**Cambios:**
- Reemplazado input `type="text"` por `type="file"`
- Agregado `accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"`
- Agregada vista previa de imagen antes de subir
- Botón para eliminar la selección

### 6. JavaScript Frontend (`frontend/js/admin_animales.js`)

**Funcionalidades agregadas:**
1. **Vista Previa:**
   - Lee el archivo seleccionado
   - Muestra preview usando FileReader API
   - Valida tamaño y tipo antes de mostrar

2. **Validación Cliente:**
   - Tamaño máximo: 5MB
   - Tipos permitidos: JPG, PNG, GIF, WEBP
   - Muestra errores si no cumple

3. **Envío de Archivo:**
   - Usa `FormData` para enviar el archivo
   - Envía el token de autenticación en headers
   - No usa `JSON.stringify` (FormData maneja multipart/form-data)

### 7. Visualización de Imágenes (`frontend/js/animales.js`)

**Lógica implementada:**
```javascript
if (animal.foto) {
  // Si comienza con "uploads/", es una imagen subida
  if (animal.foto.startsWith('uploads/')) {
    imagenSrc = `/${animal.foto}`;  // /uploads/images/nombre.jpg
  } else {
    imagenSrc = animal.foto;  // images/nombre.jpg (rutas antiguas)
  }
}
```

**Compatibilidad:**
- Funciona con imágenes nuevas (subidas) y antiguas (rutas en carpeta images/)

---

## 🗄️ Base de Datos

### Campo `foto` en tabla `animal`

**Valores posibles:**
- `NULL`: No hay imagen (se usa imagen genérica)
- `images/bingo.jpg`: Ruta antigua (imágenes en carpeta frontend)
- `uploads/images/nombre-1234567890.jpg`: Nueva ruta (imágenes subidas)

**Tipo:** `VARCHAR(255)` (suficiente para rutas)

---

## 📝 Uso del Sistema

### Para Administradores

1. **Acceder a Gestión de Animales:**
   - Panel Admin → Gestión Animales

2. **Completar formulario:**
   - Llenar todos los campos obligatorios
   - En "Foto del Animal", hacer clic en "Elegir archivo"
   - Seleccionar una imagen de la computadora

3. **Vista previa:**
   - Al seleccionar la imagen, aparecerá una vista previa
   - Verificar que sea la imagen correcta
   - Si no es correcta, hacer clic en "Eliminar" y seleccionar otra

4. **Registrar:**
   - Hacer clic en "Registrar Animal"
   - La imagen se subirá automáticamente
   - Aparecerá en todas las páginas del sistema

### Formatos Soportados

- **JPEG/JPG** (.jpg, .jpeg)
- **PNG** (.png)
- **GIF** (.gif)
- **WEBP** (.webp)

### Limitaciones

- **Tamaño máximo:** 5MB por imagen
- **Cantidad:** Una imagen por animal (para múltiples imágenes, se requeriría modificación)

---

## 🔒 Seguridad

### Validaciones Implementadas

1. **Autenticación:**
   - Solo administradores pueden subir imágenes
   - Requiere token JWT válido

2. **Validación de Tipo:**
   - Backend valida MIME type
   - Frontend valida extensión
   - Solo se aceptan imágenes

3. **Validación de Tamaño:**
   - Máximo 5MB (configurable en `uploadMiddleware.js`)
   - Validación en cliente y servidor

4. **Nombres Seguros:**
   - Caracteres especiales eliminados del nombre original
   - Nombres únicos evitan sobrescritura
   - No se ejecuta código desde nombres de archivo

### Mejoras Futuras Recomendadas

- [ ] Escalado automático de imágenes grandes
- [ ] Generación de thumbnails
- [ ] Eliminación de imágenes antiguas al actualizar
- [ ] Compresión de imágenes
- [ ] Sanitización adicional de nombres de archivo

---

## 🐛 Solución de Problemas

### Error: "Solo se permiten archivos de imagen"
**Causa:** El archivo no es una imagen o tiene extensión incorrecta
**Solución:** Verificar que el archivo sea JPG, PNG, GIF o WEBP

### Error: "La imagen es demasiado grande"
**Causa:** El archivo excede 5MB
**Solución:** Reducir el tamaño de la imagen o usar un formato más comprimido

### Error: "Error al registrar animal"
**Causa:** Problema de permisos en la carpeta uploads
**Solución:** 
1. Verificar que la carpeta `backend/uploads/images` exista
2. Verificar permisos de escritura

### Las imágenes no se ven
**Causa:** Ruta incorrecta o servidor no configurado
**Solución:**
1. Verificar que `app.js` tenga: `app.use('/uploads', express.static(...))`
2. Verificar que las rutas en base de datos comiencen con `uploads/images/`
3. Reiniciar el servidor

### Error: "multer is not defined"
**Causa:** Multer no está instalado
**Solución:** Ejecutar `npm install`

---

## 🔄 Flujo Completo

```
1. Administrador selecciona imagen
   ↓
2. JavaScript valida tamaño y tipo (cliente)
   ↓
3. Se muestra vista previa
   ↓
4. Administrador hace clic en "Registrar"
   ↓
5. FormData envía archivo al servidor
   ↓
6. Multer valida y guarda archivo en uploads/images/
   ↓
7. Controlador recibe req.file.filename
   ↓
8. Se guarda ruta "uploads/images/nombre.jpg" en BD
   ↓
9. Imagen accesible desde /uploads/images/nombre.jpg
   ↓
10. Todas las páginas muestran la imagen automáticamente
```

---

## 📊 Ejemplo de Uso

### Ruta en Base de Datos:
```
uploads/images/pedro-1704123456789-987654321.jpg
```

### URL Accesible:
```
http://localhost:3001/uploads/images/pedro-1704123456789-987654321.jpg
```

### En Frontend:
```html
<img src="/uploads/images/pedro-1704123456789-987654321.jpg" alt="Pedro">
```

---

## 🎨 Mejoras Visuales

### Vista Previa
- Muestra la imagen seleccionada antes de subir
- Botón para eliminar selección
- Validación visual inmediata

### Manejo de Errores
- Mensajes claros en español
- Errores específicos según el problema
- No se pierde el formulario completo si falla la imagen

---

## 📚 Referencias Técnicas

### Multer Documentation
- https://github.com/expressjs/multer

### FormData API
- https://developer.mozilla.org/en-US/docs/Web/API/FormData

### FileReader API
- https://developer.mozilla.org/en-US/docs/Web/API/FileReader

---

## ✅ Checklist de Verificación

Antes de usar en producción, verificar:

- [x] Multer instalado
- [x] Carpeta uploads/images existe y tiene permisos
- [x] Express configurado para servir /uploads
- [x] Validaciones funcionando (tipo y tamaño)
- [x] Vista previa funcionando
- [x] Imágenes se guardan correctamente
- [x] Imágenes se muestran en todas las páginas
- [ ] Backup de imágenes configurado
- [ ] Límite de almacenamiento considerado
- [ ] Proceso de limpieza de imágenes no usadas

---

## 🚀 Próximos Pasos Recomendados

1. **Edición de Animales:**
   - Permitir cambiar imagen al editar
   - Eliminar imagen antigua al actualizar

2. **Optimización:**
   - Compresión automática
   - Generación de thumbnails
   - Almacenamiento en CDN (futuro)

3. **Múltiples Imágenes:**
   - Permitir subir varias fotos por animal
   - Galería de imágenes

4. **Gestión:**
   - Interfaz para ver todas las imágenes subidas
   - Eliminación manual de imágenes no usadas

---

## 📝 Notas Importantes

⚠️ **IMPORTANTE:**
- Las imágenes se guardan localmente en el servidor
- No están en Git (deben estar en .gitignore)
- Hacer backup regular de la carpeta `uploads/`
- Considerar migración a almacenamiento en la nube para producción

🔧 **Mantenimiento:**
- Revisar periódicamente el tamaño de la carpeta uploads
- Implementar limpieza de imágenes huérfanas (sin referencia en BD)
- Monitorear espacio en disco

---

**Versión:** 1.0  
**Fecha:** Enero 2025  
**Autor:** Sistema SWGARM  
**Estado:** ✅ Implementado y Funcional

