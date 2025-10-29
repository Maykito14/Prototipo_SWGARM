const pool = require('../config/db');

const Salud = {
  async getAll() {
    const [rows] = await pool.query(`
      SELECT s.*, a.nombre as nombreAnimal, a.especie 
      FROM salud s 
      JOIN animal a ON s.idAnimal = a.idAnimal 
      ORDER BY s.fechaControl DESC, s.idSalud DESC
    `);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(`
      SELECT s.*, a.nombre as nombreAnimal, a.especie 
      FROM salud s 
      JOIN animal a ON s.idAnimal = a.idAnimal 
      WHERE s.idSalud = ?
    `, [id]);
    return rows[0];
  },

  async getByAnimalId(animalId) {
    const [rows] = await pool.query(`
      SELECT s.*, a.nombre as nombreAnimal, a.especie 
      FROM salud s 
      JOIN animal a ON s.idAnimal = a.idAnimal 
      WHERE s.idAnimal = ? 
      ORDER BY s.fechaControl DESC, s.idSalud DESC
    `, [animalId]);
    return rows;
  },

  async create(data) {
    const { idAnimal, vacunas, tratamientos, veterinario, fechaControl, observaciones } = data;
    const [result] = await pool.query(
      'INSERT INTO salud (idAnimal, vacunas, tratamientos, veterinario, fechaControl, observaciones) VALUES (?, ?, ?, ?, ?, ?)',
      [idAnimal, vacunas, tratamientos, veterinario, fechaControl, observaciones]
    );
    return { idSalud: result.insertId, ...data };
  },

  async update(id, data) {
    const { vacunas, tratamientos, veterinario, fechaControl, observaciones } = data;
    await pool.query(
      'UPDATE salud SET vacunas=?, tratamientos=?, veterinario=?, fechaControl=?, observaciones=? WHERE idSalud=?',
      [vacunas, tratamientos, veterinario, fechaControl, observaciones, id]
    );
    return this.getById(id);
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM salud WHERE idSalud = ?', [id]);
    return result.affectedRows > 0;
  },

  async getLatestByAnimal(animalId) {
    const [rows] = await pool.query(`
      SELECT s.*, a.nombre as nombreAnimal, a.especie 
      FROM salud s 
      JOIN animal a ON s.idAnimal = a.idAnimal 
      WHERE s.idAnimal = ? 
      ORDER BY s.fechaControl DESC, s.idSalud DESC 
      LIMIT 1
    `, [animalId]);
    return rows[0];
  },
};

module.exports = Salud;
