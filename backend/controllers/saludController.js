const Salud = require('../models/salud');
const EstadoAnimal = require('../models/estadoAnimal');
const pool = require('../config/db');

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
    const { idAnimal, vacunas, tratamientos, veterinario, fechaControl, fechaProgramada, observaciones } = req.body;

    // Validaciones básicas
    if (!idAnimal || !fechaControl) {
      return res.status(400).json({ 
        error: 'Campos obligatorios faltantes',
        campos: { idAnimal, fechaControl }
      });
    }

    // Normalizar fechas al formato YYYY-MM-DD (formato MySQL DATE)
    const fechaControlNormalizada = normalizarFecha(fechaControl);
    if (!fechaControlNormalizada) {
      return res.status(400).json({ error: 'Formato de fecha de control inválido. Use formato YYYY-MM-DD' });
    }

    const fechaProgramadaNormalizada = fechaProgramada ? normalizarFecha(fechaProgramada) : null;
    if (fechaProgramada && !fechaProgramadaNormalizada) {
      return res.status(400).json({ error: 'Formato de fecha programada inválido. Use formato YYYY-MM-DD' });
    }

    // Validar que al menos un campo de salud esté presente
    if (!vacunas && !tratamientos && !veterinario && !observaciones) {
      return res.status(400).json({ 
        error: 'Debe registrar al menos una información de salud (vacunas, tratamientos, veterinario u observaciones)'
      });
    }

    const nuevoControl = await Salud.create({
      ...req.body,
      fechaControl: fechaControlNormalizada,
      fechaProgramada: fechaProgramadaNormalizada
    });
    
    // Sincronizar estado del animal después de crear el control
    await sincronizarEstadoAnimal(idAnimal);
    
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
    const { vacunas, tratamientos, veterinario, fechaControl, fechaProgramada, observaciones } = req.body;

    // Normalizar fechas al formato YYYY-MM-DD si se proporcionan
    const datosActualizacion = { ...req.body };
    
    if (fechaControl) {
      const fechaControlNormalizada = normalizarFecha(fechaControl);
      if (!fechaControlNormalizada) {
        return res.status(400).json({ error: 'Formato de fecha de control inválido. Use formato YYYY-MM-DD' });
      }
      datosActualizacion.fechaControl = fechaControlNormalizada;
    }
    
    if (fechaProgramada !== undefined) {
      if (fechaProgramada) {
        const fechaProgramadaNormalizada = normalizarFecha(fechaProgramada);
        if (!fechaProgramadaNormalizada) {
          return res.status(400).json({ error: 'Formato de fecha programada inválido. Use formato YYYY-MM-DD' });
        }
        datosActualizacion.fechaProgramada = fechaProgramadaNormalizada;
      } else {
        datosActualizacion.fechaProgramada = null;
      }
    }

    const actualizado = await Salud.update(req.params.id, datosActualizacion);
    
    // Sincronizar estado del animal después de actualizar el control
    if (actualizado && actualizado.idAnimal) {
      await sincronizarEstadoAnimal(actualizado.idAnimal);
    }
    
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
    // Obtener el control antes de eliminarlo para conocer el idAnimal
    const control = await Salud.getById(req.params.id);
    if (!control) {
      return res.status(404).json({ error: 'Control de salud no encontrado' });
    }
    
    const idAnimal = control.idAnimal;
    const eliminado = await Salud.remove(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ error: 'Control de salud no encontrado' });
    }
    
    // Sincronizar estado del animal después de eliminar el control
    await sincronizarEstadoAnimal(idAnimal);
    
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

// Función helper para normalizar fechas al formato YYYY-MM-DD (formato MySQL DATE)
function normalizarFecha(fecha) {
  if (!fecha) return null;
  
  // Si ya está en formato YYYY-MM-DD, retornarlo
  if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return fecha;
  }
  
  // Convertir a Date y formatear
  const fechaObj = new Date(fecha);
  if (isNaN(fechaObj.getTime())) {
    return null;
  }
  
  // Formato YYYY-MM-DD (formato MySQL DATE)
  const año = fechaObj.getFullYear();
  const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
  const dia = String(fechaObj.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

// Función helper para sincronizar el estado del animal basado en sus controles de salud
async function sincronizarEstadoAnimal(idAnimal) {
  try {
    // Obtener estado actual del animal
    const [animalRows] = await pool.query('SELECT estado FROM animal WHERE idAnimal = ?', [idAnimal]);
    if (animalRows.length === 0) {
      console.log(`Animal ${idAnimal} no encontrado para sincronización`);
      return;
    }
    
    const estadoActualAnimal = animalRows[0].estado;
    
    // Estados que no deben cambiar a "Disponible" automáticamente
    const estadosProtegidos = ['Adoptado', 'En proceso'];
    
    // Si el animal está en un estado protegido, no cambiar automáticamente
    if (estadosProtegidos.includes(estadoActualAnimal)) {
      console.log(`Animal ${idAnimal} está en estado protegido "${estadoActualAnimal}", no se sincroniza automáticamente`);
      return;
    }
    
    // Obtener todos los controles de salud del animal
    const controles = await Salud.getByAnimalId(idAnimal);
    
    if (controles.length === 0) {
      // Si no hay controles, el animal debe estar Disponible (si no está protegido)
      if (estadoActualAnimal !== 'Disponible' && !estadosProtegidos.includes(estadoActualAnimal)) {
        await EstadoAnimal.updateAnimalStatus(
          idAnimal, 
          'Disponible', 
          'No hay controles de salud activos', 
          'sistema'
        );
      }
      return;
    }
    
    // Verificar si hay algún control "En Tratamiento"
    const tieneControlEnTratamiento = controles.some(control => {
      // Calcular estado si no está definido
      let estadoControl = control.estado;
      if (!estadoControl) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaControl = control.fechaProgramada ? new Date(control.fechaProgramada) : new Date(control.fechaControl);
        fechaControl.setHours(0, 0, 0, 0);
        
        if (control.fechaAltaVeterinaria) {
          estadoControl = 'Realizado';
        } else if (fechaControl > hoy) {
          estadoControl = 'Pendiente';
        } else {
          estadoControl = 'En Tratamiento';
        }
      }
      return estadoControl === 'En Tratamiento';
    });
    
    if (tieneControlEnTratamiento) {
      // Si hay un control "En Tratamiento", el animal debe estar "En tratamiento"
      if (estadoActualAnimal !== 'En tratamiento') {
        try {
          await EstadoAnimal.updateAnimalStatus(
            idAnimal, 
            'En tratamiento', 
            'Control de salud en tratamiento activo', 
            'sistema'
          );
        } catch (error) {
          // Si la transición no es válida, solo registrar el error
          console.log(`No se pudo cambiar estado del animal ${idAnimal} a "En tratamiento":`, error.message);
        }
      }
    } else {
      // Si todos los controles están "Pendiente" o "Realizado", el animal debe estar "Disponible"
      // Pero solo si no está en un estado protegido
      if (estadoActualAnimal !== 'Disponible' && !estadosProtegidos.includes(estadoActualAnimal)) {
        try {
          await EstadoAnimal.updateAnimalStatus(
            idAnimal, 
            'Disponible', 
            'Todos los controles de salud están pendientes o realizados', 
            'sistema'
          );
        } catch (error) {
          // Si la transición no es válida, solo registrar el error
          console.log(`No se pudo cambiar estado del animal ${idAnimal} a "Disponible":`, error.message);
        }
      }
    }
  } catch (error) {
    console.error(`Error al sincronizar estado del animal ${idAnimal}:`, error);
    // No lanzar el error para no interrumpir el flujo principal
  }
}

// Dar alta veterinaria a un control
exports.darAltaVeterinaria = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener control actual
    const control = await Salud.getById(id);
    if (!control) {
      return res.status(404).json({ error: 'Control de salud no encontrado' });
    }
    
    // Si ya tiene alta, no hacer nada
    if (control.fechaAltaVeterinaria) {
      return res.status(400).json({ error: 'Este control ya tiene alta veterinaria' });
    }
    
    // Dar alta (fecha actual en formato YYYY-MM-DD)
    const fechaAlta = normalizarFecha(new Date());
    const actualizado = await Salud.update(id, {
      fechaAltaVeterinaria: fechaAlta,
      estado: 'Realizado'
    });
    
    // Sincronizar estado del animal después de dar alta veterinaria
    if (actualizado && actualizado.idAnimal) {
      await sincronizarEstadoAnimal(actualizado.idAnimal);
    }
    
    res.json({
      message: 'Alta veterinaria registrada exitosamente',
      control: actualizado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al dar alta veterinaria' });
  }
};

// Cambiar estado del control (Realizado o Pendiente) y reprogramar si es necesario
exports.cambiarEstadoControl = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, fechaProgramada } = req.body;
    
    // Validar estado
    const estadosValidos = ['Pendiente', 'En Tratamiento', 'Realizado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        error: 'Estado inválido',
        estadosValidos
      });
    }
    
    // Obtener control actual
    const control = await Salud.getById(id);
    if (!control) {
      return res.status(404).json({ error: 'Control de salud no encontrado' });
    }
    
    const datosActualizacion = { estado };
    
    // Si se cambia a Pendiente, se puede reprogramar
    if (estado === 'Pendiente' && fechaProgramada) {
      const fechaProgramadaNormalizada = normalizarFecha(fechaProgramada);
      if (!fechaProgramadaNormalizada) {
        return res.status(400).json({ error: 'Formato de fecha programada inválido. Use formato YYYY-MM-DD' });
      }
      datosActualizacion.fechaProgramada = fechaProgramadaNormalizada;
      // Si se reprograma, quitar el alta veterinaria si existe
      if (control.fechaAltaVeterinaria) {
        datosActualizacion.fechaAltaVeterinaria = null;
      }
    }
    
    // Si se cambia a Realizado, dar alta veterinaria
    if (estado === 'Realizado' && !control.fechaAltaVeterinaria) {
      datosActualizacion.fechaAltaVeterinaria = normalizarFecha(new Date());
    }
    
    // Si se cambia a En Tratamiento, quitar alta veterinaria si existe
    if (estado === 'En Tratamiento' && control.fechaAltaVeterinaria) {
      datosActualizacion.fechaAltaVeterinaria = null;
    }
    
    const actualizado = await Salud.update(id, datosActualizacion);
    
    // Sincronizar estado del animal después de cambiar el estado del control
    if (actualizado && actualizado.idAnimal) {
      await sincronizarEstadoAnimal(actualizado.idAnimal);
    }
    
    res.json({
      message: 'Estado del control actualizado exitosamente',
      control: actualizado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cambiar estado del control' });
  }
};