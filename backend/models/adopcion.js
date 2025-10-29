const pool = require('../config/db');

const Adoptante = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM adoptante ORDER BY nombre ASC');
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM adoptante WHERE idAdoptante = ?', [id]);
    return rows[0];
  },

  async getByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM adoptante WHERE email = ?', [email]);
    return rows[0];
  },

  async create(data) {
    const { nombre, apellido, email, telefono, direccion, ocupacion } = data;
    const [result] = await pool.query(
      'INSERT INTO adoptante (nombre, apellido, email, telefono, direccion, ocupacion) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, apellido, email, telefono, direccion, ocupacion]
    );
    return { idAdoptante: result.insertId, ...data };
  },

  async update(id, data) {
    const { nombre, apellido, email, telefono, direccion, ocupacion } = data;
    await pool.query(
      'UPDATE adoptante SET nombre=?, apellido=?, email=?, telefono=?, direccion=?, ocupacion=? WHERE idAdoptante=?',
      [nombre, apellido, email, telefono, direccion, ocupacion, id]
    );
    return this.getById(id);
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM adoptante WHERE idAdoptante = ?', [id]);
    return result.affectedRows > 0;
  },
};

const Solicitud = {
  async getAll() {
    const [rows] = await pool.query(`
      SELECT s.*, a.nombre as nombreAdoptante, a.apellido as apellidoAdoptante, a.email,
             an.nombre as nombreAnimal, an.especie, an.raza
      FROM solicitud s 
      JOIN adoptante a ON s.idAdoptante = a.idAdoptante 
      JOIN animal an ON s.idAnimal = an.idAnimal 
      ORDER BY s.fecha DESC, s.idSolicitud DESC
    `);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(`
      SELECT s.*, a.nombre as nombreAdoptante, a.apellido as apellidoAdoptante, a.email,
             an.nombre as nombreAnimal, an.especie, an.raza
      FROM solicitud s 
      JOIN adoptante a ON s.idAdoptante = a.idAdoptante 
      JOIN animal an ON s.idAnimal = an.idAnimal 
      WHERE s.idSolicitud = ?
    `, [id]);
    return rows[0];
  },

  async getByAdoptanteId(adoptanteId) {
    const [rows] = await pool.query(`
      SELECT s.*, a.nombre as nombreAdoptante, a.apellido as apellidoAdoptante, a.email,
             an.nombre as nombreAnimal, an.especie, an.raza
      FROM solicitud s 
      JOIN adoptante a ON s.idAdoptante = a.idAdoptante 
      JOIN animal an ON s.idAnimal = an.idAnimal 
      WHERE s.idAdoptante = ? 
      ORDER BY s.fecha DESC, s.idSolicitud DESC
    `, [adoptanteId]);
    return rows;
  },

  async getByAnimalId(animalId) {
    const [rows] = await pool.query(`
      SELECT s.*, a.nombre as nombreAdoptante, a.apellido as apellidoAdoptante, a.email,
             an.nombre as nombreAnimal, an.especie, an.raza
      FROM solicitud s 
      JOIN adoptante a ON s.idAdoptante = a.idAdoptante 
      JOIN animal an ON s.idAnimal = an.idAnimal 
      WHERE s.idAnimal = ? 
      ORDER BY s.fecha DESC, s.idSolicitud DESC
    `, [animalId]);
    return rows;
  },

  async create(data) {
    const { idAdoptante, idAnimal, fecha, estado = 'Pendiente', puntajeEvaluacion = 0 } = data;
    const [result] = await pool.query(
      'INSERT INTO solicitud (idAdoptante, idAnimal, fecha, estado, puntajeEvaluacion) VALUES (?, ?, ?, ?, ?)',
      [idAdoptante, idAnimal, fecha, estado, puntajeEvaluacion]
    );
    return { idSolicitud: result.insertId, ...data };
  },

  async update(id, data) {
    const { estado, puntajeEvaluacion, motivoRechazo } = data;
    await pool.query(
      'UPDATE solicitud SET estado=?, puntajeEvaluacion=?, motivoRechazo=? WHERE idSolicitud=?',
      [estado, puntajeEvaluacion, motivoRechazo, id]
    );
    return this.getById(id);
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM solicitud WHERE idSolicitud = ?', [id]);
    return result.affectedRows > 0;
  },

  async verificarSolicitudExistente(idAdoptante, idAnimal) {
    const [rows] = await pool.query(
      'SELECT * FROM solicitud WHERE idAdoptante = ? AND idAnimal = ?',
      [idAdoptante, idAnimal]
    );
    return rows[0];
  },
};

const Adopcion = {
  async getAll() {
    const [rows] = await pool.query(`
      SELECT ad.*, s.idAnimal, s.idAdoptante, a.nombre AS nombreAdoptante, a.apellido AS apellidoAdoptante,
             an.nombre AS nombreAnimal, an.especie, u.email AS emailUsuario
      FROM adopcion ad
      JOIN solicitud s ON ad.idSolicitud = s.idSolicitud
      JOIN adoptante a ON s.idAdoptante = a.idAdoptante
      JOIN animal an ON s.idAnimal = an.idAnimal
      JOIN usuario u ON ad.idUsuario = u.idUsuario
      ORDER BY ad.fecha DESC, ad.idAdopcion DESC
    `);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(`
      SELECT ad.*, s.idAnimal, s.idAdoptante, a.nombre AS nombreAdoptante, a.apellido AS apellidoAdoptante,
             an.nombre AS nombreAnimal, an.especie, u.email AS emailUsuario
      FROM adopcion ad
      JOIN solicitud s ON ad.idSolicitud = s.idSolicitud
      JOIN adoptante a ON s.idAdoptante = a.idAdoptante
      JOIN animal an ON s.idAnimal = an.idAnimal
      JOIN usuario u ON ad.idUsuario = u.idUsuario
      WHERE ad.idAdopcion = ?
    `, [id]);
    return rows[0];
  },

  async create({ idSolicitud, idUsuario, fecha, contrato }) {
    const [result] = await pool.query(
      'INSERT INTO adopcion (idSolicitud, idUsuario, fecha, contrato) VALUES (?, ?, ?, ?)',
      [idSolicitud, idUsuario, fecha, contrato || null]
    );
    return { idAdopcion: result.insertId, idSolicitud, idUsuario, fecha, contrato: contrato || null };
  }
};

module.exports = { Adoptante, Solicitud, Adopcion };
