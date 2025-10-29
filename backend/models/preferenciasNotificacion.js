const pool = require('../config/db');

const PreferenciasNotificacion = {
  async getByUsuario(idUsuario) {
    const [rows] = await pool.query(
      'SELECT * FROM preferencias_notificacion WHERE idUsuario = ?',
      [idUsuario]
    );
    return rows[0];
  },

  async createOrUpdate(idUsuario, preferencias) {
    const {
      notificarSolicitudAprobada = true,
      notificarSolicitudRechazada = true,
      notificarRecordatorioSeguimiento = true,
      notificarPorEmail = true,
      notificarEnSistema = true
    } = preferencias;

    const existente = await this.getByUsuario(idUsuario);
    
    if (existente) {
      await pool.query(
        `UPDATE preferencias_notificacion SET 
         notificarSolicitudAprobada = ?,
         notificarSolicitudRechazada = ?,
         notificarRecordatorioSeguimiento = ?,
         notificarPorEmail = ?,
         notificarEnSistema = ?
         WHERE idUsuario = ?`,
        [
          notificarSolicitudAprobada,
          notificarSolicitudRechazada,
          notificarRecordatorioSeguimiento,
          notificarPorEmail,
          notificarEnSistema,
          idUsuario
        ]
      );
      return await this.getByUsuario(idUsuario);
    } else {
      const [result] = await pool.query(
        `INSERT INTO preferencias_notificacion 
         (idUsuario, notificarSolicitudAprobada, notificarSolicitudRechazada, 
          notificarRecordatorioSeguimiento, notificarPorEmail, notificarEnSistema)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          idUsuario,
          notificarSolicitudAprobada,
          notificarSolicitudRechazada,
          notificarRecordatorioSeguimiento,
          notificarPorEmail,
          notificarEnSistema
        ]
      );
      return await this.getByUsuario(idUsuario);
    }
  }
};

module.exports = PreferenciasNotificacion;

