const EstadoAnimal = require('../models/estadoAnimal');

exports.listarCambiosEstado = async (req, res) => {
  try {
    const cambios = await EstadoAnimal.getAll();
    res.json(cambios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cambios de estado' });
  }
};

exports.obtenerCambioEstado = async (req, res) => {
  try {
    const cambio = await EstadoAnimal.getById(req.params.id);
    if (!cambio) return res.status(404).json({ error: 'Cambio de estado no encontrado' });
    res.json(cambio);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar cambio de estado' });
  }
};

exports.obtenerHistorialAnimal = async (req, res) => {
  try {
    const historial = await EstadoAnimal.getByAnimalId(req.params.animalId);
    res.json(historial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener historial de estados del animal' });
  }
};

exports.cambiarEstadoAnimal = async (req, res) => {
  try {
    const { animalId, nuevoEstado, motivo } = req.body;
    const usuario = req.user.email; // Obtener usuario del token

    // Validaciones básicas
    if (!animalId || !nuevoEstado) {
      return res.status(400).json({ 
        error: 'Campos obligatorios faltantes',
        campos: { animalId, nuevoEstado }
      });
    }

    // Validar que el animal existe
    const pool = require('../config/db');
    const [animalRows] = await pool.query('SELECT * FROM animal WHERE idAnimal = ?', [animalId]);
    if (animalRows.length === 0) {
      return res.status(404).json({ error: 'Animal no encontrado' });
    }

    const animal = animalRows[0];

    // Validar transición de estado
    if (!EstadoAnimal.validarTransicionEstado(animal.estado, nuevoEstado)) {
      return res.status(400).json({ 
        error: `Transición no válida: ${animal.estado} → ${nuevoEstado}`,
        estadoActual: animal.estado,
        estadoSolicitado: nuevoEstado
      });
    }

    // Realizar cambio de estado
    const resultado = await EstadoAnimal.updateAnimalStatus(animalId, nuevoEstado, motivo, usuario);

    res.json({
      message: `Estado del animal actualizado exitosamente: ${animal.nombre}`,
      cambio: resultado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Error al cambiar estado del animal' });
  }
};

exports.obtenerEstadosDisponibles = async (req, res) => {
  try {
    const { animalId } = req.params;
    
    // Obtener estado actual del animal
    const pool = require('../config/db');
    const [animalRows] = await pool.query('SELECT estado FROM animal WHERE idAnimal = ?', [animalId]);
    
    if (animalRows.length === 0) {
      return res.status(404).json({ error: 'Animal no encontrado' });
    }

    const estadoActual = animalRows[0].estado;
    const estadosDisponibles = await EstadoAnimal.getEstadosDisponibles(estadoActual);

    res.json({
      estadoActual,
      estadosDisponibles,
      puedeCambiar: estadosDisponibles.length > 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener estados disponibles' });
  }
};

exports.eliminarCambioEstado = async (req, res) => {
  try {
    const eliminado = await EstadoAnimal.remove(req.params.id);
    if (!eliminado) return res.status(404).json({ error: 'Cambio de estado no encontrado' });
    res.json({ message: 'Cambio de estado eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cambio de estado' });
  }
};
