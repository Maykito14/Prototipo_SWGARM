const { Adoptante, Solicitud } = require('../models/adopcion');

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
