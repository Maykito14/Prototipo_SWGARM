document.addEventListener('DOMContentLoaded', () => {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  if (isAdmin && typeof isAdmin === 'function' && isAdmin()) {
    window.location.href = 'admin_dashboard.html';
    return;
  }

  const tabla = document.querySelector('#tablaMisSolicitudes tbody');
  const mensajeEstado = document.getElementById('estadoSolicitudes');
  const resumenEstados = document.getElementById('resumenEstados');
  const paginacion = document.getElementById('paginacionMisSolicitudes');

  let solicitudes = [];
  let paginaActual = 1;
  const registrosPorPagina = 10;

  inicializar();

  async function inicializar() {
    try {
      mostrarMensaje('Cargando solicitudes...', 'info');
      solicitudes = await api.getMisSolicitudes();
      if (!Array.isArray(solicitudes)) {
        solicitudes = [];
      }
      paginaActual = 1;
      renderizar();
      mostrarMensaje(
        solicitudes.length === 0
          ? 'Aún no registraste solicitudes de adopción.'
          : `Se encontraron ${solicitudes.length} solicitud(es).`,
        solicitudes.length === 0 ? 'info' : 'success'
      );
    } catch (error) {
      console.error('Error al cargar las solicitudes:', error);
      mostrarMensaje(error.message || 'Error al cargar tus solicitudes', 'error');
      solicitudes = [];
      renderizar();
    }
  }

  function renderizar() {
    renderizarTabla();
    actualizarResumen();
    actualizarPaginacion();
  }

  function renderizarTabla() {
    if (!tabla) return;

    if (solicitudes.length === 0) {
      tabla.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 20px;">No tenés solicitudes registradas</td>
        </tr>
      `;
      return;
    }

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const pagina = solicitudes.slice(inicio, inicio + registrosPorPagina);

    tabla.innerHTML = pagina.map((solicitud, index) => {
      const numero = inicio + index + 1;
      const animal = solicitud?.nombreAnimal
        ? `${escapeHtml(solicitud.nombreAnimal)}${solicitud.especie ? ` (${escapeHtml(solicitud.especie)})` : ''}`
        : 'Sin datos';
      const fecha = formatearFecha(solicitud?.fecha);
      const estado = solicitud?.estado || 'Pendiente';
      const motivo = solicitud?.motivoRechazo ? escapeHtml(solicitud.motivoRechazo) : '—';

      return `
        <tr>
          <td>${numero}</td>
          <td>${animal}</td>
          <td>${fecha}</td>
          <td><span class="status ${obtenerClaseEstado(estado)}">${escapeHtml(estado)}</span></td>
          <td>${motivo}</td>
        </tr>
      `;
    }).join('');
  }

  function actualizarResumen() {
    if (!resumenEstados) return;

    if (solicitudes.length === 0) {
      resumenEstados.innerHTML = '';
      return;
    }

    const totales = solicitudes.reduce(
      (acum, solicitud) => {
        const estado = (solicitud?.estado || 'Pendiente').toLowerCase();
        if (estado === 'aprobada') acum.aprobadas += 1;
        else if (estado === 'rechazada') acum.rechazadas += 1;
        else acum.pendientes += 1;
        return acum;
      },
      { aprobadas: 0, rechazadas: 0, pendientes: 0 }
    );

    resumenEstados.innerHTML = `
      <div class="resumen-item resumen-pendientes">Pendientes: <span class="valor">${totales.pendientes}</span></div>
      <div class="resumen-item resumen-aprobadas">Aprobadas: <span class="valor">${totales.aprobadas}</span></div>
      <div class="resumen-item resumen-rechazadas">Rechazadas: <span class="valor">${totales.rechazadas}</span></div>
    `;
  }

  function actualizarPaginacion() {
    if (!paginacion) return;

    const totalPaginas = Math.ceil(solicitudes.length / registrosPorPagina);

    if (totalPaginas <= 1) {
      paginacion.innerHTML = '';
      return;
    }

    const botones = [];
    for (let i = 1; i <= totalPaginas; i += 1) {
      botones.push(`
        <button
          type="button"
          class="pagina-btn ${i === paginaActual ? 'activa' : ''}"
          aria-label="Ir a la página ${i}"
          data-pagina="${i}"
        >
          ${i}
        </button>
      `);
    }

    paginacion.innerHTML = botones.join('');
    paginacion.querySelectorAll('button[data-pagina]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        const pagina = parseInt(event.currentTarget.getAttribute('data-pagina'), 10);
        if (!Number.isNaN(pagina) && pagina !== paginaActual) {
          paginaActual = pagina;
          renderizar();
          paginacion.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  function mostrarMensaje(texto, tipo = 'info') {
    if (!mensajeEstado) return;
    mensajeEstado.textContent = texto;
    mensajeEstado.classList.remove('info-message', 'error-message', 'success-message');
    const clase = tipo === 'error'
      ? 'error-message'
      : tipo === 'success'
        ? 'success-message'
        : 'info-message';
    mensajeEstado.classList.add(clase);
  }

  function obtenerClaseEstado(estado) {
    const normalizado = (estado || '').toLowerCase();
    if (normalizado === 'aprobada') return 'aprobada';
    if (normalizado === 'rechazada') return 'rechazada';
    return 'pendiente';
  }

  function formatearFecha(fecha) {
    if (!fecha) return '—';
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) {
      const partes = fecha.split('-');
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
      return fecha;
    }
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return value
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});


