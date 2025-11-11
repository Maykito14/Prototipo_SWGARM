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
    console.log('Listando solicitudes...');
    const solicitudes = await Solicitud.getAll();
    console.log(`Se encontraron ${solicitudes.length} solicitudes`);
    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Error al obtener solicitudes', detalle: error.message });
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

exports.obtenerMisSolicitudes = async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const adoptante = await Adoptante.getByEmail(usuario.email);
    if (!adoptante || !adoptante.idAdoptante) {
      // No hay adoptante asociado aún: devolver lista vacía
      return res.json([]);
    }

    const solicitudes = await Solicitud.getByAdoptanteId(adoptante.idAdoptante);
    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener mis solicitudes:', error);
    res.status(500).json({ error: 'Error al obtener tus solicitudes' });
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
    const { datosAdoptante, idAnimal, respuestasFormulario, puntajeEvaluacion } = req.body;

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

    // Validar y preparar puntaje (debe estar entre 0 y 100)
    const puntaje = parseInt(puntajeEvaluacion) || 0;
    const puntajeFinal = Math.max(0, Math.min(100, puntaje));

    // Validar respuestas del formulario (debe ser un JSON válido si se proporciona)
    let respuestasGuardar = null;
    if (respuestasFormulario) {
      try {
        // Si es string, parsearlo para validar que es JSON válido
        if (typeof respuestasFormulario === 'string') {
          JSON.parse(respuestasFormulario);
          respuestasGuardar = respuestasFormulario;
        } else {
          respuestasGuardar = JSON.stringify(respuestasFormulario);
        }
      } catch (error) {
        return res.status(400).json({ error: 'Formato inválido en respuestasFormulario (debe ser JSON válido)' });
      }
    }

    // Crear solicitud
    const nuevaSolicitud = await Solicitud.create({
      idAdoptante: adoptante.idAdoptante,
      idAnimal: idAnimal,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
      puntajeEvaluacion: puntajeFinal,
      respuestasFormulario: respuestasGuardar
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

    const estadosValidos = ['Pendiente', 'Aprobada', 'Rechazada', 'No Seleccionada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        error: 'Estado inválido',
        estadosValidos
      });
    }

    // Obtener solicitud actual (ANTES de actualizarla)
    const solicitudActual = await Solicitud.getById(req.params.id);
    if (!solicitudActual) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const pool = require('../config/db');
    const estadoAnterior = solicitudActual.estado;
    
    console.log(`[DEBUG] ===== INICIO ACTUALIZACIÓN SOLICITUD =====`);
    console.log(`[DEBUG] Solicitud ID: ${req.params.id}`);
    console.log(`[DEBUG] Estado anterior: "${estadoAnterior}"`);
    console.log(`[DEBUG] Estado nuevo: "${estado}"`);
    console.log(`[DEBUG] ID Animal: ${solicitudActual.idAnimal}`);
    console.log(`[DEBUG] Condición check: estadoAnterior === 'Aprobada' && (estado === 'Pendiente' || estado === 'Rechazada')`);
    console.log(`[DEBUG] Resultado condición: ${estadoAnterior === 'Aprobada' && (estado === 'Pendiente' || estado === 'Rechazada')}`);

    // Si se aprueba una solicitud, marcar las demás del mismo animal como "Rechazada"
    if (estado === 'Aprobada') {
      console.log('[DEBUG] Aprobando solicitud - marcando otras como "Rechazada"');
      await marcarOtrasSolicitudesComoRechazadas(solicitudActual.idAnimal, req.params.id);
      
      // Obtener estado actual del animal
      const [animalRows] = await pool.query('SELECT estado FROM animal WHERE idAnimal = ?', [solicitudActual.idAnimal]);
      const estadoAnimalActual = animalRows[0]?.estado;
      
      // Cambiar estado del animal a "En proceso" (si no está ya en ese estado o "Adoptado")
      // Usar updateAnimalStatus para registrar el cambio en el historial
      if (estadoAnimalActual !== 'En proceso' && estadoAnimalActual !== 'Adoptado') {
        try {
          const idUsuario = req.user ? req.user.id : null;
          const usuarioStr = idUsuario ? `usuario:${idUsuario}` : 'sistema';
          await EstadoAnimal.updateAnimalStatus(
            solicitudActual.idAnimal,
            'En proceso',
            'Solicitud de adopción aprobada',
            usuarioStr
          );
          console.log(`[DEBUG] Animal ${solicitudActual.idAnimal} cambiado de "${estadoAnimalActual}" a "En proceso" (registrado en historial)`);
        } catch (error) {
          console.error(`[DEBUG] Error al actualizar estado del animal: ${error.message}`);
          // Si falla la validación de transición, hacer el cambio directo como fallback
          await pool.query(
            'UPDATE animal SET estado = ? WHERE idAnimal = ?',
            ['En proceso', solicitudActual.idAnimal]
          );
          console.log(`[DEBUG] Animal ${solicitudActual.idAnimal} cambiado directamente a "En proceso" (sin historial)`);
        }
      } else {
        console.log(`[DEBUG] Animal ${solicitudActual.idAnimal} ya está en "${estadoAnimalActual}" - no se cambia`);
      }
    }
    
    // Si se cambia de "Aprobada" a "Pendiente" o "Rechazada", restaurar otras solicitudes y verificar estado del animal
    let otrasAprobadasCount = 0;
    if (estadoAnterior === 'Aprobada' && (estado === 'Pendiente' || estado === 'Rechazada')) {
      console.log(`[DEBUG] Cambiando de Aprobada a ${estado} - restaurando otras solicitudes y verificando estado del animal`);
      
      // Primero, verificar qué solicitudes hay para este animal
      const [solicitudesAnimal] = await pool.query(
        'SELECT idSolicitud, estado FROM solicitud WHERE idAnimal = ? AND idSolicitud != ?',
        [solicitudActual.idAnimal, req.params.id]
      );
      console.log(`[DEBUG] Solicitudes del animal ${solicitudActual.idAnimal} (excluyendo ${req.params.id}):`, solicitudesAnimal);
      
      // Restaurar las solicitudes "Rechazada" del mismo animal a "Pendiente"
      // IMPORTANTE: Hacer esto ANTES de actualizar la solicitud actual
      // Usar una comparación más flexible para manejar posibles espacios o variaciones
      const [restauradas] = await pool.query(
        'UPDATE solicitud SET estado = ? WHERE idAnimal = ? AND idSolicitud != ? AND (estado = ? OR TRIM(estado) = ?)',
        ['Pendiente', solicitudActual.idAnimal, req.params.id, 'Rechazada', 'Rechazada']
      );
      console.log(`[DEBUG] Solicitudes restauradas de "Rechazada" a "Pendiente": ${restauradas.affectedRows}`);
      
      // Si aún no se restauraron, intentar restaurar todas las que no sean "Aprobada" o "Pendiente"
      // (esto cubre casos donde el estado podría tener variaciones)
      if (restauradas.affectedRows === 0 && solicitudesAnimal.length > 0) {
        console.log(`[DEBUG] No se restauraron solicitudes con la consulta estándar. Intentando restaurar todas las no aprobadas...`);
        const estadosNoRestaurar = ['Aprobada', 'Pendiente'];
        for (const solicitud of solicitudesAnimal) {
          if (!estadosNoRestaurar.includes(solicitud.estado) && solicitud.estado !== null) {
            console.log(`[DEBUG] Restaurando solicitud ${solicitud.idSolicitud} de estado "${solicitud.estado}" a "Pendiente"`);
            await pool.query(
              'UPDATE solicitud SET estado = ? WHERE idSolicitud = ?',
              ['Pendiente', solicitud.idSolicitud]
            );
          }
        }
      }
      
      // Verificar después de la actualización
      const [solicitudesDespues] = await pool.query(
        'SELECT idSolicitud, estado FROM solicitud WHERE idAnimal = ? AND idSolicitud != ?',
        [solicitudActual.idAnimal, req.params.id]
      );
      console.log(`[DEBUG] Solicitudes del animal después de restaurar:`, solicitudesDespues);
      
      // Verificar si hay otras solicitudes aprobadas para el mismo animal
      const [otrasAprobadas] = await pool.query(
        'SELECT COUNT(*) as count FROM solicitud WHERE idAnimal = ? AND idSolicitud != ? AND estado = ?',
        [solicitudActual.idAnimal, req.params.id, 'Aprobada']
      );
      
      otrasAprobadasCount = otrasAprobadas[0].count;
      console.log(`[DEBUG] Otras solicitudes aprobadas encontradas: ${otrasAprobadasCount}`);
      
      // Si no hay otras solicitudes aprobadas, cambiar el animal a "Disponible"
      // (incluso si estaba en "Adoptado", porque se está revirtiendo la aprobación)
      if (otrasAprobadasCount === 0) {
        console.log(`[DEBUG] No hay otras aprobadas - cambiando animal ${solicitudActual.idAnimal} a "Disponible"`);
        
        // Obtener estado actual del animal antes de cambiarlo
        const [animalCheckAntes] = await pool.query(
          'SELECT estado FROM animal WHERE idAnimal = ?',
          [solicitudActual.idAnimal]
        );
        const estadoAnimalAntes = animalCheckAntes[0]?.estado;
        
        // Usar updateAnimalStatus para registrar el cambio en el historial
        try {
          const idUsuario = req.user ? req.user.id : null;
          const usuarioStr = idUsuario ? `usuario:${idUsuario}` : 'sistema';
          await EstadoAnimal.updateAnimalStatus(
            solicitudActual.idAnimal,
            'Disponible',
            `Solicitud aprobada revertida a ${estado} - animal vuelve a estar disponible`,
            usuarioStr
          );
          console.log(`[DEBUG] Animal ${solicitudActual.idAnimal} cambiado de "${estadoAnimalAntes}" a "Disponible" (registrado en historial)`);
        } catch (error) {
          console.error(`[DEBUG] Error al actualizar estado del animal: ${error.message}`);
          // Si falla la validación de transición, hacer el cambio directo como fallback
          await pool.query(
            'UPDATE animal SET estado = ? WHERE idAnimal = ?',
            ['Disponible', solicitudActual.idAnimal]
          );
          console.log(`[DEBUG] Animal ${solicitudActual.idAnimal} cambiado directamente a "Disponible" (sin historial)`);
        }
        
        // Verificar el estado actual del animal después de la actualización
        const [animalCheck] = await pool.query(
          'SELECT estado FROM animal WHERE idAnimal = ?',
          [solicitudActual.idAnimal]
        );
        console.log(`[DEBUG] Estado actual del animal después de actualización: ${animalCheck[0]?.estado}`);
      } else {
        console.log(`[DEBUG] Hay ${otrasAprobadasCount} otras solicitudes aprobadas - manteniendo animal en "En proceso"`);
      }
    }

    // Si se rechaza, agregar motivo si se proporciona
    const datosActualizacion = { estado, puntajeEvaluacion };
    if (estado === 'Rechazada' && motivoRechazo) {
      datosActualizacion.motivoRechazo = motivoRechazo;
    }

    const actualizado = await Solicitud.update(req.params.id, datosActualizacion);
    
    // Actualizar campo 'activa' en adopciones relacionadas
    // Si la solicitud está "Aprobada", marcar adopciones como activas (1)
    // Si cambió de "Aprobada" a "Pendiente" o "Rechazada", marcar como inactivas (0)
    if (estado === 'Aprobada') {
      // Si se aprueba, activar adopciones relacionadas a esta solicitud
      await Adopcion.actualizarActivaPorSolicitud(req.params.id, true);
      console.log(`[DEBUG] Adopciones relacionadas a solicitud ${req.params.id} marcadas como activas`);
    } else if (estadoAnterior === 'Aprobada' && (estado === 'Pendiente' || estado === 'Rechazada')) {
      // Si se revierte una aprobación, desactivar adopciones relacionadas
      await Adopcion.actualizarActivaPorSolicitud(req.params.id, false);
      console.log(`[DEBUG] Adopciones relacionadas a solicitud ${req.params.id} marcadas como inactivas`);
    }
    
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
    
    // Preparar mensaje de acción según el cambio realizado
    let accion = 'Solicitud actualizada';
    if (estado === 'Aprobada') {
      accion = 'Solicitud aprobada y otras marcadas como "Rechazada". Animal cambiado a "En proceso".';
    } else if (estadoAnterior === 'Aprobada' && (estado === 'Pendiente' || estado === 'Rechazada')) {
      if (otrasAprobadasCount === 0) {
        accion = 'Solicitud actualizada. Otras solicitudes restauradas a "Pendiente". Animal vuelto a "Disponible" (no hay otras solicitudes aprobadas).';
      } else {
        accion = 'Solicitud actualizada. Otras solicitudes restauradas a "Pendiente". El animal sigue en "En proceso" (hay otras solicitudes aprobadas).';
      }
    }
    
    res.json({
      message: 'Solicitud actualizada exitosamente',
      solicitud: actualizado,
      accion: accion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar solicitud' });
  }
};

// Función auxiliar para marcar otras solicitudes como "Rechazada" cuando se aprueba una
async function marcarOtrasSolicitudesComoRechazadas(animalId, solicitudIdExcluir) {
  const pool = require('../config/db');
  // Marcar todas las solicitudes pendientes del mismo animal como "Rechazada"
  // Esto mantiene todos los datos de la solicitud (puntaje, respuestas, etc.)
  await pool.query(
    'UPDATE solicitud SET estado = ? WHERE idAnimal = ? AND idSolicitud != ? AND estado = ?',
    ['Rechazada', animalId, solicitudIdExcluir, 'Pendiente']
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

// Obtener adopciones por animal
exports.obtenerAdopcionesPorAnimal = async (req, res) => {
  try {
    const adopciones = await Adopcion.getByAnimalId(req.params.animalId);
    res.json(adopciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener adopciones del animal' });
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
