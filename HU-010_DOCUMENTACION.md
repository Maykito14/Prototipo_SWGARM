# HU-010: Autenticación de Usuarios

## 📋 Descripción
Como usuario quiero iniciar sesión de forma segura para acceder a mi perfil y funcionalidades restringidas.

## ✅ Criterios de Aceptación Implementados

### 1. Acceso con credenciales válidas
- ✅ Implementado: Validación completa de email y contraseña.
- ✅ Verificación: Comparación segura con bcrypt.
- ✅ Respuesta: Token JWT con información del usuario y rol.
- ✅ Redirección: Automática según rol (administrador → index, adoptante → animales).

### 2. Errores para datos inválidos
- ✅ Implementado: Mensajes de error claros y específicos.
- ✅ Validación: Campos requeridos verificados tanto en frontend como backend.
- ✅ Seguridad: No se revela si el usuario existe o no (mensaje genérico).
- ✅ Información: Muestra intentos restantes antes del bloqueo.

### 3. Bloqueo temporal después de 3 intentos fallidos
- ✅ Implementado: Sistema completo de conteo de intentos fallidos.
- ✅ Bloqueo automático: Después de 3 intentos fallidos, la cuenta se bloquea.
- ✅ Duración: Bloqueo temporal de 30 minutos.
- ✅ Desbloqueo: Automático después del tiempo transcurrido.
- ✅ Reseteo: Los intentos se resetean al iniciar sesión correctamente.

## 🛠️ Funcionalidades Implementadas

### Backend
- ✅ Modelo actualizado (`backend/models/User.js`)
  - `incrementarIntentosFallidos()`: Incrementa contador y bloquea si alcanza 3.
  - `resetearIntentos()`: Resetea contador y desbloquea cuenta.
  - `verificarYDesbloquearSiEsNecesario()`: Verifica tiempo transcurrido y desbloquea automáticamente.

- ✅ Controlador actualizado (`backend/controllers/userController.js`)
  - Validación de campos requeridos.
  - Verificación de cuenta bloqueada antes de autenticar.
  - Incremento de intentos fallidos en caso de contraseña incorrecta.
  - Mensajes específicos según estado (bloqueado, intentos restantes).
  - Reseteo automático de intentos en login exitoso.

- ✅ Base de datos (`update_usuario_bloqueo.sql`)
  - Campos agregados: `intentosFallidos`, `cuentaBloqueada`, `fechaBloqueo`.

### Frontend
- ✅ Login mejorado (`frontend/js/login.js`)
  - Validación de campos en frontend.
  - Manejo de errores específicos con mensajes claros.
  - Información sobre intentos restantes.
  - Mensajes de bloqueo con tiempo restante.

- ✅ API cliente actualizado (`frontend/js/api.js`)
  - Método `request()` mejorado para capturar datos adicionales de error.
  - Propagación de `intentosRestantes` y `minutosRestantes` en errores.

## 🔒 Rutas API

### Públicas
- `POST /api/usuarios/login` - Iniciar sesión (con protección de bloqueo).
- `POST /api/usuarios/register` - Registrar nuevo usuario.

## 🧪 Casos de Prueba

### ✅ Casos Exitosos
1. Login con credenciales válidas → Token JWT generado, redirección según rol.
2. Login después de intentos fallidos previos → Intentos reseteados automáticamente.
3. Desbloqueo automático → Cuenta desbloqueada después de 30 minutos.

### ❌ Casos de Error
1. Email o contraseña inválidos → Mensaje genérico "Credenciales inválidas".
2. Primer intento fallido → Mensaje con "2 intentos restantes".
3. Segundo intento fallido → Mensaje con "1 intento restante".
4. Tercer intento fallido → Cuenta bloqueada, mensaje con tiempo de espera (30 min).
5. Intento de login con cuenta bloqueada → Mensaje con minutos restantes.
6. Campos vacíos → Validación en frontend y backend.

## 📊 Estructura de Datos

### Tabla `usuario` (Actualizada)
```sql
ALTER TABLE `usuario` 
ADD COLUMN `intentosFallidos` INT NOT NULL DEFAULT 0,
ADD COLUMN `cuentaBloqueada` TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN `fechaBloqueo` DATETIME DEFAULT NULL;
```

### Flujo de Bloqueo
1. Usuario intenta login con contraseña incorrecta.
2. Sistema incrementa `intentosFallidos` en 1.
3. Si `intentosFallidos >= 3`:
   - `cuentaBloqueada = 1`
   - `fechaBloqueo = NOW()`
4. Bloqueo dura 30 minutos.
5. Sistema verifica automáticamente el tiempo al intentar login.
6. Si pasaron 30 minutos, desbloquea automáticamente.

## 🎨 Interfaz de Usuario

### Formulario de Login
- Campos: Email y Contraseña (ambos requeridos).
- Validación: Verificación en tiempo real antes de enviar.
- Mensajes de error:
  - Campos vacíos: "Por favor, complete todos los campos".
  - Credenciales inválidas: "Credenciales inválidas. Le quedan X intento(s) antes del bloqueo".
  - Cuenta bloqueada: "Cuenta bloqueada temporalmente. Intente nuevamente en X minuto(s)".

## 📁 Archivos Creados/Modificados

### Nuevos Archivos
- `update_usuario_bloqueo.sql` - Script para agregar campos de bloqueo.

### Archivos Modificados
- `backend/models/User.js` - Métodos de bloqueo y desbloqueo.
- `backend/controllers/userController.js` - Lógica completa de autenticación con bloqueo.
- `frontend/js/login.js` - Manejo mejorado de errores y validaciones.
- `frontend/js/api.js` - Propagación de datos adicionales en errores.

## 🚀 Instrucciones de Uso

### Para Usuarios
1. Navegar a "Iniciar sesión".
2. Ingresar email y contraseña.
3. Si hay error, el sistema indicará:
   - Intentos restantes antes del bloqueo (si aplica).
   - Tiempo de espera si la cuenta está bloqueada.
4. Después de 30 minutos, intentar nuevamente.

### Comportamiento del Sistema
- **3 intentos fallidos** → Cuenta bloqueada por 30 minutos.
- **Login exitoso** → Intentos reseteados automáticamente.
- **Desbloqueo automático** → No requiere intervención del administrador.

## 🔐 Seguridad Implementada

- ✅ No se revela si el usuario existe o no (mensaje genérico en ambos casos).
- ✅ Contraseñas hasheadas con bcrypt.
- ✅ Tokens JWT con expiración de 8 horas.
- ✅ Bloqueo temporal para prevenir ataques de fuerza bruta.
- ✅ Reseteo automático de intentos en login exitoso.

## 🔄 Integración con Otras HU
- **HU-009:** Los usuarios autenticados pueden acceder a funcionalidades según su rol.
- **HU-005/HU-006/HU-007/HU-008:** Requieren autenticación de administrador.
- **HU-004:** Los adoptantes pueden postularse sin necesidad de autenticación.

---

**Estado:** ✅ COMPLETADO  
**Fecha:** 2025-10-29  
**Desarrollador:** Asistente AI  
**Revisión:** Pendiente

