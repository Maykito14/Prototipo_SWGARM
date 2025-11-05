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
    const { nombre, especie, raza, edad, estado, fechaIngreso, descripcion, puntajeMinimo } = req.body;
    
    // Manejar archivo subido
    let foto = null;
    if (req.file) {
      // Guardar ruta relativa: uploads/images/nombre-archivo.ext
      foto = `uploads/images/${req.file.filename}`;
    }

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
      foto,
      puntajeMinimo: puntajeMin
    };

    const nuevo = await Animal.create(animalData);
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
    const { nombre, especie, raza, edad, estado, fechaIngreso, descripcion, puntajeMinimo } = req.body;
    
    // Obtener animal actual para preservar la foto si no se sube una nueva
    const animalActual = await Animal.getById(req.params.id);
    if (!animalActual) {
      return res.status(404).json({ error: 'Animal no encontrado' });
    }
    
    // Manejar archivo subido
    let foto = animalActual.foto; // Mantener foto existente por defecto
    if (req.file) {
      // Si se sube una nueva foto, usar la nueva
      foto = `uploads/images/${req.file.filename}`;
      
      // TODO: Eliminar foto antigua si existe
    }

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
      foto,
      puntajeMinimo: puntajeMin
    };

    const actualizado = await Animal.update(req.params.id, animalData);
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
