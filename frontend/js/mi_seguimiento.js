document.addEventListener('DOMContentLoaded', () => {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  if (typeof isAdmin === 'function' && isAdmin()) {
    window.location.href = 'admin_dashboard.html';
    return;
  }

  const cuerpoPendientes = document.querySelector('#tablaSeguimientosPendientes tbody');
  const cuerpoHistorial = document.querySelector('#tablaHistorialSeguimientos tbody');
  const paginacionHistorial = document.getElementById('paginacionHistorialSeguimientos');
  const mensajeEstado = document.getElementById('estadoSeguimientos');
  const resumenSeguimientos = document.getElementById('resumenSeguimientos');

  let seguimientos = [];
  let pendientes = [];
  let historial = [];
  let paginaActualHistorial = 1;
  const registrosPorPaginaHistorial = 5;

  cargarSeguimientos();

  async function cargarSeguimientos() {
    try {
      actualizarMensaje('Cargando seguimientos...', 'info');
      const datos = await api.getMisSeguimientos();
      seguimientos = Array.isArray(datos) ? datos : [];

      pendientes = seguimientos.filter((item) => (item.estado || '').toLowerCase() !== 'completado');
      historial = [...seguimientos].sort((a, b) => {
        const fechaA = new Date(a.fechaProgramada || '1970-01-01');
        const fechaB = new Date(b.fechaProgramada || '1970-01-01');
        return fechaB.getTime() - fechaA.getTime();
      });

      paginaActualHistorial = 1;
      renderizarPendientes();
      renderizarHistorial();
      actualizarResumen();
      actualizarMensaje(
        seguimientos.length === 0
          ? 'Aún no tenés seguimientos programados.'
          : `Se encontraron ${seguimientos.length} seguimiento(s).`,
        seguimientos.length === 0 ? 'info' : 'success'
      );
    } catch (error) {
      console.error('Error al cargar seguimientos:', error);
      actualizarMensaje(error.message || 'Error al cargar los seguimientos', 'error');
      seguimientos = [];
      pendientes = [];
      historial = [];
      renderizarPendientes();
      renderizarHistorial();
      actualizarResumen();
    }
  }

  function renderizarPendientes() {
    if (!cuerpoPendientes) return;

    if (pendientes.length === 0) {
      cuerpoPendientes.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding: 16px;">No tenés seguimientos pendientes</td>
        </tr>
      `;
      return;
    }

    cuerpoPendientes.innerHTML = pendientes.map((item, index) => {
      const animal = formatearAnimal(item);
      const fechaProgramada = formatearFecha(item?.fechaProgramada);
      const estado = item?.estado || 'Pendiente';
      const observaciones = item?.observaciones ? escapeHtml(item.observaciones) : '—';

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${animal}</td>
          <td>${fechaProgramada}</td>
          <td><span class="status ${claseEstado(estado)}">${escapeHtml(estado)}</span></td>
          <td>${observaciones}</td>
        </tr>
      `;
    }).join('');
  }

  function renderizarHistorial() {
    if (!cuerpoHistorial || !paginacionHistorial) return;

    if (historial.length === 0) {
      cuerpoHistorial.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding: 16px;">Sin historial de seguimientos</td>
        </tr>
      `;
      paginacionHistorial.innerHTML = '';
      return;
    }

    const totalPaginas = Math.ceil(historial.length / registrosPorPaginaHistorial);
    if (paginaActualHistorial > totalPaginas) paginaActualHistorial = totalPaginas;

    const inicio = (paginaActualHistorial - 1) * registrosPorPaginaHistorial;
    const pagina = historial.slice(inicio, inicio + registrosPorPaginaHistorial);

    cuerpoHistorial.innerHTML = pagina.map((item, index) => {
      const numero = inicio + index + 1;
      const animal = formatearAnimal(item);
      const fechaProgramada = formatearFecha(item?.fechaProgramada);
      const fechaRealizada = item?.fechaRealizada ? formatearFecha(item.fechaRealizada) : '—';
      const observaciones = item?.observaciones ? escapeHtml(item.observaciones) : '—';
      const estado = item?.estado || 'Pendiente';

      return `
        <tr>
          <td>${numero}</td>
          <td>${animal}</td>
          <td>${fechaProgramada}</td>
          <td>${fechaRealizada}</td>
          <td>${observaciones}</td>
          <td><span class="status ${claseEstado(estado)}">${escapeHtml(estado)}</span></td>
        </tr>
      `;
    }).join('');

    paginacionHistorial.innerHTML = generarControlesPaginacion(historial.length, paginaActualHistorial, registrosPorPaginaHistorial);
    paginacionHistorial.querySelectorAll('button[data-pagina]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        const pagina = parseInt(event.currentTarget.getAttribute('data-pagina'), 10);
        if (!Number.isNaN(pagina) && pagina !== paginaActualHistorial) {
          paginaActualHistorial = pagina;
          renderizarHistorial();
          paginacionHistorial.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  function generarControlesPaginacion(totalRegistros, paginaActual, registrosPorPagina) {
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    if (totalPaginas <= 1) return '';

    const botones = [];
    for (let i = 1; i <= totalPaginas; i += 1) {
      botones.push(`
        <button
          type="button"
          class="pagina-btn ${i === paginaActual ? 'activa' : ''}"
          data-pagina="${i}"
          aria-label="Ir a la página ${i}"
        >
          ${i}
        </button>
      `);
    }

    return botones.join('');
  }

  function actualizarResumen() {
    if (!resumenSeguimientos) return;
    if (seguimientos.length === 0) {
      resumenSeguimientos.innerHTML = '';
      return;
    }

    const totales = seguimientos.reduce(
      (acc, item) => {
        const estado = (item.estado || 'Pendiente').toLowerCase();
        if (estado === 'completado') acc.completados += 1;
        else acc.pendientes += 1;
        return acc;
      },
      { pendientes: 0, completados: 0 }
    );

    resumenSeguimientos.innerHTML = `
      <div class="resumen-item resumen-pendientes">Pendientes: <span class="valor">${totales.pendientes}</span></div>
      <div class="resumen-item resumen-aprobadas">Completados: <span class="valor">${totales.completados}</span></div>
    `;
  }

  function actualizarMensaje(texto, tipo = 'info') {
    if (!mensajeEstado) return;
    mensajeEstado.textContent = texto;
    mensajeEstado.classList.remove('info-message', 'success-message', 'error-message');
    mensajeEstado.classList.add(
      tipo === 'error' ? 'error-message' : tipo === 'success' ? 'success-message' : 'info-message'
    );
  }

  function formatearAnimal(item) {
    if (!item) return 'Sin datos';
    const nombre = item.nombreAnimal ? escapeHtml(item.nombreAnimal) : 'Sin nombre';
    if (item.especie) {
      return `${nombre} (${escapeHtml(item.especie)})`;
    }
    return nombre;
  }

  function formatearFecha(valor) {
    if (!valor) return '—';
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
      const partes = valor.toString().split('-');
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
      return valor;
    }
    return fecha.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  function claseEstado(estado) {
    const normalizado = (estado || '').toLowerCase();
    if (normalizado === 'completado') return 'aprobada';
    if (normalizado === 'rechazado' || normalizado === 'cancelado') return 'rechazada';
    return 'pendiente';
  }

  function escapeHtml(texto) {
    if (texto === null || texto === undefined) return '';
    return texto
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});


