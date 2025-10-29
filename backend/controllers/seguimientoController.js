const Seguimiento = require('../models/seguimiento');
const pool = require('../config/db');

exports.crearSeguimiento = async (req, res) => {
  try {
    const { idAdopcion, idAnimal, fechaProgramada, observaciones } = req.body;

    if (!idAdopcion || !idAnimal || !fechaProgramada) {
      return res.status(400).json({ error: 'Campos obligatorios: idAdopcion, idAnimal, fechaProgramada' });
    }

    // Validar adopción y correspondencia con animal
    const [adopRows] = await pool.query('SELECT * FROM adopcion WHERE idAdopcion = ?', [idAdopcion]);
    if (adopRows.length === 0) return res.status(404).json({ error: 'Adopción no encontrada' });

    const [solRows] = await pool.query('SELECT * FROM solicitud WHERE idSolicitud = ?', [adopRows[0].idSolicitud]);
    if (solRows.length === 0 || solRows[0].idAnimal !== Number(idAnimal)) {
      return res.status(400).json({ error: 'La adopción no corresponde al animal indicado' });
    }

    const nuevo = await Seguimiento.create({ idAdopcion, idAnimal, fechaProgramada, observaciones });
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
    const hoy = new Date().toISOString().split('T')[0];
    const lista = await Seguimiento.getPendientesHasta(hoy);
    res.json(lista);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener seguimientos pendientes' });
  }
};


