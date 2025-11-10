document.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();

  const animalBusquedaInput = document.getElementById('animalBusqueda');
  const listaAnimalesForm = document.getElementById('listaAnimalesSeguimiento');
  const listaAnimalesFiltro = document.getElementById('listaAnimalesSeguimientoFiltro');
  const idAnimalHidden = document.getElementById('idAnimal');
  const selectAdopcion = document.getElementById('selectAdopcion');
  const fechaProgramada = document.getElementById('fechaProgramada');
  const observacionesNueva = document.getElementById('observacionesNueva');
  const formSeguimiento = document.getElementById('formSeguimiento');

  const tablaPendientes = document.getElementById('tablaPendientes').querySelector('tbody');
  const tablaHistorial = document.getElementById('tablaHistorial').querySelector('tbody');
  const filtroAnimalInput = document.getElementById('filtroAnimal');
  const filtroEstadoSelect = document.getElementById('filtroEstado');
  const filtroTextoInput = document.getElementById('filtroTexto');

  const mapaAnimalesPorValor = new Map();
  const mapaEtiquetasPorId = new Map();

  let animalesAdoptados = [];
  let historialCompleto = [];
  let historialFiltrado = [];
  let paginaHistorial = 1;
  const registrosPorPaginaHistorial = 10;
  let filtroAnimal = '';
  let filtroEstado = '';
  let filtroTexto = '';

  const hoyStr = new Date().toISOString().split('T')[0];
  if (fechaProgramada) {
    fechaProgramada.setAttribute('min', hoyStr);
  }

  // Deshabilitar select de adopción inicialmente
  selectAdopcion.disabled = true;
  selectAdopcion.innerHTML = '<option value="">Seleccione primero un animal</option>';

  await cargarAnimalesAdoptados();
  await cargarPendientes();
  await cargarHistorial();

  // Cuando se selecciona un animal, cargar sus adopciones
  if (animalBusquedaInput) {
    animalBusquedaInput.addEventListener('input', async () => {
      const valor = animalBusquedaInput.value;
      const id = obtenerIdDesdeValor(valor);
      if (idAnimalHidden) {
        idAnimalHidden.value = id || '';
      }

      if (!id) {
        selectAdopcion.disabled = true;
        selectAdopcion.innerHTML = '<option value="">Seleccione primero un animal</option>';
        return;
      }

      await cargarAdopcionesPorAnimal(id);
      if (selectAdopcion.options.length > 0 && selectAdopcion.options[0].value !== '') {
        selectAdopcion.disabled = false;
      }
    });
  }

  // Programar seguimiento
  formSeguimiento.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const idAnimal = Number(idAnimalHidden ? idAnimalHidden.value : 0);
      const idAdopcion = Number(selectAdopcion.value);
      const fecha = fechaProgramada.value;
      const obs = observacionesNueva.value || null;

      if (!idAnimal || !idAdopcion || !fecha) {
        alert('Complete los campos obligatorios');
        return;
      }

      const hoyActual = new Date().toISOString().split('T')[0];
      if (fecha < hoyActual) {
        alert('La fecha programada no puede ser anterior al día de hoy');
        return;
      }

      await api.crearSeguimiento({ idAdopcion, idAnimal, fechaProgramada: fecha, observaciones: obs });
      alert('Seguimiento programado');
      formSeguimiento.reset();
      if (animalBusquedaInput) animalBusquedaInput.value = '';
      if (idAnimalHidden) idAnimalHidden.value = '';
      selectAdopcion.disabled = true;
      selectAdopcion.innerHTML = '<option value="">Seleccione primero un animal</option>';
      await cargarPendientes();
      await cargarHistorial();
    } catch (error) {
      alert(error.message || 'Error al programar seguimiento');
    }
  });

  if (filtroAnimalInput) {
    filtroAnimalInput.addEventListener('input', (e) => {
      filtroAnimal = obtenerIdDesdeValor(e.target.value) || '';
      aplicarFiltrosHistorial();
    });
  }

  if (filtroEstadoSelect) {
    filtroEstadoSelect.addEventListener('change', (e) => {
      filtroEstado = e.target.value;
      aplicarFiltrosHistorial();
    });
  }

  if (filtroTextoInput) {
    filtroTextoInput.addEventListener('input', (e) => {
      filtroTexto = e.target.value.toLowerCase();
      aplicarFiltrosHistorial();
    });
  }

  async function cargarAnimalesAdoptados() {
    try {
      const todos = await api.getAnimales();
      animalesAdoptados = (todos || []).filter(a => a.estado === 'Adoptado');
      mapaAnimalesPorValor.clear();

      if (listaAnimalesForm) listaAnimalesForm.innerHTML = '';
      if (listaAnimalesFiltro) listaAnimalesFiltro.innerHTML = '';
      if (animalBusquedaInput) animalBusquedaInput.value = '';
      if (idAnimalHidden) idAnimalHidden.value = '';
      if (filtroAnimalInput) filtroAnimalInput.value = '';

      animalesAdoptados.forEach(a => {
        const valor = `${a.idAnimal} - ${a.nombre} (${a.especie})`;
        mapaAnimalesPorValor.set(valor.toLowerCase(), a.idAnimal);
        mapaEtiquetasPorId.set(String(a.idAnimal), valor);

        if (listaAnimalesForm) {
          const option = document.createElement('option');
          option.value = valor;
          listaAnimalesForm.appendChild(option);
        }
        if (listaAnimalesFiltro) {
          const option = document.createElement('option');
          option.value = valor;
          listaAnimalesFiltro.appendChild(option);
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function cargarAdopcionesPorAnimal(animalId) {
    try {
      if (animalBusquedaInput && mapaEtiquetasPorId.has(String(animalId))) {
        animalBusquedaInput.value = mapaEtiquetasPorId.get(String(animalId));
      }
      if (idAnimalHidden) {
        idAnimalHidden.value = animalId;
      }

      const lista = await api.getAdopcionesPorAnimal(animalId);
      selectAdopcion.innerHTML = '';
      if (!lista || lista.length === 0) {
        selectAdopcion.add(new Option('No hay adopciones activas para este animal', ''));
        selectAdopcion.disabled = true;
      } else {
        lista.forEach(ad => {
          const adoptanteNombre = `${ad.nombreAdoptante || ''} ${ad.apellidoAdoptante || ''}`.trim();
          const label = adoptanteNombre
            ? `Adopción #${ad.idAdopcion} - ${adoptanteNombre}`
            : `Adopción #${ad.idAdopcion}`;
          selectAdopcion.add(new Option(label, ad.idAdopcion));
        });
      }
    } catch (e) {
      console.error('Error al cargar adopciones:', e);
      selectAdopcion.innerHTML = '<option value="">Error al cargar adopciones</option>';
      selectAdopcion.disabled = true;
    }
  }

  async function cargarPendientes() {
    try {
      const pendientes = await api.getSeguimientosPendientes();
      if (!pendientes || pendientes.length === 0) {
        tablaPendientes.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 16px;">Sin seguimientos pendientes</td></tr>';
        return;
      }
      tablaPendientes.innerHTML = pendientes.map(s => {
        const nombreCompleto = `${s.nombreAdoptante || ''} ${s.apellidoAdoptante || ''}`.trim() || 'N/A';
        const telefono = s.telefonoAdoptante || 'N/A';
        return `
        <tr>
          <td>${s.idSeguimiento}</td>
          <td>${s.nombreAnimal || s.idAnimal}${s.especie ? ` (${s.especie})` : ''}</td>
          <td>${nombreCompleto}</td>
          <td>${telefono}</td>
          <td>${formatearFecha(s.fechaProgramada)}</td>
          <td>${s.estado}</td>
          <td>
            <button class="btn-table evaluar" onclick="completarSeg(${s.idSeguimiento})">✔ Completar</button>
          </td>
        </tr>
      `;
      }).join('');
    } catch (e) {
      console.error(e);
    }
  }

  async function cargarHistorial() {
    try {
      if (!animalesAdoptados || animalesAdoptados.length === 0) {
        historialCompleto = [];
        aplicarFiltrosHistorial();
        return;
      }

      const arrs = await Promise.all(animalesAdoptados.map(a => api.getSeguimientosPorAnimal(a.idAnimal)));
      historialCompleto = arrs.flat();
      aplicarFiltrosHistorial();
    } catch (e) {
      console.error(e);
    }
  }

  function aplicarFiltrosHistorial() {
    historialFiltrado = historialCompleto.filter((item) => {
      const coincideAnimal = !filtroAnimal || String(item.idAnimal) === String(filtroAnimal);
      const coincideEstado = !filtroEstado || (item.estado || '').toLowerCase() === filtroEstado.toLowerCase();
      const texto = filtroTexto;
      const coincideTexto =
        !texto ||
        (item.nombreAnimal || '').toLowerCase().includes(texto) ||
        (item.observaciones || '').toLowerCase().includes(texto) ||
        (item.nombreAdoptante || '').toLowerCase().includes(texto) ||
        (item.apellidoAdoptante || '').toLowerCase().includes(texto) ||
        String(item.idSeguimiento || '').includes(texto);

      return coincideAnimal && coincideEstado && coincideTexto;
    });

    paginaHistorial = 1;
    mostrarHistorial();
  }

  function mostrarHistorial() {
    if (!tablaHistorial) return;

    if (!historialFiltrado || historialFiltrado.length === 0) {
      tablaHistorial.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 16px;">Sin historial</td></tr>';
      actualizarPaginacionHistorial();
      return;
    }

    const inicio = (paginaHistorial - 1) * registrosPorPaginaHistorial;
    const fin = inicio + registrosPorPaginaHistorial;
    const pagina = historialFiltrado.slice(inicio, fin);

    tablaHistorial.innerHTML = pagina.map(h => `
      <tr>
        <td>${h.idSeguimiento}</td>
        <td>${formatearFecha(h.fechaProgramada)}</td>
        <td>${h.fechaRealizada ? formatearFecha(h.fechaRealizada) : '-'}</td>
        <td>${escapeHtml(h.observaciones) || '-'}</td>
        <td>${h.estado}</td>
      </tr>
    `).join('');

    actualizarPaginacionHistorial();
  }

  function actualizarPaginacionHistorial() {
    const contenedor = document.querySelector('#tablaHistorial').closest('.table-container-paginada');
    if (!contenedor) return;

    const existente = contenedor.querySelector('.paginacion');
    if (existente) existente.remove();

    const totalRegistros = historialFiltrado.length;
    const totalPaginas = Math.max(Math.ceil(totalRegistros / registrosPorPaginaHistorial), 1);

    const paginacion = document.createElement('div');
    paginacion.className = 'paginacion';
    paginacion.innerHTML = `
      <button class="btn btn-secondary" ${paginaHistorial === 1 ? 'disabled' : ''} onclick="paginaAnteriorHistorial()">«</button>
      <span>Página ${paginaHistorial} de ${totalPaginas} (${totalRegistros} registros)</span>
      <button class="btn btn-secondary" ${paginaHistorial === totalPaginas ? 'disabled' : ''} onclick="paginaSiguienteHistorial()">»</button>
    `;

    contenedor.appendChild(paginacion);
  }

  window.paginaAnteriorHistorial = function() {
    if (paginaHistorial > 1) {
      paginaHistorial--;
      mostrarHistorial();
      const contenedor = document.querySelector('#tablaHistorial').closest('.table-container-paginada');
      if (contenedor) contenedor.scrollTop = 0;
    }
  };

  window.paginaSiguienteHistorial = function() {
    const totalPaginas = Math.ceil(historialFiltrado.length / registrosPorPaginaHistorial);
    if (paginaHistorial < totalPaginas) {
      paginaHistorial++;
      mostrarHistorial();
      const contenedor = document.querySelector('#tablaHistorial').closest('.table-container-paginada');
      if (contenedor) contenedor.scrollTop = 0;
    }
  };
});

async function completarSeg(idSeguimiento) {
  const fecha = prompt('Fecha realizada (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
  if (!fecha) return;
  const obs = prompt('Observaciones del control:', 'Control de bienestar sin novedades');
  try {
    await api.completarSeguimiento(idSeguimiento, { fechaRealizada: fecha, observaciones: obs || null });
    alert('Seguimiento completado');
    // Forzar recarga simple
    window.location.reload();
  } catch (e) {
    alert(e.message || 'Error al completar seguimiento');
  }
}

function formatearFecha(f) {
  if (!f) return '-';
  return new Date(f).toLocaleDateString('es-ES');
}

function escapeHtml(text) {
  if (!text) return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function obtenerIdDesdeValor(valor) {
  if (!valor) return '';
  const match = valor.trim().match(/^\s*(\d+)\s*-/);
  if (match) {
    return match[1];
  }
  const normalizado = valor.trim().toLowerCase();
  if (mapaAnimalesPorValor.has(normalizado)) {
    return mapaAnimalesPorValor.get(normalizado);
  }
  return '';
}


