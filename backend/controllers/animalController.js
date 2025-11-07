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

function obtenerArchivosSubidos(req) {
  if (!req) return [];
  if (Array.isArray(req.files)) return req.files;

  let archivos = [];
  if (req.files && typeof req.files === 'object') {
    if (Array.isArray(req.files.fotos)) archivos = archivos.concat(req.files.fotos);
    if (Array.isArray(req.files.foto)) archivos = archivos.concat(req.files.foto);
  }

  if (req.file) archivos.push(req.file);

  return archivos;
}

exports.crearAnimal = async (req, res) => {
  try {
    const { nombre, especie, raza, edad, estado, fechaIngreso, descripcion, puntajeMinimo } = req.body;

    const archivos = obtenerArchivosSubidos(req);
    const rutasFotos = archivos.map((file) => `uploads/images/${file.filename}`);
    const fotoPrincipal = rutasFotos[0] || null;

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

    // Validar puntaje mínimo
    const puntajeMin = parseInt(puntajeMinimo) || 0;
    if (puntajeMin < 0 || puntajeMin > 100) {
      return res.status(400).json({ error: 'El puntaje mínimo debe estar entre 0 y 100' });
    }

    // Verificar duplicados por nombre
    const duplicado = await Animal.findByName(nombre);
    if (duplicado) {
      return res.status(409).json({ 
        error: 'Ya existe un animal con ese nombre',
        animalExistente: { id: duplicado.idAnimal, nombre: duplicado.nombre }
      });
    }

    // Crear objeto con los datos del animal incluyendo la foto
    const animalData = {
      nombre,
      especie,
      raza,
      edad: parseInt(edad),
      estado,
      fechaIngreso,
      descripcion,
      puntajeMinimo: puntajeMin
    };

    const nuevo = await Animal.create(animalData);

    if (rutasFotos.length > 0) {
      await Animal.addFotos(nuevo.idAnimal, rutasFotos, fotoPrincipal || rutasFotos[0]);
    }

    const animalCompleto = await Animal.getById(nuevo.idAnimal);
    res.status(201).json({
      message: 'Animal registrado exitosamente',
      animal: animalCompleto
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear animal' });
  }
};

exports.actualizarAnimal = async (req, res) => {
  try {
    const { nombre, especie, raza, edad, estado, fechaIngreso, descripcion, puntajeMinimo } = req.body;

    // Obtener animal actual para preservar la foto si no se sube una nueva
    const animalActual = await Animal.getById(req.params.id);
    if (!animalActual) {
      return res.status(404).json({ error: 'Animal no encontrado' });
    }

    const archivos = obtenerArchivosSubidos(req);
    const rutasFotos = archivos.map((file) => `uploads/images/${file.filename}`);
    const nuevaPrincipal = rutasFotos[0] || null;

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

    // Validar puntaje mínimo
    const puntajeMin = parseInt(puntajeMinimo) || 0;
    if (puntajeMin < 0 || puntajeMin > 100) {
      return res.status(400).json({ error: 'El puntaje mínimo debe estar entre 0 y 100' });
    }

    // Crear objeto con los datos del animal incluyendo la foto
    const animalData = {
      nombre,
      especie,
      raza,
      edad: parseInt(edad),
      estado,
      fechaIngreso,
      descripcion,
      puntajeMinimo: puntajeMin
    };

    const actualizado = await Animal.update(req.params.id, animalData);

    if (rutasFotos.length > 0) {
      await Animal.addFotos(req.params.id, rutasFotos, nuevaPrincipal);
    }

    const animalCompleto = await Animal.getById(req.params.id);
    res.json({
      message: 'Animal actualizado exitosamente',
      animal: animalCompleto
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
