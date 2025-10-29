const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { email, password, rol = 'adoptante' } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Campos incompletos' });

    const existing = await User.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'El usuario ya existe' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create(email, hash, rol);
    res.status(201).json({ message: 'Usuario creado', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Verificar si la cuenta existe y está bloqueada
    const user = await User.findByEmail(email);
    
    if (!user) {
      // No revelar si el usuario existe o no por seguridad
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar si la cuenta está bloqueada y si puede desbloquearse
    const desbloqueada = await User.verificarYDesbloquearSiEsNecesario(email);
    if (!desbloqueada && user.cuentaBloqueada) {
      const fechaBloqueo = new Date(user.fechaBloqueo);
      const ahora = new Date();
      const minutosTranscurridos = Math.ceil((ahora - fechaBloqueo) / (1000 * 60));
      const minutosRestantes = Math.max(0, 30 - minutosTranscurridos);
      
      return res.status(403).json({ 
        error: 'Cuenta temporalmente bloqueada por múltiples intentos fallidos',
        minutosRestantes,
        mensaje: minutosRestantes > 0 
          ? `Intente nuevamente en ${minutosRestantes} minuto(s)`
          : 'La cuenta se desbloqueará automáticamente pronto'
      });
    }

    // Verificar contraseña
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      // Incrementar intentos fallidos
      const resultado = await User.incrementarIntentosFallidos(email);
      
      if (resultado.bloqueada) {
        return res.status(403).json({ 
          error: 'Cuenta bloqueada por múltiples intentos fallidos',
          minutosRestantes: 30,
          mensaje: 'Su cuenta ha sido bloqueada temporalmente. Intente nuevamente en 30 minutos.'
        });
      }
      
      const intentosRestantes = 3 - resultado.intentosFallidos;
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        intentosRestantes: intentosRestantes > 0 ? intentosRestantes : 0
      });
    }

    // Login exitoso - resetear intentos
    await User.resetearIntentos(email);

    // Generar token
    const token = jwt.sign(
      { id: user.idUsuario, rol: user.rol },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '8h' }
    );

    res.json({ 
      token, 
      user: { id: user.idUsuario, email: user.email, rol: user.rol } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en login' });
  }
};

exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.getAll();
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

exports.actualizarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    if (!rol) {
      return res.status(400).json({ error: 'El rol es requerido' });
    }

    // Validar que el usuario existe
    const usuarioActual = await User.findById(id);
    if (!usuarioActual) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar que no se está cambiando el rol del mismo admin que hace la acción
    if (usuarioActual.idUsuario === req.user.id && usuarioActual.rol === 'administrador' && rol !== 'administrador') {
      return res.status(400).json({ error: 'No puede cambiar su propio rol de administrador' });
    }

    // Actualizar rol
    const usuarioActualizado = await User.updateRol(id, rol);

    res.json({
      message: `Rol del usuario actualizado exitosamente`,
      usuario: {
        idUsuario: usuarioActualizado.idUsuario,
        email: usuarioActualizado.email,
        rol: usuarioActualizado.rol
      }
    });
  } catch (error) {
    console.error(error);
    if (error.message.includes('Rol inválido')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al actualizar rol del usuario' });
    }
  }
};
