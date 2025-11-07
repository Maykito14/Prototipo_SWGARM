document.addEventListener('DOMContentLoaded', async () => {
  requireAdmin();

  const selectAnimal = document.getElementById('selectAnimal');
  const selectAdopcion = document.getElementById('selectAdopcion');
  const fechaProgramada = document.getElementById('fechaProgramada');
  const observacionesNueva = document.getElementById('observacionesNueva');
  const formSeguimiento = document.getElementById('formSeguimiento');

  const tablaPendientes = document.getElementById('tablaPendientes').querySelector('tbody');
  const tablaHistorial = document.getElementById('tablaHistorial').querySelector('tbody');
  const filtroAnimal = document.getElementById('filtroAnimal');

  let animalesAdoptados = [];

  const hoyStr = new Date().toISOString().split('T')[0];
  if (fechaProgramada) {
    fechaProgramada.setAttribute('min', hoyStr);
  }

  // Deshabilitar select de adopción inicialmente
  selectAdopcion.disabled = true;
  selectAdopcion.innerHTML = '<option value="">Seleccione primero un animal</option>';

  await cargarAnimalesAdoptados();
  
  // Verificar si hay un animal seleccionado por defecto y cargar sus adopciones
  if (selectAnimal.value) {
    await cargarAdopcionesPorAnimal(selectAnimal.value);
    if (selectAdopcion.options.length > 0 && selectAdopcion.options[0].value !== '') {
      selectAdopcion.disabled = false;
    }
  }
  
  await cargarPendientes();
  await cargarHistorial();

  // Cuando se selecciona un animal, cargar sus adopciones
  selectAnimal.addEventListener('change', async () => {
    const idAnimal = selectAnimal.value;
    if (idAnimal) {
      await cargarAdopcionesPorAnimal(idAnimal);
      if (selectAdopcion.options.length > 0 && selectAdopcion.options[0].value !== '') {
        selectAdopcion.disabled = false;
      }
    } else {
      selectAdopcion.disabled = true;
      selectAdopcion.innerHTML = '<option value="">Seleccione primero un animal</option>';
    }
  });

  // Programar seguimiento
  formSeguimiento.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const idAnimal = Number(selectAnimal.value);
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
      selectAdopcion.disabled = true;
      selectAdopcion.innerHTML = '<option value="">Seleccione primero un animal</option>';
      await cargarPendientes();
      await cargarHistorial();
    } catch (error) {
      alert(error.message || 'Error al programar seguimiento');
    }
  });

  filtroAnimal.addEventListener('change', async () => {
    await cargarHistorial();
  });

  async function cargarAnimalesAdoptados() {
    try {
      const todos = await api.getAnimales();
      animalesAdoptados = (todos || []).filter(a => a.estado === 'Adoptado');
      selectAnimal.innerHTML = '<option value="">Seleccione un animal</option>';
      filtroAnimal.innerHTML = '<option value="">Todos</option>';
      animalesAdoptados.forEach(a => {
        selectAnimal.add(new Option(`${a.nombre} (${a.especie})`, a.idAnimal));
        filtroAnimal.add(new Option(`${a.nombre} (${a.especie})`, a.idAnimal));
      });
      // Asegurar que no haya selección por defecto
      selectAnimal.value = '';
    } catch (e) {
      console.error(e);
    }
  }

  async function cargarAdopcionesPorAnimal(animalId) {
    try {
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
      const filtro = filtroAnimal.value;
      let historial = [];
      if (filtro) {
        historial = await api.getSeguimientosPorAnimal(filtro);
      } else {
        // Si no hay filtro, juntar historial de todos los animales adoptados
        const arrs = await Promise.all(animalesAdoptados.map(a => api.getSeguimientosPorAnimal(a.idAnimal)));
        historial = arrs.flat();
      }
      if (!historial || historial.length === 0) {
        tablaHistorial.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 16px;">Sin historial</td></tr>';
        return;
      }
      tablaHistorial.innerHTML = historial.map(h => `
        <tr>
          <td>${h.idSeguimiento}</td>
          <td>${formatearFecha(h.fechaProgramada)}</td>
          <td>${h.fechaRealizada ? formatearFecha(h.fechaRealizada) : '-'}</td>
          <td>${escapeHtml(h.observaciones) || '-'}</td>
          <td>${h.estado}</td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  }
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


