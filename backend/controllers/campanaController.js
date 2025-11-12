const fs = require('fs/promises');
const path = require('path');
const Campana = require('../models/campana');
const User = require('../models/User');
const Notificacion = require('../models/notificacion');
const PreferenciasNotificacion = require('../models/preferenciasNotificacion');

function obtenerArchivosSubidos(req) {
  if (!req.files) return [];
  const colecciones = Array.isArray(req.files) ? req.files : Object.values(req.files);
  return colecciones.flat();
}

function construirRutaCampana(file) {
  return `uploads/campanas/${file.filename}`;
}

async function eliminarArchivos(rutas) {
  if (!rutas || rutas.length === 0) return;
  await Promise.allSettled(
    rutas.map(async (ruta) => {
      if (!ruta) return;
      const absoluta = path.join(__dirname, '..', ruta);
      try {
        await fs.unlink(absoluta);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(`No se pudo eliminar el archivo ${absoluta}:`, error.message);
        }
      }
    })
  );
}

function parsearFecha(valor) {
  if (!valor) return null;
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) {
    return undefined;
  }
  return fecha.toISOString().split('T')[0];
}

function normalizarBoolean(valor, defecto = true) {
  if (valor === undefined || valor === null || valor === '') return defecto;
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'number') return valor !== 0;
  const texto = valor.toString().toLowerCase();
  return texto === 'true' || texto === '1' || texto === 'visible';
}

async function notificarCampana(campana) {
  try {
    if (!campana || !campana.visible) return;
    const usuarios = await User.getAdoptantesActivos();
    if (!usuarios || usuarios.length === 0) return;

    const mensaje = `Nueva campaña: ${campana.titulo}. Ingresá a Campañas para conocer los detalles.`;

    const cachePreferencias = new Map();

    await Promise.allSettled(
      usuarios.map((usuario) =>
        (async () => {
          let preferencias = cachePreferencias.get(usuario.idUsuario);
          if (!preferencias) {
            preferencias = await PreferenciasNotificacion.getByUsuario(usuario.idUsuario);
            cachePreferencias.set(usuario.idUsuario, preferencias);
          }

          if (
            preferencias &&
            (preferencias.notificarEnSistema === 0 || preferencias.notificarCampanas === 0)
          ) {
            return;
          }

          await Notificacion.create({
            idUsuario: usuario.idUsuario,
            tipo: 'Campaña',
            mensaje,
          });
        })()
      )
    );
  } catch (error) {
    console.error('Error al notificar campaña:', error);
  }
}

function validarCampanaPayload(payload, { esActualizacion = false } = {}) {
  const errores = [];
  const sanitized = {};

  if (!esActualizacion || payload.titulo !== undefined) {
    const titulo = (payload.titulo || '').toString().trim();
    if (!titulo) {
      errores.push('El título es obligatorio');
    } else if (titulo.length < 3) {
      errores.push('El título debe tener al menos 3 caracteres');
    } else if (titulo.length > 255) {
      errores.push('El título no puede exceder 255 caracteres');
    } else {
      sanitized.titulo = titulo;
    }
  }

  if (payload.descripcion !== undefined) {
    const descripcion = payload.descripcion?.toString().trim() || null;
    if (descripcion && descripcion.length > 5000) {
      errores.push('La descripción no puede exceder 5000 caracteres');
    } else {
      sanitized.descripcion = descripcion;
    }
  }

  if (payload.responsable !== undefined) {
    const responsable = payload.responsable?.toString().trim() || null;
    if (responsable && responsable.length > 255) {
      errores.push('El responsable no puede exceder 255 caracteres');
    } else {
      sanitized.responsable = responsable;
    }
  }

  if (payload.fechaInicio !== undefined) {
    const fechaInicio = parsearFecha(payload.fechaInicio);
    if (fechaInicio === undefined) {
      errores.push('La fecha de inicio es inválida');
    } else {
      sanitized.fechaInicio = fechaInicio;
    }
  }

  if (payload.fechaFin !== undefined) {
    const fechaFin = parsearFecha(payload.fechaFin);
    if (fechaFin === undefined) {
      errores.push('La fecha de finalización es inválida');
    } else {
      sanitized.fechaFin = fechaFin;
    }
  }

  if (
    sanitized.fechaInicio &&
    sanitized.fechaFin &&
    sanitized.fechaFin < sanitized.fechaInicio
  ) {
    errores.push('La fecha de finalización no puede ser anterior a la fecha de inicio');
  }

  if (payload.visible !== undefined) {
    sanitized.visible = normalizarBoolean(payload.visible, true);
  }

  return { errores, datos: sanitized };
}

exports.listarCampanas = async (req, res) => {
  try {
    const campanas = await Campana.getAll(true);
    res.json(campanas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener campañas' });
  }
};

exports.listarCampanasPublicas = async (req, res) => {
  try {
    const campanas = await Campana.getPublicas();
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

exports.obtenerCampanaPublica = async (req, res) => {
  try {
    const campana = await Campana.getById(req.params.id);
    if (!campana || !campana.visible) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }
    res.json(campana);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener campaña' });
  }
};

exports.crearCampana = async (req, res) => {
  const archivos = obtenerArchivosSubidos(req);
  const rutasFotos = archivos.map(construirRutaCampana);

  try {
    const { errores, datos } = validarCampanaPayload(
      {
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        responsable: req.body.responsable,
        fechaInicio: req.body.fechaInicio ?? req.body.fecha,
        fechaFin: req.body.fechaFin,
        visible: req.body.visible,
      },
      { esActualizacion: false }
    );

    if (errores.length > 0) {
      await eliminarArchivos(rutasFotos);
      return res.status(400).json({ error: errores.join('. ') });
    }

    const nuevaCampana = await Campana.create({
      idUsuario: req.user.id,
      ...datos,
    });

    if (rutasFotos.length > 0) {
      await Campana.addFotos(nuevaCampana.idCampaña, rutasFotos, rutasFotos[0]);
    }

    const campanaCompleta = await Campana.getById(nuevaCampana.idCampaña);

    await notificarCampana(campanaCompleta);

    res.status(201).json({
      message: 'Campaña registrada exitosamente',
      campana: campanaCompleta,
    });
  } catch (error) {
    console.error(error);
    await eliminarArchivos(rutasFotos);
    res.status(500).json({ error: 'Error al crear campaña' });
  }
};

exports.actualizarCampana = async (req, res) => {
  const archivos = obtenerArchivosSubidos(req);
  const rutasFotos = archivos.map(construirRutaCampana);

  try {
    const { id } = req.params;
    const campanaActual = await Campana.getById(id);
    if (!campanaActual) {
      await eliminarArchivos(rutasFotos);
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    const { errores, datos } = validarCampanaPayload(
      {
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        responsable: req.body.responsable,
        fechaInicio: req.body.fechaInicio ?? req.body.fecha,
        fechaFin: req.body.fechaFin,
        visible: req.body.visible,
      },
      { esActualizacion: true }
    );

    if (errores.length > 0) {
      await eliminarArchivos(rutasFotos);
      return res.status(400).json({ error: errores.join('. ') });
    }

    const visibleAnterior = campanaActual.visible;

    await Campana.update(id, datos);

    if (rutasFotos.length > 0) {
      const principalActual =
        campanaActual.fotoPrincipal || (rutasFotos.length > 0 ? rutasFotos[0] : null);
      await Campana.addFotos(id, rutasFotos, principalActual);
    }

    if (req.body.fotosEliminar) {
      let idsEliminar = [];
      try {
        if (Array.isArray(req.body.fotosEliminar)) {
          idsEliminar = req.body.fotosEliminar;
        } else {
          idsEliminar = JSON.parse(req.body.fotosEliminar);
        }
      } catch (error) {
        idsEliminar = req.body.fotosEliminar.toString().split(',');
      }
      idsEliminar = idsEliminar
        .map((valor) => parseInt(valor, 10))
        .filter((numero) => !Number.isNaN(numero));

      if (idsEliminar.length > 0) {
        const fotosActuales = await Campana.obtenerFotos(id);
        const fotosParaEliminar = fotosActuales.filter((foto) =>
          idsEliminar.includes(foto.idFoto)
        );

        await Promise.all(
          fotosParaEliminar.map(async (foto) => {
            await Campana.eliminarFoto(foto.idFoto, id);
            await eliminarArchivos([foto.ruta]);
          })
        );
      }
    }

    if (req.body.fotoPrincipal) {
      await Campana.establecerPrincipal(id, req.body.fotoPrincipal);
    }

    const campanaActualizada = await Campana.getById(id);

    if (visibleAnterior === 0 && campanaActualizada.visible) {
      await notificarCampana(campanaActualizada);
    }

    res.json({
      message: 'Campaña actualizada exitosamente',
      campana: campanaActualizada,
    });
  } catch (error) {
    console.error(error);
    await eliminarArchivos(rutasFotos);
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

    const fotos = campana.fotos || [];
    await Campana.delete(id);
    await eliminarArchivos(fotos.map((foto) => foto.ruta));

    res.json({ message: 'Campaña eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar campaña' });
  }
};

exports.actualizarVisibilidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { visible } = req.body;

    const campana = await Campana.getById(id);
    if (!campana) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    const nuevoEstado = normalizarBoolean(visible, true);
    if (campana.visible === (nuevoEstado ? 1 : 0)) {
      return res.json({
        message: 'La visibilidad ya se encontraba en el estado solicitado',
        campana,
      });
    }

    const campanaActualizada = await Campana.setVisible(id, nuevoEstado);

    if (campanaActualizada.visible) {
      await notificarCampana(campanaActualizada);
    }

    res.json({
      message: campanaActualizada.visible
        ? 'La campaña ahora es pública'
        : 'La campaña fue ocultada',
      campana: campanaActualizada,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cambiar visibilidad de la campaña' });
  }
};

exports.eliminarFoto = async (req, res) => {
  try {
    const { id, idFoto } = req.params;

    const campana = await Campana.getById(id);
    if (!campana) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    const foto = (campana.fotos || []).find((f) => f.idFoto === Number(idFoto));
    if (!foto) {
      return res.status(404).json({ error: 'Foto no encontrada' });
    }

    await Campana.eliminarFoto(foto.idFoto, campana.idCampaña);
    await eliminarArchivos([foto.ruta]);

    const campanaActualizada = await Campana.getById(id);

    res.json({
      message: 'Foto eliminada exitosamente',
      campana: campanaActualizada,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la foto de la campaña' });
  }
};

exports.establecerFotoPrincipal = async (req, res) => {
  try {
    const { id } = req.params;
    const { ruta } = req.body;

    if (!ruta) {
      return res.status(400).json({ error: 'Debe proporcionar la ruta de la foto principal' });
    }

    const campana = await Campana.getById(id);
    if (!campana) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    const existe = (campana.fotos || []).some((foto) => foto.ruta === ruta);
    if (!existe) {
      return res.status(404).json({ error: 'La foto indicada no pertenece a la campaña' });
    }

    await Campana.establecerPrincipal(id, ruta);
    const campanaActualizada = await Campana.getById(id);

    res.json({
      message: 'Foto principal actualizada',
      campana: campanaActualizada,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la foto principal' });
  }
};

