const pool = require('../config/db');

const Notificacion = {
  async create(data) {
    const { idUsuario, tipo, mensaje, idSolicitud = null, idSeguimiento = null } = data;
    
    const [result] = await pool.query(
      `INSERT INTO notificacion (idUsuario, tipo, mensaje, idSolicitud, idSeguimiento) 
       VALUES (?, ?, ?, ?, ?)`,
      [idUsuario, tipo, mensaje, idSolicitud, idSeguimiento]
    );
    
    return await this.getById(result.insertId);
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM notificacion WHERE idNotificacion = ?', [id]);
    return rows[0];
  },

  async getByUsuario(idUsuario) {
    const [rows] = await pool.query(
      'SELECT * FROM notificacion WHERE idUsuario = ? ORDER BY fechaEnvio DESC',
      [idUsuario]
    );
    return rows;
  },

  async getNoLeidasByUsuario(idUsuario) {
    const [rows] = await pool.query(
      'SELECT * FROM notificacion WHERE idUsuario = ? AND leido = 0 ORDER BY fechaEnvio DESC',
      [idUsuario]
    );
    return rows;
  },

  async marcarComoLeida(idNotificacion) {
    await pool.query(
      'UPDATE notificacion SET leido = 1, fechaLeido = NOW() WHERE idNotificacion = ?',
      [idNotificacion]
    );
    return await this.getById(idNotificacion);
  },

  async marcarTodasComoLeidas(idUsuario) {
    await pool.query(
      'UPDATE notificacion SET leido = 1, fechaLeido = NOW() WHERE idUsuario = ? AND leido = 0',
      [idUsuario]
    );
  },

  async contarNoLeidas(idUsuario) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM notificacion WHERE idUsuario = ? AND leido = 0',
      [idUsuario]
    );
    return rows[0].count;
  },

  async delete(idNotificacion) {
    const [result] = await pool.query('DELETE FROM notificacion WHERE idNotificacion = ?', [idNotificacion]);
    return result.affectedRows > 0;
  }
};

module.exports = Notificacion;

