const bcrypt = require('bcrypt');
const pool = require('../config/db');

exports.obtenerMiPerfil = async (req, res) => {
  try {
    const { id } = req.user;

    const [usuarios] = await pool.query(
      'SELECT idUsuario, email, rol FROM usuario WHERE idUsuario = ?',
      [id]
    );
    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = usuarios[0];

    if (usuario.rol === 'adoptante') {
      const [adoptantes] = await pool.query(
        'SELECT idAdoptante, nombre, apellido, telefono, direccion, ocupacion FROM adoptante WHERE email = ?',
        [usuario.email]
      );

      let adoptante = adoptantes[0];
      if (!adoptante) {
        const [result] = await pool.query(
          `INSERT INTO adoptante (nombre, apellido, email, telefono, direccion, ocupacion)
           VALUES ('Pendiente', 'Pendiente', ?, NULL, NULL, NULL)`,
          [usuario.email]
        );
        adoptante = {
          idAdoptante: result.insertId,
          nombre: 'Pendiente',
          apellido: 'Pendiente',
          telefono: null,
          direccion: null,
          ocupacion: null,
        };
      }

      return res.json({
        idUsuario: usuario.idUsuario,
        email: usuario.email,
        rol: usuario.rol,
        ...adoptante,
      });
    }

    return res.json({
      idUsuario: usuario.idUsuario,
      email: usuario.email,
      rol: usuario.rol,
      nombre: null,
      apellido: null,
      telefono: null,
      direccion: null,
      ocupacion: null,
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
};

exports.actualizarMiPerfil = async (req, res) => {
  try {
    const { id } = req.user;
    const { nombre, apellido, telefono, direccion, ocupacion } = req.body;

    const [usuarioRows] = await pool.query(
      'SELECT email, rol FROM usuario WHERE idUsuario = ?',
      [id]
    );

    if (!usuarioRows || usuarioRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const email = usuarioRows[0].email;
    const rol = usuarioRows[0].rol;

    if (rol !== 'adoptante') {
      return res.status(400).json({ error: 'Solo los usuarios adoptantes pueden actualizar estos datos' });
    }

    const [adoptanteRows] = await pool.query(
      'SELECT idAdoptante FROM adoptante WHERE email = ?',
      [email]
    );

    if (adoptanteRows.length === 0) {
      await pool.query(
        `INSERT INTO adoptante (nombre, apellido, email, telefono, direccion, ocupacion)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nombre, apellido, email, telefono || null, direccion || null, ocupacion || null]
      );
    } else {
      const idAdoptante = adoptanteRows[0].idAdoptante;
      await pool.query(
        `UPDATE adoptante
         SET nombre = ?, apellido = ?, telefono = ?, direccion = ?, ocupacion = ?
         WHERE idAdoptante = ?`,
        [nombre, apellido, telefono || null, direccion || null, ocupacion || null, idAdoptante]
      );
    }

    res.json({ message: 'Perfil actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};

exports.cambiarPassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { passwordActual, passwordNueva } = req.body;

    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({ error: 'Debe proporcionar la contraseña actual y la nueva contraseña' });
    }

    const [rows] = await pool.query(
      'SELECT password FROM usuario WHERE idUsuario = ?',
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const passwordCorrecta = await bcrypt.compare(passwordActual, rows[0].password);
    if (!passwordCorrecta) {
      return res.status(400).json({ error: 'La contraseña actual no es correcta' });
    }

    if (passwordNueva.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const hash = await bcrypt.hash(passwordNueva, 10);
    await pool.query(
      'UPDATE usuario SET password = ?, intentosFallidos = 0, cuentaBloqueada = 0, fechaBloqueo = NULL WHERE idUsuario = ?',
      [hash, id]
    );

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error al cambiar la contraseña' });
  }
};


