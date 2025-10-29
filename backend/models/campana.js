const pool = require('../config/db');

const Campana = {
  async getAll() {
    const [rows] = await pool.query(
      'SELECT * FROM campaña ORDER BY fechaCreacion DESC'
    );
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM campaña WHERE idCampaña = ?', [id]);
    return rows[0];
  },

  async create(data) {
    const { idUsuario, titulo, descripcion, responsable, fecha } = data;
    
    const [result] = await pool.query(
      `INSERT INTO campaña (idUsuario, titulo, descripcion, responsable, fecha) 
       VALUES (?, ?, ?, ?, ?)`,
      [idUsuario, titulo, descripcion || null, responsable || null, fecha || null]
    );
    
    return await this.getById(result.insertId);
  },

  async update(id, data) {
    const { titulo, descripcion, responsable, fecha } = data;
    
    await pool.query(
      'UPDATE campaña SET titulo=?, descripcion=?, responsable=?, fecha=? WHERE idCampaña=?',
      [titulo, descripcion || null, responsable || null, fecha || null, id]
    );
    
    return await this.getById(id);
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM campaña WHERE idCampaña = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Campana;

