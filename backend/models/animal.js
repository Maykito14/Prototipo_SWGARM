const pool = require('../config/db');

async function attachFotos(animales) {
  if (!animales || animales.length === 0) return animales;

  const ids = animales.map((a) => a.idAnimal).filter(Boolean);
  if (ids.length === 0) return animales;

  const placeholders = ids.map(() => '?').join(',');
  const [fotos] = await pool.query(
    `SELECT idFoto, idAnimal, ruta, esPrincipal
     FROM animal_foto
     WHERE idAnimal IN (${placeholders})
     ORDER BY esPrincipal DESC, fechaSubida DESC, idFoto DESC`,
    ids
  );

  const mapa = new Map();
  fotos.forEach((foto) => {
    if (!mapa.has(foto.idAnimal)) {
      mapa.set(foto.idAnimal, []);
    }
    mapa.get(foto.idAnimal).push({
      idFoto: foto.idFoto,
      ruta: foto.ruta,
      esPrincipal: !!foto.esPrincipal
    });
  });

  animales.forEach((animal) => {
    const lista = mapa.get(animal.idAnimal) || [];
    animal.fotos = lista;
    const principal = lista.find((f) => f.esPrincipal) || lista[0];
    if (principal) {
      animal.fotoPrincipal = principal.ruta;
      animal.foto = principal.ruta; // compatibilidad hacia atrás para el frontend
    } else {
      animal.fotoPrincipal = null;
      animal.foto = null;
    }
  });

  return animales;
}

const Animal = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM animal ORDER BY idAnimal DESC');
    await attachFotos(rows);
    return rows;
  },

  async getDisponibles() {
    const [rows] = await pool.query('SELECT * FROM animal WHERE estado = ? ORDER BY fechaIngreso DESC', ['Disponible']);
    await attachFotos(rows);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM animal WHERE idAnimal = ?', [id]);
    if (rows.length === 0) return undefined;
    await attachFotos(rows);
    return rows[0];
  },

  async create(data) {
    const { nombre, especie, raza, edad, estado, fechaIngreso, descripcion, puntajeMinimo } = data;
    const [result] = await pool.query(
      'INSERT INTO animal (nombre, especie, raza, edad, estado, fechaIngreso, descripcion, puntajeMinimo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, especie, raza, edad, estado, fechaIngreso, descripcion, puntajeMinimo || 0]
    );
    return { idAnimal: result.insertId, ...data };
  },

  async update(id, data) {
    const { nombre, especie, raza, edad, estado, fechaIngreso, descripcion, puntajeMinimo } = data;
    await pool.query(
      'UPDATE animal SET nombre=?, especie=?, raza=?, edad=?, estado=?, fechaIngreso=?, descripcion=?, puntajeMinimo=? WHERE idAnimal=?',
      [nombre, especie, raza, edad, estado, fechaIngreso, descripcion, puntajeMinimo || 0, id]
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

  async addFotos(idAnimal, rutas, principalRuta = null) {
    if (!rutas || rutas.length === 0) return [];

    const valores = rutas.map((ruta) => [idAnimal, ruta, principalRuta === ruta ? 1 : 0]);
    await pool.query('INSERT INTO animal_foto (idAnimal, ruta, esPrincipal) VALUES ?', [valores]);

    if (principalRuta) {
      await this.establecerPrincipal(idAnimal, principalRuta);
    }

    return this.obtenerFotosPorAnimal(idAnimal);
  },

  async obtenerFotosPorAnimal(idAnimal) {
    const [rows] = await pool.query(
      'SELECT idFoto, idAnimal, ruta, esPrincipal FROM animal_foto WHERE idAnimal = ? ORDER BY esPrincipal DESC, fechaSubida DESC, idFoto DESC',
      [idAnimal]
    );
    return rows;
  },

  async establecerPrincipal(idAnimal, rutaPrincipal) {
    if (!rutaPrincipal) return;
    await pool.query('UPDATE animal_foto SET esPrincipal = 0 WHERE idAnimal = ?', [idAnimal]);
    await pool.query('UPDATE animal_foto SET esPrincipal = 1 WHERE idAnimal = ? AND ruta = ?', [idAnimal, rutaPrincipal]);
  },
};

module.exports = Animal;

