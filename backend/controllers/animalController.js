const Animal = require('../models/animal');

exports.listarAnimales = async (req, res) => {
  try {
    const animales = await Animal.getAll();
    res.json(animales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener animales' });
  }
};

exports.listarAnimalesDisponibles = async (req, res) => {
  try {
    const animales = await Animal.getDisponibles();
    res.json(animales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener animales disponibles' });
  }
};

exports.obtenerAnimal = async (req, res) => {
  try {
    const animal = await Animal.getById(req.params.id);
    if (!animal) return res.status(404).json({ error: 'Animal no encontrado' });
    res.json(animal);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar animal' });
  }
};

exports.crearAnimal = async (req, res) => {
  try {
    const { nombre, especie, raza, edad, estado, fechaIngreso, descripcion, foto } = req.body;

    // Validaciones básicas
    if (!nombre || !especie || !edad || !estado || !fechaIngreso) {
      return res.status(400).json({ 
        error: 'Campos obligatorios faltantes',
        campos: { nombre, especie, edad, estado, fechaIngreso }
      });
    }

    // Validar edad
    if (edad < 0 || edad > 30) {
      return res.status(400).json({ error: 'La edad debe estar entre 0 y 30 años' });
    }

    // Validar fecha
    const fecha = new Date(fechaIngreso);
    if (fecha > new Date()) {
      return res.status(400).json({ error: 'La fecha de ingreso no puede ser futura' });
    }

    // Verificar duplicados por nombre
    const duplicado = await Animal.findByName(nombre);
    if (duplicado) {
      return res.status(409).json({ 
        error: 'Ya existe un animal con ese nombre',
        animalExistente: { id: duplicado.idAnimal, nombre: duplicado.nombre }
      });
    }

    const nuevo = await Animal.create(req.body);
    res.status(201).json({
      message: 'Animal registrado exitosamente',
      animal: nuevo
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear animal' });
  }
};

exports.actualizarAnimal = async (req, res) => {
  try {
    const { nombre, especie, raza, edad, estado, fechaIngreso, descripcion, foto } = req.body;

    // Validaciones básicas
    if (!nombre || !especie || !edad || !estado || !fechaIngreso) {
      return res.status(400).json({ 
        error: 'Campos obligatorios faltantes',
        campos: { nombre, especie, edad, estado, fechaIngreso }
      });
    }

    // Validar edad
    if (edad < 0 || edad > 30) {
      return res.status(400).json({ error: 'La edad debe estar entre 0 y 30 años' });
    }

    // Validar fecha
    const fecha = new Date(fechaIngreso);
    if (fecha > new Date()) {
      return res.status(400).json({ error: 'La fecha de ingreso no puede ser futura' });
    }

    const actualizado = await Animal.update(req.params.id, req.body);
    res.json({
      message: 'Animal actualizado exitosamente',
      animal: actualizado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar animal' });
  }
};

exports.eliminarAnimal = async (req, res) => {
  try {
    const eliminado = await Animal.remove(req.params.id);
    if (!eliminado) return res.status(404).json({ error: 'Animal no encontrado' });
    res.json({ message: 'Animal eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar animal' });
  }
};
