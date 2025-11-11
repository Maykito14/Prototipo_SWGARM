const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');

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

    // Verificar bloqueo permanente
    if (user.bloqueoPermanente) {
      return res.status(403).json({ 
        error: 'Cuenta bloqueada permanentemente por un administrador',
        mensaje: 'Su cuenta ha sido bloqueada permanentemente. Contacte al administrador para más información.'
      });
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

exports.blanquearPassword = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el usuario existe
    const usuarioActual = await User.findById(id);
    if (!usuarioActual) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar que no se está blanqueando la contraseña del mismo admin
    if (usuarioActual.idUsuario === req.user.id) {
      return res.status(400).json({ error: 'No puede blanquear su propia contraseña' });
    }

    // Blanquear contraseña
    const passwordTemporal = await User.blanquearPassword(id);

    res.json({
      message: 'Contraseña blanqueada exitosamente',
      passwordTemporal: passwordTemporal,
      usuario: {
        idUsuario: usuarioActual.idUsuario,
        email: usuarioActual.email,
        cuentaBloqueada: false // Se desbloquea si estaba bloqueada
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al blanquear contraseña' });
  }
};

exports.bloquearPermanentemente = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el usuario existe
    const usuarioActual = await User.findById(id);
    if (!usuarioActual) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar que no se está bloqueando a sí mismo
    if (usuarioActual.idUsuario === req.user.id) {
      return res.status(400).json({ error: 'No puede bloquear su propia cuenta' });
    }

    // Validar que no se está bloqueando a otro administrador
    if (usuarioActual.rol === 'administrador') {
      return res.status(400).json({ error: 'No se puede bloquear permanentemente a otro administrador' });
    }

    // Bloquear permanentemente
    const usuarioBloqueado = await User.bloquearPermanentemente(id);

    res.json({
      message: 'Cuenta bloqueada permanentemente',
      usuario: {
        idUsuario: usuarioBloqueado.idUsuario,
        email: usuarioBloqueado.email,
        bloqueoPermanente: true
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al bloquear cuenta permanentemente' });
  }
};

exports.desbloquearPermanentemente = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el usuario existe
    const usuarioActual = await User.findById(id);
    if (!usuarioActual) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Desbloquear permanentemente
    const usuarioDesbloqueado = await User.desbloquearPermanentemente(id);

    res.json({
      message: 'Cuenta desbloqueada exitosamente',
      usuario: {
        idUsuario: usuarioDesbloqueado.idUsuario,
        email: usuarioDesbloqueado.email,
        bloqueoPermanente: false
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al desbloquear cuenta' });
  }
};

exports.solicitarRecuperacionPassword = async (req, res) => {
  try {
    const emailRaw = (req.body.email || '').trim();
    if (!emailRaw) {
      return res.status(400).json({ error: 'Debe proporcionar un correo electrónico' });
    }

    const email = emailRaw.toLowerCase();
    const respuestaGenerica = {
      message: 'Si el correo está registrado, enviaremos un código de recuperación válido por 1 hora.',
      expiresInMinutes: 60,
    };

    const usuario = await User.findByEmail(email);
    if (!usuario) {
      // Respuesta genérica para no revelar existencia del usuario
      return res.json(respuestaGenerica);
    }

    await PasswordResetToken.invalidateTokensByEmail(email);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiracion = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await PasswordResetToken.create(email, tokenHash, expiracion);

    const respuesta = { ...respuestaGenerica };
    if ((process.env.NODE_ENV || 'development') !== 'production') {
      respuesta.debugToken = token;
    }

    console.info(`[RecuperacionPassword] Token generado para ${email}. Expira en ${expiracion.toISOString()}`);

    res.json(respuesta);
  } catch (error) {
    console.error('Error al solicitar recuperación de contraseña:', error);
    res.status(500).json({ error: 'Error al solicitar recuperación de contraseña' });
  }
};

exports.restablecerPassword = async (req, res) => {
  try {
    const emailRaw = (req.body.email || '').trim();
    const tokenRaw = (req.body.token || '').trim();
    const nuevaPassword = (req.body.nuevaPassword || '').trim();
    const confirmarPassword = (req.body.confirmarPassword || '').trim();

    if (!emailRaw || !tokenRaw || !nuevaPassword || !confirmarPassword) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (nuevaPassword !== confirmarPassword) {
      return res.status(400).json({ error: 'La nueva contraseña y su confirmación no coinciden' });
    }

    if (nuevaPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const email = emailRaw.toLowerCase();
    const usuario = await User.findByEmail(email);

    if (!usuario) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const tokenHash = crypto.createHash('sha256').update(tokenRaw).digest('hex');
    const registro = await PasswordResetToken.findValidByEmailAndHash(email, tokenHash);

    if (!registro) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
    await User.actualizarPasswordPorEmail(email, hashedPassword);
    await PasswordResetToken.markAsUsed(registro.idToken);

    res.json({ message: 'Contraseña restablecida correctamente. Ya puede iniciar sesión.' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
};
