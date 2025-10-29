const { Adoptante, Solicitud, Adopcion } = require('../models/adopcion');
const EstadoAnimal = require('../models/estadoAnimal');
const User = require('../models/User');
const Notificacion = require('../models/notificacion');
const PreferenciasNotificacion = require('../models/preferenciasNotificacion');

// Helper para enviar notificación al adoptante
async function enviarNotificacionAdoptante(emailAdoptante, tipo, mensaje, idSolicitud = null, idSeguimiento = null) {
  try {
    // Buscar usuario por email
    const usuario = await User.findByEmail(emailAdoptante);
    if (!usuario) return; // Si no hay usuario registrado, no enviar notificación

    // Verificar preferencias
    const preferencias = await PreferenciasNotificacion.getByUsuario(usuario.idUsuario);
    
    if (preferencias) {
      // Verificar si el tipo de notificación está habilitado
      if (tipo === 'Solicitud Aprobada' && !preferencias.notificarSolicitudAprobada) return;
      if (tipo === 'Solicitud Rechazada' && !preferencias.notificarSolicitudRechazada) return;
      if (tipo === 'Recordatorio Seguimiento' && !preferencias.notificarRecordatorioSeguimiento) return;
      
      // Solo enviar si está habilitado en sistema
      if (!preferencias.notificarEnSistema) return;
    }

    // Crear notificación
    await Notificacion.create({
      idUsuario: usuario.idUsuario,
      tipo,
      mensaje,
      idSolicitud,
      idSeguimiento
    });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
  }
}

// Controladores para Adoptantes
exports.listarAdoptantes = async (req, res) => {
  try {
    const adoptantes = await Adoptante.getAll();
    res.json(adoptantes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener adoptantes' });
  }
};

exports.obtenerAdoptante = async (req, res) => {
  try {
    const adoptante = await Adoptante.getById(req.params.id);
    if (!adoptante) return res.status(404).json({ error: 'Adoptante no encontrado' });
    res.json(adoptante);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar adoptante' });
  }
};

exports.crearAdoptante = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, direccion, ocupacion } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido || !email) {
      return res.status(400).json({ 
        error: 'Campos obligatorios faltantes',
        campos: { nombre, apellido, email }
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Validar formato de teléfono (opcional pero si se proporciona debe ser válido)
    if (telefono) {
      const telefonoRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
      if (!telefonoRegex.test(telefono)) {
        return res.status(400).json({ error: 'Formato de teléfono inválido' });
      }
    }

    // Verificar si ya existe un adoptante con ese email
    const adoptanteExistente = await Adoptante.getByEmail(email);
    if (adoptanteExistente) {
      return res.status(409).json({ 
        error: 'Ya existe un adoptante registrado con ese email',
        adoptante: { id: adoptanteExistente.idAdoptante, nombre: adoptanteExistente.nombre }
      });
    }

    const nuevoAdoptante = await Adoptante.create(req.body);
    res.status(201).json({
      message: 'Adoptante registrado exitosamente',
      adoptante: nuevoAdoptante
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear adoptante' });
  }
};

// Controladores para Solicitudes
exports.listarSolicitudes = async (req, res) => {
  try {
    const solicitudes = await Solicitud.getAll();
    res.json(solicitudes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
};

exports.obtenerSolicitud = async (req, res) => {
  try {
    const solicitud = await Solicitud.getById(req.params.id);
    if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' });
    res.json(solicitud);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar solicitud' });
  }
};

exports.obtenerSolicitudesPorAdoptante = async (req, res) => {
  try {
    const solicitudes = await Solicitud.getByAdoptanteId(req.params.adoptanteId);
    res.json(solicitudes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener solicitudes del adoptante' });
  }
};

exports.obtenerSolicitudesPorAnimal = async (req, res) => {
  try {
    const solicitudes = await Solicitud.getByAnimalId(req.params.animalId);
    res.json(solicitudes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener solicitudes del animal' });
  }
};

exports.crearSolicitudAdopcion = async (req, res) => {
  try {
    const { datosAdoptante, idAnimal, motivoAdopcion, experienciaMascotas, condicionesVivienda } = req.body;

    // Validaciones básicas
    if (!datosAdoptante || !idAnimal) {
      return res.status(400).json({ 
        error: 'Datos del adoptante e ID del animal son obligatorios'
      });
    }

    // Validar que el animal existe
    const pool = require('../config/db');
    const [animalRows] = await pool.query('SELECT * FROM animal WHERE idAnimal = ?', [idAnimal]);
    if (animalRows.length === 0) {
      return res.status(404).json({ error: 'Animal no encontrado' });
    }

    const animal = animalRows[0];

    // Validar que el animal esté disponible para adopción
    if (animal.estado !== 'Disponible') {
      return res.status(400).json({ 
        error: `El animal ${animal.nombre} no está disponible para adopción. Estado actual: ${animal.estado}`
      });
    }

    // Crear o obtener adoptante
    let adoptante;
    const adoptanteExistente = await Adoptante.getByEmail(datosAdoptante.email);
    
    if (adoptanteExistente) {
      adoptante = adoptanteExistente;
    } else {
      adoptante = await Adoptante.create(datosAdoptante);
    }

    // Verificar si ya existe una solicitud del mismo adoptante para el mismo animal
    const solicitudExistente = await Solicitud.verificarSolicitudExistente(adoptante.idAdoptante, idAnimal);
    if (solicitudExistente) {
      return res.status(409).json({ 
        error: 'Ya existe una solicitud de adopción para este animal',
        solicitud: { id: solicitudExistente.idSolicitud, estado: solicitudExistente.estado }
      });
    }

    // Crear solicitud
    const nuevaSolicitud = await Solicitud.create({
      idAdoptante: adoptante.idAdoptante,
      idAnimal: idAnimal,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
      puntajeEvaluacion: 0
    });

    res.status(201).json({
      message: 'Solicitud de adopción registrada exitosamente',
      solicitud: nuevaSolicitud,
      adoptante: adoptante,
      animal: animal
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Error al crear solicitud de adopción' });
  }
};

exports.actualizarSolicitud = async (req, res) => {
  try {
    const { estado, puntajeEvaluacion, motivoRechazo } = req.body;

    // Validaciones básicas
    if (!estado) {
      return res.status(400).json({ 
        error: 'El estado es obligatorio'
      });
    }

    const estadosValidos = ['Pendiente', 'Aprobada', 'Rechazada', 'En evaluación', 'No Seleccionada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        error: 'Estado inválido',
        estadosValidos
      });
    }

    // Obtener solicitud actual
    const solicitudActual = await Solicitud.getById(req.params.id);
    if (!solicitudActual) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    // Si se aprueba una solicitud, marcar las demás del mismo animal como "No Seleccionada"
    if (estado === 'Aprobada') {
      await marcarOtrasSolicitudesComoNoSeleccionadas(solicitudActual.idAnimal, req.params.id);
      
      // Cambiar estado del animal a "En proceso"
      const pool = require('../config/db');
      await pool.query(
        'UPDATE animal SET estado = ? WHERE idAnimal = ?',
        ['En proceso', solicitudActual.idAnimal]
      );
    }

    // Si se rechaza, agregar motivo si se proporciona
    const datosActualizacion = { estado, puntajeEvaluacion };
    if (estado === 'Rechazada' && motivoRechazo) {
      datosActualizacion.motivoRechazo = motivoRechazo;
    }

    const actualizado = await Solicitud.update(req.params.id, datosActualizacion);
    
    // Enviar notificación al adoptante si se aprueba o rechaza
    if (estado === 'Aprobada' || estado === 'Rechazada') {
      const adoptante = await Adoptante.getById(solicitudActual.idAdoptante);
      const pool = require('../config/db');
      const [animalRows] = await pool.query('SELECT nombre FROM animal WHERE idAnimal = ?', [solicitudActual.idAnimal]);
      const nombreAnimal = animalRows[0]?.nombre || 'el animal';
      
      if (adoptante && adoptante.email) {
        let mensaje, tipo;
        if (estado === 'Aprobada') {
          tipo = 'Solicitud Aprobada';
          mensaje = `¡Felicitaciones! Tu solicitud de adopción para ${nombreAnimal} ha sido aprobada. Pronto nos pondremos en contacto contigo.`;
        } else {
          tipo = 'Solicitud Rechazada';
          const motivo = motivoRechazo ? ` Motivo: ${motivoRechazo}` : '';
          mensaje = `Tu solicitud de adopción para ${nombreAnimal} ha sido rechazada.${motivo}`;
        }
        
        await enviarNotificacionAdoptante(adoptante.email, tipo, mensaje, solicitudActual.idSolicitud);
      }
    }
    
    res.json({
      message: 'Solicitud actualizada exitosamente',
      solicitud: actualizado,
      accion: estado === 'Aprobada' ? 'Solicitud aprobada y otras marcadas como no seleccionadas' : 'Solicitud actualizada'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar solicitud' });
  }
};

// Función auxiliar para marcar otras solicitudes como no seleccionadas
async function marcarOtrasSolicitudesComoNoSeleccionadas(animalId, solicitudIdExcluir) {
  const pool = require('../config/db');
  await pool.query(
    'UPDATE solicitud SET estado = ?, puntajeEvaluacion = 0 WHERE idAnimal = ? AND idSolicitud != ? AND estado = ?',
    ['No Seleccionada', animalId, solicitudIdExcluir, 'Pendiente']
  );
}

exports.eliminarSolicitud = async (req, res) => {
  try {
    const eliminado = await Solicitud.remove(req.params.id);
    if (!eliminado) return res.status(404).json({ error: 'Solicitud no encontrada' });
    res.json({ message: 'Solicitud eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar solicitud' });
  }
};

// Listar adopciones formalizadas
exports.listarAdopciones = async (req, res) => {
  try {
    const adopciones = await Adopcion.getAll();
    res.json(adopciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener adopciones' });
  }
};

// Obtener adopción por id
exports.obtenerAdopcion = async (req, res) => {
  try {
    const adopcion = await Adopcion.getById(req.params.id);
    if (!adopcion) return res.status(404).json({ error: 'Adopción no encontrada' });
    res.json(adopcion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar adopción' });
  }
};

// Formalizar adopción
exports.formalizarAdopcion = async (req, res) => {
  try {
    const { idSolicitud, contrato } = req.body;
    const idUsuario = req.user.id; // administrador que formaliza

    if (!idSolicitud) {
      return res.status(400).json({ error: 'idSolicitud es obligatorio' });
    }

    // Obtener solicitud y validar
    const solicitud = await Solicitud.getById(idSolicitud);
    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    if (solicitud.estado !== 'Aprobada') {
      return res.status(400).json({ error: 'La solicitud debe estar Aprobada para formalizar la adopción' });
    }

    // Verificar que el animal no esté ya adoptado
    const pool = require('../config/db');
    const [animalRows] = await pool.query('SELECT * FROM animal WHERE idAnimal = ?', [solicitud.idAnimal]);
    if (animalRows.length === 0) {
      return res.status(404).json({ error: 'Animal no encontrado' });
    }
    const animal = animalRows[0];
    if (animal.estado === 'Adoptado') {
      return res.status(409).json({ error: 'El animal ya está adoptado' });
    }

    // Crear registro de adopción
    const fecha = new Date().toISOString().split('T')[0];
    const nuevaAdopcion = await Adopcion.create({ idSolicitud, idUsuario, fecha, contrato });

    // Actualizar estado del animal a "Adoptado" usando el historial de estados
    try {
      await EstadoAnimal.updateAnimalStatus(solicitud.idAnimal, 'Adoptado', 'Adopción formalizada', `usuario:${idUsuario}`);
    } catch (e) {
      // Si falla el cambio de estado, dejamos trazado pero no deshacemos la adopción creada.
      console.error('Error al actualizar estado del animal a Adoptado:', e.message);
    }

    // Responder con datos enriquecidos
    const detalle = await Adopcion.getById(nuevaAdopcion.idAdopcion);
    res.status(201).json({
      message: 'Adopción formalizada exitosamente',
      adopcion: detalle
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Error al formalizar adopción' });
  }
};

// Controladores para Perfil de Adoptante Autenticado
exports.obtenerMiPerfil = async (req, res) => {
  try {
    // Obtener usuario autenticado
    const usuario = await User.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Buscar adoptante por email
    let adoptante = await Adoptante.getByEmail(usuario.email);
    
    // Si no existe, crear uno vacío con el email del usuario
    // Usar valores por defecto ya que nombre y apellido son NOT NULL
    if (!adoptante) {
      adoptante = await Adoptante.create({
        nombre: 'Pendiente',
        apellido: 'Pendiente',
        email: usuario.email,
        telefono: null,
        direccion: null,
        ocupacion: null
      });
    }

    res.json(adoptante);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

exports.actualizarMiPerfil = async (req, res) => {
  try {
    const { nombre, apellido, telefono, direccion, ocupacion } = req.body;

    // Validar campos obligatorios
    if (!nombre || !apellido) {
      return res.status(400).json({ 
        error: 'Los campos nombre y apellido son obligatorios',
        campos: { nombre, apellido }
      });
    }

    // Validar formato de teléfono (opcional pero si se proporciona debe ser válido)
    if (telefono) {
      const telefonoRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
      if (!telefonoRegex.test(telefono)) {
        return res.status(400).json({ error: 'Formato de teléfono inválido' });
      }
    }

    // Obtener usuario autenticado
    const usuario = await User.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Buscar adoptante por email
    let adoptante = await Adoptante.getByEmail(usuario.email);
    
    // Si no existe, crear uno nuevo
    if (!adoptante) {
      adoptante = await Adoptante.create({
        nombre,
        apellido,
        email: usuario.email,
        telefono: telefono || null,
        direccion: direccion || null,
        ocupacion: ocupacion || null
      });
    } else {
      // Actualizar adoptante existente (mantener el email del usuario)
      adoptante = await Adoptante.update(adoptante.idAdoptante, {
        nombre,
        apellido,
        email: usuario.email, // Mantener el email del usuario autenticado
        telefono: telefono || null,
        direccion: direccion || null,
        ocupacion: ocupacion || null
      });
    }

    res.json({
      message: 'Perfil actualizado exitosamente',
      adoptante
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};
