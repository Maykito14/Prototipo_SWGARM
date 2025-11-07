document.addEventListener('DOMContentLoaded', () => {
  // Verificar que el usuario está autenticado
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('perfilForm');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');
  const emailInput = document.getElementById('email');
  const tablaSeguimientosBody = document.getElementById('tablaMisSeguimientos').querySelector('tbody');
  const listaNotificaciones = document.getElementById('listaNotificaciones');
  const btnMarcarTodasLeidas = document.getElementById('btnMarcarTodasLeidas');

  // Cargar perfil al iniciar
  cargarPerfil();
  cargarSeguimientos();
  cargarNotificaciones();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    limpiarMensajes();
    limpiarErrores();

    if (!validarFormulario()) {
      return;
    }

    try {
      const formData = new FormData(form);
      const datosPerfil = {
        nombre: formData.get('nombre').trim(),
        apellido: formData.get('apellido').trim(),
        telefono: formData.get('telefono').trim() || null,
        direccion: formData.get('direccion').trim() || null,
        ocupacion: formData.get('ocupacion').trim() || null
      };

      const response = await api.actualizarMiPerfil(datosPerfil);
      
      mostrarExito(response.message || 'Perfil actualizado exitosamente');
      cargarPerfil(); // Recargar para mostrar datos actualizados
      cargarSeguimientos();
    } catch (error) {
      mostrarError(error.message || 'Error al actualizar el perfil');
    }
  });

  listaNotificaciones.addEventListener('click', async (event) => {
    const action = event.target.dataset.action;
    const id = event.target.dataset.id;

    if (!action || !id) return;

    try {
      if (action === 'marcar') {
        await api.marcarNotificacionComoLeida(id);
      } else if (action === 'eliminar') {
        await api.eliminarNotificacion(id);
      }
      await cargarNotificaciones();
    } catch (error) {
      console.error('Error al actualizar notificación:', error);
      mostrarError('No se pudo actualizar la notificación');
    }
  });

  btnMarcarTodasLeidas.addEventListener('click', async () => {
    try {
      await api.marcarTodasNotificacionesComoLeidas();
      await cargarNotificaciones();
    } catch (error) {
      console.error('Error al marcar notificaciones:', error);
      mostrarError('No se pudieron marcar las notificaciones');
    }
  });

  async function cargarPerfil() {
    try {
      const perfil = await api.obtenerMiPerfil();
      
      // Llenar formulario con datos del perfil
      // Si los valores son "Pendiente", mostrar como vacío
      document.getElementById('nombre').value = (perfil.nombre === 'Pendiente' ? '' : perfil.nombre) || '';
      document.getElementById('apellido').value = (perfil.apellido === 'Pendiente' ? '' : perfil.apellido) || '';
      document.getElementById('email').value = perfil.email || '';
      document.getElementById('telefono').value = perfil.telefono || '';
      document.getElementById('direccion').value = perfil.direccion || '';
      document.getElementById('ocupacion').value = perfil.ocupacion || '';
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      mostrarError('Error al cargar los datos del perfil');
    }
  }

  function validarFormulario() {
    let esValido = true;
    const camposObligatorios = ['nombre', 'apellido'];

    camposObligatorios.forEach(campo => {
      const input = document.getElementById(campo);
      const errorSpan = document.getElementById(`${campo}-error`);
      
      if (!input.value.trim()) {
        mostrarErrorCampo(campo, 'Este campo es obligatorio');
        esValido = false;
      } else {
        limpiarErrorCampo(campo);
      }
    });

    // Validar formato de teléfono si se proporciona
    const telefono = document.getElementById('telefono').value.trim();
    if (telefono) {
      const telefonoRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
      if (!telefonoRegex.test(telefono)) {
        mostrarErrorCampo('telefono', 'Formato de teléfono inválido');
        esValido = false;
      } else {
        limpiarErrorCampo('telefono');
      }
    }

    return esValido;
  }

  function mostrarExito(mensaje) {
    successMessage.textContent = mensaje;
    successMessage.style.display = 'block';
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 5000);
  }

  function mostrarError(mensaje) {
    errorMessage.textContent = mensaje;
    errorMessage.style.display = 'block';
  }

  function limpiarMensajes() {
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
  }

  function mostrarErrorCampo(campo, mensaje) {
    const errorSpan = document.getElementById(`${campo}-error`);
    if (errorSpan) {
      errorSpan.textContent = mensaje;
      errorSpan.style.display = 'block';
    }
  }

  function limpiarErrorCampo(campo) {
    const errorSpan = document.getElementById(`${campo}-error`);
    if (errorSpan) {
      errorSpan.textContent = '';
      errorSpan.style.display = 'none';
    }
  }

  function limpiarErrores() {
    const campos = ['nombre', 'apellido', 'telefono'];
    campos.forEach(campo => limpiarErrorCampo(campo));
  }

  async function cargarSeguimientos() {
    try {
      const seguimientos = await api.getMisSeguimientos();
      if (!seguimientos || seguimientos.length === 0) {
        tablaSeguimientosBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 16px;">No tienes seguimientos registrados</td></tr>';
        return;
      }

      tablaSeguimientosBody.innerHTML = seguimientos.map(seg => `
        <tr>
          <td>${seg.idSeguimiento}</td>
          <td>${escapeHtml(seg.nombreAnimal || '')}</td>
          <td>${formatearFecha(seg.fechaProgramada)}</td>
          <td>${formatearFecha(seg.fechaRealizada)}</td>
          <td>${seg.estado}</td>
          <td>${seg.observaciones ? escapeHtml(seg.observaciones) : '-'}</td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Error al cargar seguimientos:', error);
      tablaSeguimientosBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 16px; color: #d32f2f;">Error al cargar tus seguimientos</td></tr>';
    }
  }

  async function cargarNotificaciones() {
    try {
      const notificaciones = await api.getMisNotificaciones();

      if (!notificaciones || notificaciones.length === 0) {
        listaNotificaciones.innerHTML = '<div style="text-align:center; padding: 12px; color:#666;">No tienes notificaciones</div>';
        return;
      }

      listaNotificaciones.innerHTML = notificaciones.map((notif) => {
        const fecha = formatearFecha(notif.fechaEnvio);
        const estadoBadge = notif.leido
          ? '<span class="badge" style="background:#4caf50;">Leída</span>'
          : '<span class="badge" style="background:#ff9800;">Pendiente</span>';
        const acciones = notif.leido
          ? ''
          : `<button class="btn btn-sm btn-primary" data-action="marcar" data-id="${notif.idNotificacion}">Marcar como leída</button>`;

        return `
          <div class="notification-item" data-id="${notif.idNotificacion}" style="border:1px solid #e0e0e0; border-radius:8px; padding:12px; background:#fff;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
              <strong>${escapeHtml(notif.tipo || 'Notificación')}</strong>
              <div style="display:flex; gap:8px; align-items:center;">
                ${estadoBadge}
                <small style="color:#666;">${fecha}</small>
              </div>
            </div>
            <p style="margin:8px 0; color:#333;">${escapeHtml(notif.mensaje || '')}</p>
            <div style="display:flex; gap:8px;">
              ${acciones}
              <button class="btn btn-sm btn-secondary" data-action="eliminar" data-id="${notif.idNotificacion}">Eliminar</button>
            </div>
          </div>
        `;
      }).join('');
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      listaNotificaciones.innerHTML = '<div style="text-align:center; padding: 12px; color:#d32f2f;">Error al cargar tus notificaciones</div>';
    }
  }

  function formatearFecha(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return fecha;
    return date.toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  function escapeHtml(texto) {
    if (!texto) return '';
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});

