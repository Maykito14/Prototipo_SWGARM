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
    const nuevo = await Animal.create(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear animal' });
  }
};

exports.actualizarAnimal = async (req, res) => {
  try {
    const actualizado = await Animal.update(req.params.id, req.body);
    res.json(actualizado);
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
