const Seguimiento = require('../models/seguimiento');
const User = require('../models/User');
const Notificacion = require('../models/notificacion');
const PreferenciasNotificacion = require('../models/preferenciasNotificacion');
const pool = require('../config/db');

exports.crearSeguimiento = async (req, res) => {
  try {
    const { idAdopcion, idAnimal, fechaProgramada, observaciones } = req.body;

    if (!idAdopcion || !idAnimal || !fechaProgramada) {
      return res.status(400).json({ error: 'Campos obligatorios: idAdopcion, idAnimal, fechaProgramada' });
    }

    const hoyStr = new Date().toISOString().split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaProgramada)) {
      return res.status(400).json({ error: 'Formato de fecha inválido (usar YYYY-MM-DD)' });
    }

    if (fechaProgramada < hoyStr) {
      return res.status(400).json({ error: 'La fecha programada no puede ser anterior a hoy' });
    }

    // Validar adopción y correspondencia con animal
    const [adopRows] = await pool.query('SELECT * FROM adopcion WHERE idAdopcion = ?', [idAdopcion]);
    if (adopRows.length === 0) return res.status(404).json({ error: 'Adopción no encontrada' });

    const [solRows] = await pool.query('SELECT * FROM solicitud WHERE idSolicitud = ?', [adopRows[0].idSolicitud]);
    if (solRows.length === 0 || solRows[0].idAnimal !== Number(idAnimal)) {
      return res.status(400).json({ error: 'La adopción no corresponde al animal indicado' });
    }

    const idUsuarioCreador = req.user ? req.user.id : null;

    const nuevo = await Seguimiento.create({
      idAdopcion,
      idAnimal,
      fechaProgramada,
      observaciones,
      idUsuarioCreador
    });

    const [infoRows] = await pool.query(
      `SELECT adopt.email AS emailAdoptante,
              adopt.nombre AS nombreAdoptante,
              adopt.apellido AS apellidoAdoptante,
              a.nombre AS nombreAnimal
       FROM adopcion ad
       JOIN solicitud sol ON ad.idSolicitud = sol.idSolicitud
       JOIN adoptante adopt ON sol.idAdoptante = adopt.idAdoptante
       JOIN animal a ON sol.idAnimal = a.idAnimal
       WHERE ad.idAdopcion = ?`,
      [idAdopcion]
    );

    const infoNotificacion = infoRows[0] || {};
    const nombreAnimal = infoNotificacion.nombreAnimal || `animal #${idAnimal}`;

    if (idUsuarioCreador) {
      try {
        await Notificacion.create({
          idUsuario: idUsuarioCreador,
          tipo: 'Seguimiento Programado',
          mensaje: `Se programó un seguimiento para ${nombreAnimal} el ${fechaProgramada}.`,
          idSeguimiento: nuevo.idSeguimiento
        });
      } catch (notifErr) {
        console.error('Error al notificar al administrador sobre el seguimiento:', notifErr.message);
      }
    }

    if (infoNotificacion.emailAdoptante) {
      try {
        const usuarioAdoptante = await User.findByEmail(infoNotificacion.emailAdoptante);
        if (usuarioAdoptante) {
          const preferencias = await PreferenciasNotificacion.getByUsuario(usuarioAdoptante.idUsuario);
          const permiteNotificacion = !preferencias || (
            preferencias.notificarRecordatorioSeguimiento &&
            preferencias.notificarEnSistema
          );

          if (permiteNotificacion) {
            const nombreAdoptante = `${infoNotificacion.nombreAdoptante || ''} ${infoNotificacion.apellidoAdoptante || ''}`.trim();
            await Notificacion.create({
              idUsuario: usuarioAdoptante.idUsuario,
              tipo: 'Seguimiento Programado',
              mensaje: `Se programó un seguimiento para ${nombreAnimal}${nombreAdoptante ? ` a cargo de ${nombreAdoptante}` : ''} el ${fechaProgramada}.`,
              idSeguimiento: nuevo.idSeguimiento
            });
          }
        }
      } catch (notifErr) {
        console.error('Error al notificar al adoptante sobre el seguimiento:', notifErr.message);
      }
    }

    res.status(201).json({ message: 'Seguimiento programado', seguimiento: nuevo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Error al crear seguimiento' });
  }
};

exports.completarSeguimiento = async (req, res) => {
  try {
    const { fechaRealizada, observaciones } = req.body;
    const { id } = req.params;

    if (!fechaRealizada) return res.status(400).json({ error: 'fechaRealizada es obligatoria' });

    const actualizado = await Seguimiento.completar(id, { fechaRealizada, observaciones });
    res.json({ message: 'Seguimiento completado', seguimiento: actualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al completar seguimiento' });
  }
};

exports.listarPorAnimal = async (req, res) => {
  try {
    const { animalId } = req.params;
    const lista = await Seguimiento.getByAnimal(animalId);
    res.json(lista);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener seguimientos' });
  }
};

exports.listarPorAdopcion = async (req, res) => {
  try {
    const { adopcionId } = req.params;
    const lista = await Seguimiento.getByAdopcion(adopcionId);
    res.json(lista);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener seguimientos' });
  }
};

exports.listarPendientes = async (req, res) => {
  try {
    // Obtener todos los seguimientos pendientes, sin importar la fecha programada
    const lista = await Seguimiento.getPendientes();
    res.json(lista);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener seguimientos pendientes' });
  }
};

exports.listarMisSeguimientos = async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const seguimientos = await Seguimiento.getByUsuarioEmail(usuario.email);
    res.json(seguimientos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tus seguimientos' });
  }
};


