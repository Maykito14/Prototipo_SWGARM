const Campana = require('../models/campana');

exports.listarCampanas = async (req, res) => {
  try {
    const campanas = await Campana.getAll();
    res.json(campanas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener campañas' });
  }
};

exports.obtenerCampana = async (req, res) => {
  try {
    const campana = await Campana.getById(req.params.id);
    if (!campana) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }
    res.json(campana);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener campaña' });
  }
};

exports.crearCampana = async (req, res) => {
  try {
    const { titulo, descripcion, responsable, fecha } = req.body;

    // Validar campos obligatorios
    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ 
        error: 'El título es obligatorio',
        campos: { titulo }
      });
    }

    // Validar longitud del título
    if (titulo.trim().length < 3) {
      return res.status(400).json({ 
        error: 'El título debe tener al menos 3 caracteres'
      });
    }

    if (titulo.trim().length > 45) {
      return res.status(400).json({ 
        error: 'El título no puede exceder 45 caracteres'
      });
    }

    // Validar longitud de descripción si se proporciona
    if (descripcion && descripcion.trim().length > 500) {
      return res.status(400).json({ 
        error: 'La descripción no puede exceder 500 caracteres'
      });
    }

    // Validar responsable si se proporciona
    if (responsable && responsable.trim().length > 45) {
      return res.status(400).json({ 
        error: 'El responsable no puede exceder 45 caracteres'
      });
    }

    // Validar fecha si se proporciona
    if (fecha) {
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) {
        return res.status(400).json({ 
          error: 'Formato de fecha inválido'
        });
      }
    }

    // Crear campaña
    const nuevaCampana = await Campana.create({
      idUsuario: req.user.id,
      titulo: titulo.trim(),
      descripcion: descripcion ? descripcion.trim() : null,
      responsable: responsable ? responsable.trim() : null,
      fecha: fecha || null
    });

    res.status(201).json({
      message: 'Campaña registrada exitosamente',
      campana: nuevaCampana
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear campaña' });
  }
};

exports.actualizarCampana = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, responsable, fecha } = req.body;

    // Verificar que la campaña existe
    const campanaActual = await Campana.getById(id);
    if (!campanaActual) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    // Validar campos obligatorios
    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ 
        error: 'El título es obligatorio'
      });
    }

    // Validar longitud del título
    if (titulo.trim().length < 3) {
      return res.status(400).json({ 
        error: 'El título debe tener al menos 3 caracteres'
      });
    }

    if (titulo.trim().length > 45) {
      return res.status(400).json({ 
        error: 'El título no puede exceder 45 caracteres'
      });
    }

    // Validar longitud de descripción si se proporciona
    if (descripcion && descripcion.trim().length > 500) {
      return res.status(400).json({ 
        error: 'La descripción no puede exceder 500 caracteres'
      });
    }

    // Validar responsable si se proporciona
    if (responsable && responsable.trim().length > 45) {
      return res.status(400).json({ 
        error: 'El responsable no puede exceder 45 caracteres'
      });
    }

    // Validar fecha si se proporciona
    if (fecha) {
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) {
        return res.status(400).json({ 
          error: 'Formato de fecha inválido'
        });
      }
    }

    // Actualizar campaña
    const campanaActualizada = await Campana.update(id, {
      titulo: titulo.trim(),
      descripcion: descripcion ? descripcion.trim() : null,
      responsable: responsable ? responsable.trim() : null,
      fecha: fecha || null
    });

    res.json({
      message: 'Campaña actualizada exitosamente',
      campana: campanaActualizada
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar campaña' });
  }
};

exports.eliminarCampana = async (req, res) => {
  try {
    const { id } = req.params;

    const campana = await Campana.getById(id);
    if (!campana) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    await Campana.delete(id);
    res.json({ message: 'Campaña eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar campaña' });
  }
};

