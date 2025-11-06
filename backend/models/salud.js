const pool = require('../config/db');

const Salud = {
  async getAll() {
    const [rows] = await pool.query(`
      SELECT s.*, a.nombre as nombreAnimal, a.especie 
      FROM salud s 
      JOIN animal a ON s.idAnimal = a.idAnimal 
      ORDER BY COALESCE(s.fechaProgramada, s.fechaControl) DESC, s.idSalud DESC
    `);
    
    // Calcular estado automáticamente si no está definido
    return rows.map(row => {
      if (!row.estado) {
        row.estado = this.calcularEstado(row);
      }
      return row;
    });
  },
  
  calcularEstado(control) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaControl = control.fechaProgramada ? new Date(control.fechaProgramada) : new Date(control.fechaControl);
    fechaControl.setHours(0, 0, 0, 0);
    
    // Si tiene alta veterinaria, está Realizado
    if (control.fechaAltaVeterinaria) {
      return 'Realizado';
    }
    
    // Si la fecha del control es futura, está Pendiente
    if (fechaControl > hoy) {
      return 'Pendiente';
    }
    
    // Si la fecha ya pasó y no tiene alta, está En Tratamiento
    return 'En Tratamiento';
  },

  async getById(id) {
    const [rows] = await pool.query(`
      SELECT s.*, a.nombre as nombreAnimal, a.especie 
      FROM salud s 
      JOIN animal a ON s.idAnimal = a.idAnimal 
      WHERE s.idSalud = ?
    `, [id]);
    
    if (rows.length === 0) return null;
    
    const control = rows[0];
    if (!control.estado) {
      control.estado = this.calcularEstado(control);
    }
    return control;
  },

  async getByAnimalId(animalId) {
    const [rows] = await pool.query(`
      SELECT s.*, a.nombre as nombreAnimal, a.especie 
      FROM salud s 
      JOIN animal a ON s.idAnimal = a.idAnimal 
      WHERE s.idAnimal = ? 
      ORDER BY COALESCE(s.fechaProgramada, s.fechaControl) DESC, s.idSalud DESC
    `, [animalId]);
    
    // Calcular estado automáticamente si no está definido
    return rows.map(row => {
      if (!row.estado) {
        row.estado = this.calcularEstado(row);
      }
      return row;
    });
  },

  async create(data) {
    const { idAnimal, vacunas, tratamientos, veterinario, fechaControl, fechaProgramada, observaciones, estado } = data;
    
    // Si no se especifica fechaProgramada, usar fechaControl
    const fechaProg = fechaProgramada || fechaControl;
    
    // Calcular estado si no se especifica
    let estadoFinal = estado;
    if (!estadoFinal) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaProgDate = new Date(fechaProg);
      fechaProgDate.setHours(0, 0, 0, 0);
      estadoFinal = fechaProgDate > hoy ? 'Pendiente' : 'En Tratamiento';
    }
    
    const [result] = await pool.query(
      'INSERT INTO salud (idAnimal, vacunas, tratamientos, veterinario, fechaControl, fechaProgramada, observaciones, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [idAnimal, vacunas, tratamientos, veterinario, fechaControl, fechaProg, observaciones, estadoFinal]
    );
    return { idSalud: result.insertId, ...data, fechaProgramada: fechaProg, estado: estadoFinal };
  },

  async update(id, data) {
    const { vacunas, tratamientos, veterinario, fechaControl, fechaProgramada, observaciones, estado, fechaAltaVeterinaria } = data;
    
    // Construir la consulta dinámicamente según los campos proporcionados
    const campos = [];
    const valores = [];
    
    if (vacunas !== undefined) { campos.push('vacunas=?'); valores.push(vacunas); }
    if (tratamientos !== undefined) { campos.push('tratamientos=?'); valores.push(tratamientos); }
    if (veterinario !== undefined) { campos.push('veterinario=?'); valores.push(veterinario); }
    if (fechaControl !== undefined) { campos.push('fechaControl=?'); valores.push(fechaControl); }
    if (fechaProgramada !== undefined) { campos.push('fechaProgramada=?'); valores.push(fechaProgramada); }
    if (observaciones !== undefined) { campos.push('observaciones=?'); valores.push(observaciones); }
    if (estado !== undefined) { campos.push('estado=?'); valores.push(estado); }
    if (fechaAltaVeterinaria !== undefined) { campos.push('fechaAltaVeterinaria=?'); valores.push(fechaAltaVeterinaria); }
    
    if (campos.length === 0) {
      return this.getById(id);
    }
    
    valores.push(id);
    await pool.query(
      `UPDATE salud SET ${campos.join(', ')} WHERE idSalud=?`,
      valores
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
