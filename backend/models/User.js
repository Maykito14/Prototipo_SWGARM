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
};

module.exports = User;
