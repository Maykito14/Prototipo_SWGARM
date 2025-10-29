const pool = require('../config/db');

const EstadoAnimal = {
  async getAll() {
    const [rows] = await pool.query(`
      SELECT ea.*, a.nombre as nombreAnimal, a.especie 
      FROM estado_animal ea 
      JOIN animal a ON ea.idAnimal = a.idAnimal 
      ORDER BY ea.fechaCambio DESC, ea.idEstado DESC
    `);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(`
      SELECT ea.*, a.nombre as nombreAnimal, a.especie 
      FROM estado_animal ea 
      JOIN animal a ON ea.idAnimal = a.idAnimal 
      WHERE ea.idEstado = ?
    `, [id]);
    return rows[0];
  },

  async getByAnimalId(animalId) {
    const [rows] = await pool.query(`
      SELECT ea.*, a.nombre as nombreAnimal, a.especie 
      FROM estado_animal ea 
      JOIN animal a ON ea.idAnimal = a.idAnimal 
      WHERE ea.idAnimal = ? 
      ORDER BY ea.fechaCambio DESC, ea.idEstado DESC
    `, [animalId]);
    return rows;
  },

  async create(data) {
    const { idAnimal, estadoAnterior, estadoNuevo, fechaCambio, motivo, usuario } = data;
    const [result] = await pool.query(
      'INSERT INTO estado_animal (idAnimal, estadoAnterior, estadoNuevo, fechaCambio, motivo, usuario) VALUES (?, ?, ?, ?, ?, ?)',
      [idAnimal, estadoAnterior, estadoNuevo, fechaCambio, motivo, usuario]
    );
    return { idEstado: result.insertId, ...data };
  },

  async updateAnimalStatus(animalId, nuevoEstado, motivo, usuario) {
    // Obtener estado actual del animal
    const [animalRows] = await pool.query('SELECT estado FROM animal WHERE idAnimal = ?', [animalId]);
    if (animalRows.length === 0) {
      throw new Error('Animal no encontrado');
    }
    
    const estadoAnterior = animalRows[0].estado;
    
    // Validar transición de estado
    if (!this.validarTransicionEstado(estadoAnterior, nuevoEstado)) {
      throw new Error(`Transición no válida: ${estadoAnterior} → ${nuevoEstado}`);
    }

    // Actualizar estado en tabla animal
    await pool.query(
      'UPDATE animal SET estado = ? WHERE idAnimal = ?',
      [nuevoEstado, animalId]
    );

    // Registrar cambio en historial
    const cambioEstado = await this.create({
      idAnimal,
      estadoAnterior,
      estadoNuevo: nuevoEstado,
      fechaCambio: new Date().toISOString().split('T')[0],
      motivo: motivo || 'Cambio de estado',
      usuario
    });

    return {
      animal: { idAnimal, estadoAnterior, estadoNuevo: nuevoEstado },
      historial: cambioEstado
    };
  },

  validarTransicionEstado(estadoAnterior, estadoNuevo) {
    const transicionesValidas = {
      'Disponible': ['En proceso', 'En tratamiento', 'Adoptado'],
      'En proceso': ['Disponible', 'Adoptado'],
      'En tratamiento': ['Disponible', 'En proceso'],
      'Adoptado': [] // Una vez adoptado, no puede cambiar de estado
    };

    return transicionesValidas[estadoAnterior]?.includes(estadoNuevo) || false;
  },

  async getEstadosDisponibles(estadoActual) {
    const transicionesValidas = {
      'Disponible': ['En proceso', 'En tratamiento', 'Adoptado'],
      'En proceso': ['Disponible', 'Adoptado'],
      'En tratamiento': ['Disponible', 'En proceso'],
      'Adoptado': []
    };

    return transicionesValidas[estadoActual] || [];
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM estado_animal WHERE idEstado = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = EstadoAnimal;
