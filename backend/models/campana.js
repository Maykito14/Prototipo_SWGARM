const pool = require('../config/db');

async function adjuntarFotos(campanas) {
  if (!campanas || campanas.length === 0) return campanas;

  const ids = campanas.map((c) => c.idCampaña).filter(Boolean);
  if (ids.length === 0) return campanas;

  const placeholders = ids.map(() => '?').join(',');
  const [fotos] = await pool.query(
    `SELECT idFoto, idCampaña, ruta, esPrincipal
     FROM campaña_foto
     WHERE idCampaña IN (${placeholders})
     ORDER BY esPrincipal DESC, fechaSubida DESC, idFoto DESC`,
    ids
  );

  const mapa = new Map();
  fotos.forEach((foto) => {
    if (!mapa.has(foto.idCampaña)) {
      mapa.set(foto.idCampaña, []);
    }
    mapa.get(foto.idCampaña).push({
      idFoto: foto.idFoto,
      ruta: foto.ruta,
      esPrincipal: !!foto.esPrincipal,
    });
  });

  campanas.forEach((campana) => {
    const lista = mapa.get(campana.idCampaña) || [];
    campana.fotos = lista;
    const principal = lista.find((f) => f.esPrincipal) || lista[0];
    campana.fotoPrincipal = principal ? principal.ruta : null;
  });

  return campanas;
}

const Campana = {
  async getAll(includeInvisibles = true) {
    const condicion = includeInvisibles ? '' : 'WHERE visible = 1';
    const [rows] = await pool.query(
      `SELECT *
       FROM campaña
       ${condicion}
       ORDER BY COALESCE(fechaInicio, fechaCreacion) DESC, idCampaña DESC`
    );
    await adjuntarFotos(rows);
    return rows;
  },

  async getPublicas() {
    return this.getAll(false);
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM campaña WHERE idCampaña = ?', [id]);
    if (rows.length === 0) return undefined;
    await adjuntarFotos(rows);
    return rows[0];
  },

  async create(data) {
    const {
      idUsuario,
      titulo,
      descripcion,
      responsable,
      fechaInicio,
      fechaFin,
      visible = 1,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO campaña (idUsuario, titulo, descripcion, responsable, fechaInicio, fechaFin, visible)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        idUsuario,
        titulo,
        descripcion || null,
        responsable || null,
        fechaInicio || null,
        fechaFin || null,
        visible ? 1 : 0,
      ]
    );

    return this.getById(result.insertId);
  },

  async update(id, data) {
    const {
      titulo,
      descripcion,
      responsable,
      fechaInicio,
      fechaFin,
      visible,
    } = data;

    const campos = [];
    const valores = [];

    if (titulo !== undefined) {
      campos.push('titulo = ?');
      valores.push(titulo);
    }
    if (descripcion !== undefined) {
      campos.push('descripcion = ?');
      valores.push(descripcion || null);
    }
    if (responsable !== undefined) {
      campos.push('responsable = ?');
      valores.push(responsable || null);
    }
    if (fechaInicio !== undefined) {
      campos.push('fechaInicio = ?');
      valores.push(fechaInicio || null);
    }
    if (fechaFin !== undefined) {
      campos.push('fechaFin = ?');
      valores.push(fechaFin || null);
    }
    if (visible !== undefined) {
      campos.push('visible = ?');
      valores.push(visible ? 1 : 0);
    }

    if (campos.length > 0) {
      valores.push(id);
      await pool.query(
        `UPDATE campaña
         SET ${campos.join(', ')}
         WHERE idCampaña = ?`,
        valores
      );
    }

    return this.getById(id);
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM campaña WHERE idCampaña = ?', [id]);
    return result.affectedRows > 0;
  },

  async setVisible(idCampaña, visible) {
    await pool.query(
      'UPDATE campaña SET visible = ? WHERE idCampaña = ?',
      [visible ? 1 : 0, idCampaña]
    );
    return this.getById(idCampaña);
  },

  async addFotos(idCampaña, rutas, principalRuta = null) {
    if (!rutas || rutas.length === 0) return [];

    const valores = rutas.map((ruta) => [
      idCampaña,
      ruta,
      principalRuta && principalRuta === ruta ? 1 : 0,
    ]);

    await pool.query(
      'INSERT INTO campaña_foto (idCampaña, ruta, esPrincipal) VALUES ?',
      [valores]
    );

    if (principalRuta) {
      await this.establecerPrincipal(idCampaña, principalRuta);
    }

    return this.obtenerFotos(idCampaña);
  },

  async obtenerFotos(idCampaña) {
    const [rows] = await pool.query(
      `SELECT idFoto, idCampaña, ruta, esPrincipal
       FROM campaña_foto
       WHERE idCampaña = ?
       ORDER BY esPrincipal DESC, fechaSubida DESC, idFoto DESC`,
      [idCampaña]
    );
    return rows;
  },

  async eliminarFoto(idFoto, idCampaña) {
    const [result] = await pool.query(
      'DELETE FROM campaña_foto WHERE idFoto = ? AND idCampaña = ?',
      [idFoto, idCampaña]
    );
    return result.affectedRows > 0;
  },

  async establecerPrincipal(idCampaña, rutaPrincipal) {
    if (!rutaPrincipal) return;
    await pool.query('UPDATE campaña_foto SET esPrincipal = 0 WHERE idCampaña = ?', [idCampaña]);
    await pool.query(
      'UPDATE campaña_foto SET esPrincipal = 1 WHERE idCampaña = ? AND ruta = ?',
      [idCampaña, rutaPrincipal]
    );
  },
};

module.exports = Campana;

