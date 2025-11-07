const pool = require('../config/db');

const Seguimiento = {
  async create({ idAdopcion, idAnimal, fechaProgramada, observaciones = null, idUsuarioCreador = null }) {
    // Validar que el animal esté adoptado
    const [animalRows] = await pool.query('SELECT estado FROM animal WHERE idAnimal = ?', [idAnimal]);
    if (animalRows.length === 0) {
      throw new Error('Animal no encontrado');
    }
    if (animalRows[0].estado !== 'Adoptado') {
      throw new Error('Solo se puede crear seguimiento para animales adoptados');
    }

    const [result] = await pool.query(
      'INSERT INTO seguimiento (idAdopcion, idAnimal, idUsuarioCreador, fechaProgramada, observaciones, estado) VALUES (?, ?, ?, ?, ?, ?)',
      [idAdopcion, idAnimal, idUsuarioCreador, fechaProgramada, observaciones, 'Pendiente']
    );
    return this.getById(result.insertId);
  },

  async getById(idSeguimiento) {
    const [rows] = await pool.query(`
      SELECT s.*, ad.fecha as fechaAdopcion, a.nombre as nombreAnimal, a.especie
      FROM seguimiento s
      JOIN adopcion ad ON s.idAdopcion = ad.idAdopcion
      JOIN animal a ON s.idAnimal = a.idAnimal
      WHERE s.idSeguimiento = ?
    `, [idSeguimiento]);
    return rows[0];
  },

  async getByAnimal(idAnimal) {
    const [rows] = await pool.query(`
      SELECT s.*, ad.fecha as fechaAdopcion, a.nombre as nombreAnimal, a.especie
      FROM seguimiento s
      JOIN adopcion ad ON s.idAdopcion = ad.idAdopcion
      JOIN animal a ON s.idAnimal = a.idAnimal
      WHERE s.idAnimal = ?
      ORDER BY COALESCE(s.fechaRealizada, s.fechaProgramada) DESC, s.idSeguimiento DESC
    `, [idAnimal]);
    return rows;
  },

  async getByAdopcion(idAdopcion) {
    const [rows] = await pool.query(`
      SELECT s.*, ad.fecha as fechaAdopcion, a.nombre as nombreAnimal, a.especie
      FROM seguimiento s
      JOIN adopcion ad ON s.idAdopcion = ad.idAdopcion
      JOIN animal a ON s.idAnimal = a.idAnimal
      WHERE s.idAdopcion = ?
      ORDER BY COALESCE(s.fechaRealizada, s.fechaProgramada) DESC, s.idSeguimiento DESC
    `, [idAdopcion]);
    return rows;
  },

  async getPendientesHasta(fecha) {
    const [rows] = await pool.query(
      'SELECT * FROM seguimiento WHERE estado = ? AND fechaProgramada <= ? AND recordatorioEnviado = 0',
      ['Pendiente', fecha]
    );
    return rows;
  },

  async getPendientes() {
    const [rows] = await pool.query(`
      SELECT s.*, 
             ad.fecha as fechaAdopcion, 
             a.nombre as nombreAnimal, 
             a.especie,
             COALESCE(
               NULLIF(adopt.nombre, ''),
               NULLIF(adopt.nombre, 'Pendiente'),
               (SELECT nombre FROM adoptante WHERE email = adopt.email 
                AND nombre IS NOT NULL AND nombre != '' AND nombre != 'Pendiente' 
                ORDER BY idAdoptante DESC LIMIT 1)
             ) as nombreAdoptante,
             COALESCE(
               NULLIF(adopt.apellido, ''),
               NULLIF(adopt.apellido, 'Pendiente'),
               (SELECT apellido FROM adoptante WHERE email = adopt.email 
                AND apellido IS NOT NULL AND apellido != '' AND apellido != 'Pendiente' 
                ORDER BY idAdoptante DESC LIMIT 1)
             ) as apellidoAdoptante,
             COALESCE(
               NULLIF(adopt.telefono, ''),
               (SELECT telefono FROM adoptante WHERE email = adopt.email 
                AND telefono IS NOT NULL AND telefono != '' 
                ORDER BY idAdoptante DESC LIMIT 1)
             ) as telefonoAdoptante
      FROM seguimiento s
      JOIN adopcion ad ON s.idAdopcion = ad.idAdopcion
      JOIN solicitud sol ON ad.idSolicitud = sol.idSolicitud
      JOIN adoptante adopt ON sol.idAdoptante = adopt.idAdoptante
      JOIN animal a ON s.idAnimal = a.idAnimal
      WHERE s.estado = ?
      ORDER BY s.fechaProgramada ASC, s.idSeguimiento ASC
    `, ['Pendiente']);
    return rows;
  },

  async getByUsuarioEmail(email) {
    const [rows] = await pool.query(`
      SELECT s.*, 
             ad.fecha as fechaAdopcion, 
             a.nombre as nombreAnimal, 
             a.especie,
             adopt.nombre as nombreAdoptante,
             adopt.apellido as apellidoAdoptante
      FROM seguimiento s
      JOIN adopcion ad ON s.idAdopcion = ad.idAdopcion
      JOIN solicitud sol ON ad.idSolicitud = sol.idSolicitud
      JOIN adoptante adopt ON sol.idAdoptante = adopt.idAdoptante
      JOIN animal a ON s.idAnimal = a.idAnimal
      WHERE adopt.email = ?
      ORDER BY COALESCE(s.fechaRealizada, s.fechaProgramada) DESC, s.idSeguimiento DESC
    `, [email]);
    return rows;
  },

  async completar(idSeguimiento, { fechaRealizada, observaciones }) {
    await pool.query(
      'UPDATE seguimiento SET fechaRealizada = ?, observaciones = ?, estado = ? WHERE idSeguimiento = ?',
      [fechaRealizada, observaciones, 'Completado', idSeguimiento]
    );
    return this.getById(idSeguimiento);
  },

  async marcarRecordatorioEnviado(ids) {
    if (!ids || ids.length === 0) return 0;
    const [res] = await pool.query(
      `UPDATE seguimiento SET recordatorioEnviado = 1 WHERE idSeguimiento IN (${ids.map(() => '?').join(',')})`,
      ids
    );
    return res.affectedRows;
  }
};

module.exports = Seguimiento;


