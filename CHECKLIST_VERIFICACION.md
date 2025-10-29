# Verificación de Errores y Checklist - SWGARM

## ✅ Checklist Pre-Ejecución

### 1. Archivos Necesarios
- [ ] `package.json` existe
- [ ] `server.js` existe en la raíz
- [ ] `.env` existe (creado desde `ENV.example`)
- [ ] Todos los archivos SQL están presentes

### 2. Configuración de Base de Datos
- [ ] MySQL está instalado y corriendo
- [ ] Base de datos `swgarm` creada
- [ ] `estructura.sql` ejecutado completamente
- [ ] Todos los scripts de actualización ejecutados en orden

### 3. Configuración del Proyecto
- [ ] `node_modules` existe (ejecutar `npm install`)
- [ ] Archivo `.env` configurado correctamente
- [ ] Variables de entorno tienen valores correctos

### 4. Verificación de Rutas
- [ ] Puerto 3001 disponible
- [ ] No hay procesos usando el puerto
- [ ] Firewall permite conexiones en el puerto 3001

---

## 🔍 Verificación de Errores Comunes

### Error: Módulos No Encontrados

**Síntoma:** `Cannot find module 'express'` o similar

**Causa:** Dependencias no instaladas

**Solución:**
```bash
npm install
```

### Error: Base de Datos No Conecta

**Síntoma:** `Access denied for user` o `Unknown database`

**Causa:** Configuración incorrecta en `.env`

**Verificación:**
1. Verifica que MySQL esté corriendo:
   ```bash
   # Windows
   net start MySQL
   
   # Linux/Mac
   sudo service mysql start
   ```

2. Verifica configuración en `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=tu_contraseña
   DB_NAME=swgarm
   ```

3. Prueba conexión manual:
   ```bash
   mysql -u root -p
   ```

### Error: Tablas No Existen

**Síntoma:** `Table 'swgarm.usuario' doesn't exist`

**Causa:** Scripts SQL no ejecutados

**Solución:**
1. Verifica que la base de datos existe:
   ```sql
   SHOW DATABASES;
   ```

2. Ejecuta estructura.sql (incluye todas las actualizaciones):
   ```bash
   mysql -u root -p swgarm < estructura.sql
   ```

### Error: Puerto en Uso

**Síntoma:** `Port 3001 is already in use`

**Solución:**
- Opción 1: Cambiar puerto en `.env`:
  ```env
  PORT=3002
  ```

- Opción 2: Cerrar proceso que usa el puerto:
  ```bash
  # Windows
  netstat -ano | findstr :3001
  taskkill /PID [PID_NUMBER] /F
  
  # Linux/Mac
  lsof -ti:3001 | xargs kill
  ```

### Error: CORS en Frontend

**Síntoma:** Errores de CORS en la consola del navegador

**Verificación:**
- El archivo `backend/app.js` debe tener:
  ```javascript
  app.use(cors());
  ```

### Error: Token Inválido

**Síntoma:** `Token inválido` al hacer login

**Soluciones:**
1. Verifica que `.env` tenga `JWT_SECRET` configurado
2. Limpia localStorage del navegador:
   - F12 → Application → Local Storage → Clear
3. Cierra sesión y vuelve a iniciar sesión

### Error: Headers Duplicados

**Síntoma:** Se ven dos headers en la página

**Solución:**
- Limpia caché del navegador (Ctrl+Shift+R)
- Verifica que los archivos HTML no tengan headers estáticos

---

## 🔧 Verificación de Funcionalidades

### Autenticación
- [ ] Registro de usuarios funciona
- [ ] Login funciona correctamente
- [ ] Redirección según rol funciona
- [ ] Logout funciona
- [ ] Protección de rutas funciona

### Gestión de Animales (Admin)
- [ ] Crear animal funciona
- [ ] Listar animales funciona
- [ ] Editar animal funciona
- [ ] Eliminar animal funciona
- [ ] Cargar foto funciona

### Solicitudes de Adopción
- [ ] Crear solicitud funciona
- [ ] Listar solicitudes (admin) funciona
- [ ] Evaluar solicitud funciona
- [ ] Formalizar adopción funciona

### Seguimiento
- [ ] Programar seguimiento funciona
- [ ] Completar seguimiento funciona
- [ ] Ver historial funciona
- [ ] Recordatorios se generan (cada 5 min)

### Reportes
- [ ] Generar reporte funciona
- [ ] Gráficos se muestran correctamente
- [ ] Exportar CSV funciona
- [ ] Exportar PDF funciona

### Notificaciones
- [ ] Crear notificación funciona
- [ ] Ver notificaciones funciona
- [ ] Marcar como leída funciona
- [ ] Preferencias funcionan

### Campañas
- [ ] Crear campaña funciona
- [ ] Listar campañas funciona (ordenadas por fecha)
- [ ] Editar campaña funciona
- [ ] Eliminar campaña funciona

---

## 🐛 Errores Potenciales Detectados

### 1. Importación de Pool Dentro de Funciones

**Ubicación:** `backend/controllers/adopcionController.js`

**Problema:** Algunas funciones importan `pool` dentro de la función en lugar de al inicio.

**Estado:** No crítico - Funciona pero no es la mejor práctica.

**Solución Recomendada:** Mover imports al inicio del archivo.

### 2. Validación de Fechas en Frontend

**Ubicación:** Varios archivos frontend

**Problema:** Algunas validaciones de fecha pueden fallar en diferentes navegadores.

**Estado:** Menor - Funciona en navegadores modernos.

### 3. Manejo de Errores en Llamadas API

**Ubicación:** `frontend/js/api.js`

**Estado:** ✅ Correcto - Manejo de errores implementado.

### 4. Verificación de Token en Middleware

**Ubicación:** `backend/middlewares/autMiddleware.js`

**Estado:** ✅ Correcto - Verificación implementada.

---

## 📝 Comandos Útiles de Verificación

### Verificar Estructura de Base de Datos
```sql
USE swgarm;
SHOW TABLES;
DESCRIBE usuario;
DESCRIBE animal;
DESCRIBE solicitud;
```

### Verificar Usuarios Creados
```sql
SELECT idUsuario, email, rol FROM usuario;
```

### Verificar Animales
```sql
SELECT * FROM animal LIMIT 5;
```

### Verificar Solicitudes
```sql
SELECT * FROM solicitud LIMIT 5;
```

### Verificar Conexiones de Base de Datos
```sql
SHOW PROCESSLIST;
```

### Verificar Variables de Entorno en Node.js
```javascript
// En server.js o cualquier archivo
console.log(process.env.DB_HOST);
console.log(process.env.DB_NAME);
console.log(process.env.JWT_SECRET);
```

---

## 🚨 Checklist de Emergencia

Si algo no funciona:

1. **Verificar que MySQL esté corriendo:**
   ```bash
   # Windows
   sc query MySQL
   
   # Linux/Mac
   sudo service mysql status
   ```

2. **Verificar que Node.js esté instalado:**
   ```bash
   node --version
   npm --version
   ```

3. **Verificar que el servidor esté corriendo:**
   - Deberías ver mensajes en la consola sin errores
   - Puedes acceder a `http://localhost:3001/api`

4. **Verificar configuración:**
   - Archivo `.env` existe
   - Variables están correctas
   - Base de datos existe y tiene tablas

5. **Limpiar e instalar de nuevo:**
   ```bash
   rm -rf node_modules
   npm install
   ```

---

## ✅ Verificación Final

Antes de considerar que todo está listo:

- [ ] Servidor inicia sin errores
- [ ] Base de datos conecta correctamente
- [ ] Página principal carga (`http://localhost:3001`)
- [ ] Puedes registrarte como usuario
- [ ] Puedes iniciar sesión
- [ ] Como admin puedes ver paneles de administración
- [ ] Puedes crear un animal
- [ ] Puedes crear una solicitud de adopción
- [ ] Los reportes funcionan
- [ ] Las notificaciones funcionan

---

## 📞 Si Nada Funciona

1. Revisa la consola del servidor para ver errores específicos
2. Revisa la consola del navegador (F12) para ver errores de frontend
3. Verifica que todas las dependencias estén instaladas: `npm list`
4. Verifica que la base de datos tenga todas las tablas
5. Intenta ejecutar el proyecto desde cero siguiendo `INSTRUCCIONES_INSTALACION.md`

---

**Nota:** Este documento debe usarse junto con `INSTRUCCIONES_INSTALACION.md` para una instalación completa.

