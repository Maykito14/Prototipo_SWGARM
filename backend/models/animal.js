const pool = require('../config/db');

const Animal = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM animal ORDER BY idAnimal DESC');
    return rows;
  },

  async getDisponibles() {
    const [rows] = await pool.query('SELECT * FROM animal WHERE estado = ? ORDER BY fechaIngreso DESC', ['Disponible']);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM animal WHERE idAnimal = ?', [id]);
    return rows[0];
  },

  async create(data) {
    const { nombre, especie, raza, edad, estado, fechaIngreso, descripcion, foto, puntajeMinimo } = data;
    const [result] = await pool.query(
      'INSERT INTO animal (nombre, especie, raza, edad, estado, fechaIngreso, descripcion, foto, puntajeMinimo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, especie, raza, edad, estado, fechaIngreso, descripcion, foto || null, puntajeMinimo || 0]
    );
    return { idAnimal: result.insertId, ...data };
  },

  async update(id, data) {
    const { nombre, especie, raza, edad, estado, fechaIngreso, descripcion, foto, puntajeMinimo } = data;
    await pool.query(
      'UPDATE animal SET nombre=?, especie=?, raza=?, edad=?, estado=?, fechaIngreso=?, descripcion=?, foto=?, puntajeMinimo=? WHERE idAnimal=?',
      [nombre, especie, raza, edad, estado, fechaIngreso, descripcion, foto || null, puntajeMinimo || 0, id]
    );
    return this.getById(id);
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM animal WHERE idAnimal = ?', [id]);
    return result.affectedRows > 0;
  },

  async findByName(nombre) {
    const [rows] = await pool.query('SELECT * FROM animal WHERE nombre = ?', [nombre]);
    return rows[0];
  },
};

module.exports = Animal;

