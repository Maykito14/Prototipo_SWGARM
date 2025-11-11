const pool = require('../config/db');

const User = {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
    return rows[0];
  },

  async create(email, password, rol = 'adoptante') {
    const [result] = await pool.query(
      'INSERT INTO usuario (email, password, rol) VALUES (?, ?, ?)',
      [email, password, rol]
    );
    return { idUsuario: result.insertId, email, rol };
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM usuario WHERE idUsuario = ?', [id]);
    return rows[0];
  },

  async incrementarIntentosFallidos(email) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    
    const nuevosIntentos = (user.intentosFallidos || 0) + 1;
    const debeBloquear = nuevosIntentos >= 3;
    
    await pool.query(
      `UPDATE usuario SET intentosFallidos = ?, cuentaBloqueada = ?, 
       fechaBloqueo = ? WHERE email = ?`,
      [
        nuevosIntentos, 
        debeBloquear ? 1 : 0,
        debeBloquear ? new Date() : null,
        email
      ]
    );
    
    return { intentosFallidos: nuevosIntentos, bloqueada: debeBloquear };
  },

  async resetearIntentos(email) {
    await pool.query(
      'UPDATE usuario SET intentosFallidos = 0, cuentaBloqueada = 0, fechaBloqueo = NULL WHERE email = ?',
      [email]
    );
  },

  async verificarYDesbloquearSiEsNecesario(email) {
    const user = await this.findByEmail(email);
    if (!user || !user.cuentaBloqueada) return false;
    
    // No desbloquear si está bloqueado permanentemente
    if (user.bloqueoPermanente) return false;
    
    // Desbloquear después de 30 minutos
    if (user.fechaBloqueo) {
      const fechaBloqueo = new Date(user.fechaBloqueo);
      const ahora = new Date();
      const minutosTranscurridos = (ahora - fechaBloqueo) / (1000 * 60);
      
      if (minutosTranscurridos >= 30) {
        await this.resetearIntentos(email);
        return true; // Se desbloqueó automáticamente
      }
    }
    
    return false; // Sigue bloqueada
  },

  async getAll() {
    const [rows] = await pool.query(`
      SELECT 
        u.idUsuario, 
        u.email, 
        u.rol,
        u.cuentaBloqueada,
        u.bloqueoPermanente,
        a.nombre,
        a.apellido,
        a.telefono,
        a.direccion
      FROM usuario u
      LEFT JOIN adoptante a ON u.email = a.email
      ORDER BY u.email ASC
    `);
    return rows;
  },

  async updateRol(idUsuario, nuevoRol) {
    const rolesValidos = ['administrador', 'adoptante'];
    if (!rolesValidos.includes(nuevoRol)) {
      throw new Error(`Rol inválido. Roles válidos: ${rolesValidos.join(', ')}`);
    }

    await pool.query(
      'UPDATE usuario SET rol = ? WHERE idUsuario = ?',
      [nuevoRol, idUsuario]
    );
    
    return await this.findById(idUsuario);
  },

  async blanquearPassword(idUsuario) {
    const bcrypt = require('bcrypt');
    // Contraseña temporal fija
    const passwordTemporal = 'corazondetrapo';
    const hash = await bcrypt.hash(passwordTemporal, 10);
    
    // Obtener usuario para verificar si está bloqueado
    const user = await this.findById(idUsuario);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Si está bloqueado, desbloquearlo también
    if (user.cuentaBloqueada) {
      await pool.query(
        'UPDATE usuario SET password = ?, intentosFallidos = 0, cuentaBloqueada = 0, fechaBloqueo = NULL WHERE idUsuario = ?',
        [hash, idUsuario]
      );
    } else {
      await pool.query(
        'UPDATE usuario SET password = ? WHERE idUsuario = ?',
        [hash, idUsuario]
      );
    }
    
    return passwordTemporal;
  },

  async bloquearPermanentemente(idUsuario) {
    await pool.query(
      'UPDATE usuario SET bloqueoPermanente = 1, cuentaBloqueada = 1 WHERE idUsuario = ?',
      [idUsuario]
    );
    return await this.findById(idUsuario);
  },

  async desbloquearPermanentemente(idUsuario) {
    await pool.query(
      'UPDATE usuario SET bloqueoPermanente = 0, cuentaBloqueada = 0, fechaBloqueo = NULL, intentosFallidos = 0 WHERE idUsuario = ?',
      [idUsuario]
    );
    return await this.findById(idUsuario);
  },

  async actualizarPasswordPorEmail(email, hashedPassword) {
    await pool.query(
      `UPDATE usuario
       SET password = ?, intentosFallidos = 0, cuentaBloqueada = 0, fechaBloqueo = NULL
       WHERE email = ?`,
      [hashedPassword, email]
    );
    return await this.findByEmail(email);
  },
};

module.exports = User;
