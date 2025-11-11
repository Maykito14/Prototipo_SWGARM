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
    try {
      const [rows] = await pool.query(`
        SELECT s.idSolicitud, s.idAdoptante, s.idAnimal, s.fecha, 
               COALESCE(s.estado, 'Pendiente') as estado,
               COALESCE(s.puntajeEvaluacion, 0) as puntajeEvaluacion,
               s.motivoRechazo, s.respuestasFormulario,
               a.nombre as nombreAdoptante, a.apellido as apellidoAdoptante, 
               COALESCE(a.email, '') as email,
               an.nombre as nombreAnimal, an.especie, an.raza
        FROM solicitud s 
        LEFT JOIN adoptante a ON s.idAdoptante = a.idAdoptante 
        LEFT JOIN animal an ON s.idAnimal = an.idAnimal 
        ORDER BY s.fecha DESC, s.idSolicitud DESC
      `);
      console.log(`Consulta ejecutada. Filas encontradas: ${rows.length}`);
      return rows || [];
    } catch (error) {
      console.error('Error en Solicitud.getAll():', error);
      throw error;
    }
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
    const { idAdoptante, idAnimal, fecha, estado = 'Pendiente', puntajeEvaluacion = 0, respuestasFormulario = null } = data;
    const [result] = await pool.query(
      'INSERT INTO solicitud (idAdoptante, idAnimal, fecha, estado, puntajeEvaluacion, respuestasFormulario) VALUES (?, ?, ?, ?, ?, ?)',
      [idAdoptante, idAnimal, fecha, estado, puntajeEvaluacion, respuestasFormulario]
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
      SELECT ad.*, s.idAnimal, s.idAdoptante, s.estado AS estadoSolicitud,
             a.nombre AS nombreAdoptante, a.apellido AS apellidoAdoptante,
             an.nombre AS nombreAnimal, an.especie, u.email AS emailUsuario
      FROM adopcion ad
      JOIN solicitud s ON ad.idSolicitud = s.idSolicitud
      JOIN adoptante a ON s.idAdoptante = a.idAdoptante
      JOIN animal an ON s.idAnimal = an.idAnimal
      JOIN usuario u ON ad.idUsuario = u.idUsuario
      WHERE ad.activa = 1
      ORDER BY ad.fecha DESC, ad.idAdopcion DESC
    `);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(`
      SELECT ad.*, s.idAnimal, s.idAdoptante, s.estado AS estadoSolicitud,
             a.nombre AS nombreAdoptante, a.apellido AS apellidoAdoptante,
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

  async getByAnimalId(animalId) {
    const [rows] = await pool.query(`
      SELECT ad.*, s.idAnimal, s.idAdoptante, s.estado AS estadoSolicitud,
             a.nombre AS nombreAdoptante, a.apellido AS apellidoAdoptante,
             an.nombre AS nombreAnimal, an.especie, u.email AS emailUsuario
      FROM adopcion ad
      JOIN solicitud s ON ad.idSolicitud = s.idSolicitud
      JOIN adoptante a ON s.idAdoptante = a.idAdoptante
      JOIN animal an ON s.idAnimal = an.idAnimal
      JOIN usuario u ON ad.idUsuario = u.idUsuario
      WHERE s.idAnimal = ? AND ad.activa = 1
      ORDER BY ad.fecha DESC, ad.idAdopcion DESC
    `, [animalId]);
    return rows;
  },

  async create({ idSolicitud, idUsuario, fecha, contrato }) {
    const [result] = await pool.query(
      'INSERT INTO adopcion (idSolicitud, idUsuario, fecha, contrato, activa) VALUES (?, ?, ?, ?, 1)',
      [idSolicitud, idUsuario, fecha, contrato || null]
    );
    return { idAdopcion: result.insertId, idSolicitud, idUsuario, fecha, contrato: contrato || null, activa: 1 };
  },

  async actualizarActiva(idAdopcion, activa) {
    await pool.query(
      'UPDATE adopcion SET activa = ? WHERE idAdopcion = ?',
      [activa ? 1 : 0, idAdopcion]
    );
  },

  async actualizarActivaPorSolicitud(idSolicitud, activa) {
    await pool.query(
      'UPDATE adopcion SET activa = ? WHERE idSolicitud = ?',
      [activa ? 1 : 0, idSolicitud]
    );
  }
};

const Seguimiento = {
  async getByAdoptanteId(idAdoptante) {
    const [rows] = await pool.query(`
      SELECT 
        seg.*,
        sol.idAdoptante,
        sol.estado AS estadoSolicitud,
        an.nombre AS nombreAnimal,
        an.especie,
        an.raza,
        adop.nombre AS nombreAdoptante,
        adop.apellido AS apellidoAdoptante,
        adop.telefono
      FROM seguimiento seg
      INNER JOIN adopcion ado ON seg.idAdopcion = ado.idAdopcion
      INNER JOIN solicitud sol ON ado.idSolicitud = sol.idSolicitud
      INNER JOIN adoptante adop ON sol.idAdoptante = adop.idAdoptante
      INNER JOIN animal an ON seg.idAnimal = an.idAnimal
      WHERE sol.idAdoptante = ?
      ORDER BY seg.fechaProgramada DESC, seg.idSeguimiento DESC
    `, [idAdoptante]);
    return rows;
  }
};

module.exports = { Adoptante, Solicitud, Adopcion, Seguimiento };
