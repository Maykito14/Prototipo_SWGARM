document.addEventListener('DOMContentLoaded', () => {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  const preferenciasForm = document.getElementById('preferenciasForm');
  const listaNotificaciones = document.getElementById('listaNotificaciones');
  const btnMarcarTodasLeidas = document.getElementById('btnMarcarTodasLeidas');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');

  cargarPreferencias();
  cargarNotificaciones();

  preferenciasForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const preferencias = {
        notificarSolicitudAprobada: document.getElementById('notificarSolicitudAprobada').checked,
        notificarSolicitudRechazada: document.getElementById('notificarSolicitudRechazada').checked,
        notificarRecordatorioSeguimiento: document.getElementById('notificarRecordatorioSeguimiento').checked,
        notificarPorEmail: true, // Por ahora siempre true
        notificarEnSistema: document.getElementById('notificarEnSistema').checked
      };

      await api.actualizarMisPreferenciasNotificacion(preferencias);
      mostrarExito('Preferencias guardadas exitosamente');
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
      document.getElementById('notificarSolicitudAprobada').checked = preferencias.notificarSolicitudAprobada;
      document.getElementById('notificarSolicitudRechazada').checked = preferencias.notificarSolicitudRechazada;
      document.getElementById('notificarRecordatorioSeguimiento').checked = preferencias.notificarRecordatorioSeguimiento;
      document.getElementById('notificarEnSistema').checked = preferencias.notificarEnSistema;
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
        const fecha = new Date(notif.fechaEnvio).toLocaleString('es-ES');
        const claseLeida = notif.leido ? 'leida' : '';
        const badgeNoLeida = !notif.leido ? '<span class="badge-no-leida">Nueva</span>' : '';
        
        return `
          <div class="notificacion-card ${claseLeida}" data-id="${notif.idNotificacion}">
            <div class="contenido">
              <div class="tipo">${escapeHtml(notif.tipo)} ${badgeNoLeida}</div>
              <div>${escapeHtml(notif.mensaje)}</div>
              <div class="fecha">${fecha}</div>
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
});

