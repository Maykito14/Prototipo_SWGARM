const Salud = require('../models/salud');

exports.listarControlesSalud = async (req, res) => {
  try {
    const controles = await Salud.getAll();
    res.json(controles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener controles de salud' });
  }
};

exports.obtenerControlSalud = async (req, res) => {
  try {
    const control = await Salud.getById(req.params.id);
    if (!control) return res.status(404).json({ error: 'Control de salud no encontrado' });
    res.json(control);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar control de salud' });
  }
};

exports.obtenerHistorialAnimal = async (req, res) => {
  try {
    const historial = await Salud.getByAnimalId(req.params.animalId);
    res.json(historial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener historial de salud del animal' });
  }
};

exports.crearControlSalud = async (req, res) => {
  try {
    const { idAnimal, vacunas, tratamientos, veterinario, fechaControl, observaciones } = req.body;

    // Validaciones básicas
    if (!idAnimal || !fechaControl) {
      return res.status(400).json({ 
        error: 'Campos obligatorios faltantes',
        campos: { idAnimal, fechaControl }
      });
    }

    // Validar fecha
    const fecha = new Date(fechaControl);
    if (fecha > new Date()) {
      return res.status(400).json({ error: 'La fecha del control no puede ser futura' });
    }

    // Validar que al menos un campo de salud esté presente
    if (!vacunas && !tratamientos && !veterinario && !observaciones) {
      return res.status(400).json({ 
        error: 'Debe registrar al menos una información de salud (vacunas, tratamientos, veterinario u observaciones)'
      });
    }

    const nuevoControl = await Salud.create(req.body);
    res.status(201).json({
      message: 'Control de salud registrado exitosamente',
      control: nuevoControl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear control de salud' });
  }
};

exports.actualizarControlSalud = async (req, res) => {
  try {
    const { vacunas, tratamientos, veterinario, fechaControl, observaciones } = req.body;

    // Validaciones básicas
    if (!fechaControl) {
      return res.status(400).json({ 
        error: 'La fecha del control es obligatoria'
      });
    }

    // Validar fecha
    const fecha = new Date(fechaControl);
    if (fecha > new Date()) {
      return res.status(400).json({ error: 'La fecha del control no puede ser futura' });
    }

    // Validar que al menos un campo de salud esté presente
    if (!vacunas && !tratamientos && !veterinario && !observaciones) {
      return res.status(400).json({ 
        error: 'Debe registrar al menos una información de salud (vacunas, tratamientos, veterinario u observaciones)'
      });
    }

    const actualizado = await Salud.update(req.params.id, req.body);
    res.json({
      message: 'Control de salud actualizado exitosamente',
      control: actualizado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar control de salud' });
  }
};

exports.eliminarControlSalud = async (req, res) => {
  try {
    const eliminado = await Salud.remove(req.params.id);
    if (!eliminado) return res.status(404).json({ error: 'Control de salud no encontrado' });
    res.json({ message: 'Control de salud eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar control de salud' });
  }
};

exports.obtenerUltimoControl = async (req, res) => {
  try {
    const ultimoControl = await Salud.getLatestByAnimal(req.params.animalId);
    res.json(ultimoControl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener último control de salud' });
  }
};
