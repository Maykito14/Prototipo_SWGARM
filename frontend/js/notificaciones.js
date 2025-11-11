document.addEventListener('DOMContentLoaded', () => {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  const preferenciasForm = document.getElementById('preferenciasForm');
  const listaNotificaciones = document.getElementById('listaNotificaciones');
  const btnMarcarTodasLeidas = document.getElementById('btnMarcarTodasLeidas');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');

  const session = getSession();
  const rolUsuario = session.user?.rol?.toLowerCase() || 'adoptante';
  const camposVisibles = inicializarCamposPorRol(rolUsuario);

  let preferenciasActuales = {
    notificarSolicitudAprobada: true,
    notificarSolicitudRechazada: true,
    notificarRecordatorioSeguimiento: true,
    notificarPorEmail: true,
    notificarEnSistema: true,
  };

  cargarPreferencias();
  cargarNotificaciones();

  preferenciasForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const preferencias = { ...preferenciasActuales };

      camposVisibles.forEach((campoId) => {
        const input = document.getElementById(campoId);
        if (input) {
          preferencias[campoId] = input.checked;
        }
      });

      preferencias.notificarPorEmail = true; // Mientras no exista toggle visual

      await api.actualizarMisPreferenciasNotificacion(preferencias);
      mostrarExito('Preferencias guardadas exitosamente');
      preferenciasActuales = preferencias;
    } catch (error) {
      mostrarError(error.message || 'Error al guardar preferencias');
    }
  });

  btnMarcarTodasLeidas.addEventListener('click', async () => {
    try {
      await api.marcarTodasNotificacionesComoLeidas();
      mostrarExito('Todas las notificaciones marcadas como leídas');
      cargarNotificaciones();
    } catch (error) {
      mostrarError(error.message || 'Error al marcar notificaciones');
    }
  });

  async function cargarPreferencias() {
    try {
      const preferencias = await api.getMisPreferenciasNotificacion();
      preferenciasActuales = {
        notificarSolicitudAprobada: preferencias?.notificarSolicitudAprobada ?? true,
        notificarSolicitudRechazada: preferencias?.notificarSolicitudRechazada ?? true,
        notificarRecordatorioSeguimiento: preferencias?.notificarRecordatorioSeguimiento ?? true,
        notificarPorEmail: preferencias?.notificarPorEmail ?? true,
        notificarEnSistema: preferencias?.notificarEnSistema ?? true,
      };

      camposVisibles.forEach((campoId) => {
        const input = document.getElementById(campoId);
        if (input && preferenciasActuales[campoId] !== undefined) {
          input.checked = preferenciasActuales[campoId];
        }
      });
    } catch (error) {
      console.error('Error al cargar preferencias:', error);
    }
  }

  async function cargarNotificaciones() {
    try {
      const notificaciones = await api.getMisNotificaciones();
      
      if (!notificaciones || notificaciones.length === 0) {
        listaNotificaciones.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">No tienes notificaciones</div>';
        btnMarcarTodasLeidas.style.display = 'none';
        return;
      }

      const noLeidas = notificaciones.filter(n => !n.leido);
      btnMarcarTodasLeidas.style.display = noLeidas.length > 0 ? '' : 'none';

      listaNotificaciones.innerHTML = notificaciones.map(notif => {
        const fechaEnvio = notif.fechaEnvio ? new Date(notif.fechaEnvio) : null;
        const fechaFormateada = fechaEnvio
          ? fechaEnvio.toLocaleDateString('es-AR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              timeZone: 'America/Argentina/Buenos_Aires',
            })
          : '—';
        const horaFormateada = fechaEnvio
          ? fechaEnvio.toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
              timeZone: 'America/Argentina/Buenos_Aires',
            })
          : '';
        const claseLeida = notif.leido ? 'leida' : '';
        const badgeNoLeida = !notif.leido ? '<span class="badge-no-leida">Nueva</span>' : '';
        
        return `
          <div class="notificacion-card ${claseLeida}" data-id="${notif.idNotificacion}">
            <div class="contenido">
              <div class="tipo">${escapeHtml(notif.tipo)} ${badgeNoLeida}</div>
              <div>${escapeHtml(notif.mensaje)}</div>
              <div class="fecha">
                <span class="fecha-dia">${fechaFormateada}</span>
                ${horaFormateada ? `<span class="fecha-hora">${horaFormateada}</span>` : ''}
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              ${!notif.leido ? `<button class="btn-table ver" onclick="marcarComoLeida(${notif.idNotificacion})" title="Marcar como leída">✓</button>` : ''}
              <button class="btn-table eliminar" onclick="eliminarNotificacion(${notif.idNotificacion})" title="Eliminar">🗑️</button>
            </div>
          </div>
        `;
      }).join('');
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      listaNotificaciones.innerHTML = '<div style="text-align: center; padding: 40px; color: #d32f2f;">Error al cargar notificaciones</div>';
    }
  }

  window.marcarComoLeida = async function(id) {
    try {
      await api.marcarNotificacionComoLeida(id);
      cargarNotificaciones();
    } catch (error) {
      mostrarError(error.message || 'Error al marcar notificación');
    }
  };

  window.eliminarNotificacion = async function(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      return;
    }
    
    try {
      await api.eliminarNotificacion(id);
      mostrarExito('Notificación eliminada');
      cargarNotificaciones();
    } catch (error) {
      mostrarError(error.message || 'Error al eliminar notificación');
    }
  };

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

  function escapeHtml(text) {
    if (text == null) return '';
    return text.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function inicializarCamposPorRol(rol) {
    const visibles = new Set();
    const grupos = document.querySelectorAll('[data-roles]');

    grupos.forEach((grupo) => {
      const rolesAttr = grupo.getAttribute('data-roles') || '';
      const rolesPermitidos = rolesAttr.split(',').map(r => r.trim().toLowerCase()).filter(Boolean);
      const esVisible = rolesPermitidos.length === 0 || rolesPermitidos.includes('todos') || rolesPermitidos.includes(rol);

      if (!esVisible) {
        grupo.classList.add('hidden');
        grupo.setAttribute('aria-hidden', 'true');
        const input = grupo.querySelector('input[type="checkbox"]');
        if (input) {
          input.checked = false;
        }
      } else {
        grupo.classList.remove('hidden');
        grupo.removeAttribute('aria-hidden');
        const input = grupo.querySelector('input[type="checkbox"]');
        if (input && input.id) {
          visibles.add(input.id);
        }
      }
    });

    return visibles;
  }
});

