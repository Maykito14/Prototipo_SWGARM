const pool = require('../config/db');

const EstadoAnimal = {
  async getAll() {
    // Consulta simple para obtener todos los cambios de estado
    const [rows] = await pool.query(`
      SELECT 
        ea.*, 
        a.nombre as nombreAnimal, 
        a.especie
      FROM estado_animal ea 
      JOIN animal a ON ea.idAnimal = a.idAnimal 
      ORDER BY ea.fechaCambio DESC, ea.idEstado DESC
    `);
    
    // Para cada cambio, buscar el adoptante relacionado
    const rowsWithAdoptante = await Promise.all(rows.map(async (row) => {
      // Buscar la solicitud aprobada más reciente antes o en la fecha del cambio
      const [solicitud] = await pool.query(`
        SELECT s.idSolicitud, s.idAdoptante, s.fecha
        FROM solicitud s
        WHERE s.idAnimal = ?
          AND s.estado = 'Aprobada'
          AND s.fecha <= ?
        ORDER BY s.fecha DESC, s.idSolicitud DESC
        LIMIT 1
      `, [row.idAnimal, row.fechaCambio]);
      
      if (solicitud.length > 0) {
        const [adoptante] = await pool.query(`
          SELECT nombre, apellido, email
          FROM adoptante
          WHERE idAdoptante = ?
        `, [solicitud[0].idAdoptante]);
        
        if (adoptante.length > 0) {
          return {
            ...row,
            nombreAdoptante: `${adoptante[0].nombre} ${adoptante[0].apellido}`,
            emailAdoptante: adoptante[0].email || ''
          };
        }
      }
      
      // Si no hay adoptante, mostrar información del usuario o sistema
      let nombreAdoptante = 'Sistema';
      if (row.usuario) {
        if (row.usuario.startsWith('usuario:')) {
          nombreAdoptante = 'Administrador';
        } else if (row.usuario !== 'sistema') {
          nombreAdoptante = row.usuario;
        }
      }
      
      return {
        ...row,
        nombreAdoptante,
        emailAdoptante: ''
      };
    }));
    
    return rowsWithAdoptante;
  },

  async getById(id) {
    const [rows] = await pool.query(`
      SELECT 
        ea.*, 
        a.nombre as nombreAnimal, 
        a.especie
      FROM estado_animal ea 
      JOIN animal a ON ea.idAnimal = a.idAnimal 
      WHERE ea.idEstado = ?
      LIMIT 1
    `, [id]);
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    
    // Buscar la solicitud aprobada más reciente antes o en la fecha del cambio
    const [solicitud] = await pool.query(`
      SELECT s.idSolicitud, s.idAdoptante, s.fecha
      FROM solicitud s
      WHERE s.idAnimal = ?
        AND s.estado = 'Aprobada'
        AND s.fecha <= ?
      ORDER BY s.fecha DESC, s.idSolicitud DESC
      LIMIT 1
    `, [row.idAnimal, row.fechaCambio]);
    
    if (solicitud.length > 0) {
      const [adoptante] = await pool.query(`
        SELECT nombre, apellido, email
        FROM adoptante
        WHERE idAdoptante = ?
      `, [solicitud[0].idAdoptante]);
      
      if (adoptante.length > 0) {
        return {
          ...row,
          nombreAdoptante: `${adoptante[0].nombre} ${adoptante[0].apellido}`,
          emailAdoptante: adoptante[0].email || ''
        };
      }
    }
    
    // Si no hay adoptante, mostrar información del usuario o sistema
    let nombreAdoptante = 'Sistema';
    if (row.usuario) {
      if (row.usuario.startsWith('usuario:')) {
        nombreAdoptante = 'Administrador';
      } else if (row.usuario !== 'sistema') {
        nombreAdoptante = row.usuario;
      }
    }
    
    return {
      ...row,
      nombreAdoptante,
      emailAdoptante: ''
    };
  },

  async getByAnimalId(animalId) {
    const [rows] = await pool.query(`
      SELECT 
        ea.*, 
        a.nombre as nombreAnimal, 
        a.especie
      FROM estado_animal ea 
      JOIN animal a ON ea.idAnimal = a.idAnimal 
      WHERE ea.idAnimal = ?
      ORDER BY ea.fechaCambio DESC, ea.idEstado DESC
    `, [animalId]);
    
    // Para cada cambio, buscar el adoptante relacionado
    const rowsWithAdoptante = await Promise.all(rows.map(async (row) => {
      // Buscar la solicitud aprobada más reciente antes o en la fecha del cambio
      const [solicitud] = await pool.query(`
        SELECT s.idSolicitud, s.idAdoptante, s.fecha
        FROM solicitud s
        WHERE s.idAnimal = ?
          AND s.estado = 'Aprobada'
          AND s.fecha <= ?
        ORDER BY s.fecha DESC, s.idSolicitud DESC
        LIMIT 1
      `, [row.idAnimal, row.fechaCambio]);
      
      if (solicitud.length > 0) {
        const [adoptante] = await pool.query(`
          SELECT nombre, apellido, email
          FROM adoptante
          WHERE idAdoptante = ?
        `, [solicitud[0].idAdoptante]);
        
        if (adoptante.length > 0) {
          return {
            ...row,
            nombreAdoptante: `${adoptante[0].nombre} ${adoptante[0].apellido}`,
            emailAdoptante: adoptante[0].email || ''
          };
        }
      }
      
      // Si no hay adoptante, mostrar información del usuario o sistema
      let nombreAdoptante = 'Sistema';
      if (row.usuario) {
        if (row.usuario.startsWith('usuario:')) {
          nombreAdoptante = 'Administrador';
        } else if (row.usuario !== 'sistema') {
          nombreAdoptante = row.usuario;
        }
      }
      
      return {
        ...row,
        nombreAdoptante,
        emailAdoptante: ''
      };
    }));
    
    return rowsWithAdoptante;
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
      idAnimal: animalId,
      estadoAnterior,
      estadoNuevo: nuevoEstado,
      fechaCambio: new Date().toISOString().split('T')[0],
      motivo: motivo || 'Cambio de estado',
      usuario
    });

    return {
      animal: { idAnimal: animalId, estadoAnterior, estadoNuevo: nuevoEstado },
      historial: cambioEstado
    };
  },

  validarTransicionEstado(estadoAnterior, estadoNuevo) {
    const transicionesValidas = {
      'Disponible': ['En proceso', 'En tratamiento', 'Adoptado'],
      'En proceso': ['Disponible', 'Adoptado'],
      'En tratamiento': ['Disponible', 'En proceso'],
      'Adoptado': ['Disponible', 'En proceso', 'En tratamiento'] // Permitir que animales adoptados vuelvan al refugio
    };

    return transicionesValidas[estadoAnterior]?.includes(estadoNuevo) || false;
  },

  async getEstadosDisponibles(estadoActual) {
    const transicionesValidas = {
      'Disponible': ['En proceso', 'En tratamiento', 'Adoptado'],
      'En proceso': ['Disponible', 'Adoptado'],
      'En tratamiento': ['Disponible', 'En proceso'],
      'Adoptado': ['Disponible', 'En proceso', 'En tratamiento'] // Permitir que animales adoptados vuelvan al refugio
    };

    return transicionesValidas[estadoActual] || [];
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM estado_animal WHERE idEstado = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = EstadoAnimal;
