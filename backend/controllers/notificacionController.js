const Notificacion = require('../models/notificacion');
const PreferenciasNotificacion = require('../models/preferenciasNotificacion');

exports.getMisNotificaciones = async (req, res) => {
  try {
    const notificaciones = await Notificacion.getByUsuario(req.user.id);
    res.json(notificaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

exports.getMisNotificacionesNoLeidas = async (req, res) => {
  try {
    const notificaciones = await Notificacion.getNoLeidasByUsuario(req.user.id);
    res.json(notificaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener notificaciones no leídas' });
  }
};

exports.contarNoLeidas = async (req, res) => {
  try {
    const count = await Notificacion.contarNoLeidas(req.user.id);
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al contar notificaciones' });
  }
};

exports.marcarComoLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const notificacion = await Notificacion.getById(id);
    
    if (!notificacion) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    if (notificacion.idUsuario !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const actualizada = await Notificacion.marcarComoLeida(id);
    res.json({ message: 'Notificación marcada como leída', notificacion: actualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al marcar notificación como leída' });
  }
};

exports.marcarTodasComoLeidas = async (req, res) => {
  try {
    await Notificacion.marcarTodasComoLeidas(req.user.id);
    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al marcar notificaciones como leídas' });
  }
};

exports.eliminarNotificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const notificacion = await Notificacion.getById(id);
    
    if (!notificacion) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    if (notificacion.idUsuario !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await Notificacion.delete(id);
    res.json({ message: 'Notificación eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar notificación' });
  }
};

exports.getMisPreferencias = async (req, res) => {
  try {
    let preferencias = await PreferenciasNotificacion.getByUsuario(req.user.id);
    
    // Si no existen, crear con valores por defecto
    if (!preferencias) {
      preferencias = await PreferenciasNotificacion.createOrUpdate(req.user.id, {});
    }
    
    res.json(preferencias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener preferencias' });
  }
};

exports.actualizarMisPreferencias = async (req, res) => {
  try {
    const {
      notificarSolicitudAprobada,
      notificarSolicitudRechazada,
      notificarRecordatorioSeguimiento,
      notificarCampanas,
      notificarPorEmail,
      notificarEnSistema
    } = req.body;

    const preferencias = await PreferenciasNotificacion.createOrUpdate(req.user.id, {
      notificarSolicitudAprobada,
      notificarSolicitudRechazada,
      notificarRecordatorioSeguimiento,
      notificarCampanas,
      notificarPorEmail,
      notificarEnSistema
    });

    res.json({
      message: 'Preferencias actualizadas exitosamente',
      preferencias
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar preferencias' });
  }
};

