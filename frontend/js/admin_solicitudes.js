// Evaluación de solicitudes para administradores
document.addEventListener('DOMContentLoaded', () => {
  // Verificar que el usuario es administrador
  requireAdmin();
  
  const solicitudesTable = document.getElementById('solicitudesTable');
  const filtroEstado = document.getElementById('filtroEstado');
  const filtroAnimal = document.getElementById('filtroAnimal');
  const btnFiltrar = document.getElementById('btnFiltrar');
  const btnLimpiar = document.getElementById('btnLimpiar');
  const evaluacionModal = document.getElementById('evaluacionModal');
  const evaluacionForm = document.getElementById('evaluacionForm');
  const nuevoEstado = document.getElementById('nuevoEstado');
  const motivoRechazoGroup = document.getElementById('motivoRechazoGroup');

  let solicitudes = [];
  let animales = [];
  // Hacer solicitudActual global para que las funciones fuera del scope puedan accederla
  window.solicitudActual = null;
  let solicitudActual = window.solicitudActual; // Referencia local también

  // Cargar datos iniciales
  cargarSolicitudes();
  cargarAnimales();

  // Manejar cambio de estado en el formulario
  nuevoEstado.addEventListener('change', (e) => {
    if (e.target.value === 'Rechazada') {
      motivoRechazoGroup.style.display = 'block';
    } else {
      motivoRechazoGroup.style.display = 'none';
    }
  });

  // Manejar filtros
  btnFiltrar.addEventListener('click', () => {
    aplicarFiltros();
  });

  btnLimpiar.addEventListener('click', () => {
    limpiarFiltros();
  });

  // Manejar envío del formulario de evaluación
  evaluacionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      // Validar que tenemos una solicitud actual (usar la variable global)
      const solicitudActual = window.solicitudActual;
      if (!solicitudActual || !solicitudActual.idSolicitud) {
        alert('Error: No hay una solicitud seleccionada. Por favor, cierra el modal y vuelve a intentar.');
        return;
      }
      
      const formData = new FormData(evaluacionForm);
      
      // Obtener el puntaje desde el input del formulario (que es readonly pero contiene el valor)
      const puntajeInput = document.getElementById('puntajeEvaluacion');
      const puntajeEvaluacion = puntajeInput ? (parseInt(puntajeInput.value) || 0) : (solicitudActual.puntajeEvaluacion || 0);
      
      // El puntaje no se modifica desde el formulario, se mantiene el original
      const datosEvaluacion = {
        estado: formData.get('nuevoEstado'),
        puntajeEvaluacion: puntajeEvaluacion, // Mantener el puntaje calculado originalmente
        motivoRechazo: formData.get('motivoRechazo') || null
      };

      // Validar que el estado esté presente
      if (!datosEvaluacion.estado) {
        alert('Por favor, selecciona un estado para la solicitud');
        return;
      }

      // Actualizar solicitud
      const response = await api.actualizarSolicitud(solicitudActual.idSolicitud, datosEvaluacion);
      
      // Mostrar mensaje de éxito
      alert(response.message);
      
      // Cerrar modal
      cerrarModal();
      
      // Recargar datos
      cargarSolicitudes();

    } catch (error) {
      console.error('Error al evaluar solicitud:', error);
      alert(error.message || 'Error al evaluar la solicitud');
    }
  });

  // Función para cargar solicitudes
  async function cargarSolicitudes() {
    try {
      console.log('Cargando solicitudes...');
      solicitudes = await api.getSolicitudes();
      console.log('Solicitudes recibidas:', solicitudes);
      
      if (!solicitudes || !Array.isArray(solicitudes)) {
        console.error('Las solicitudes no son un array válido:', solicitudes);
        solicitudes = [];
      }
      
      mostrarSolicitudesEnTabla(solicitudes);
      actualizarEstadisticas(solicitudes);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      console.error('Detalles del error:', error.message, error.stack);
      alert(`Error al cargar las solicitudes: ${error.message || 'Error desconocido'}`);
      
      // Mostrar mensaje en la tabla también
      const tbody = solicitudesTable.querySelector('tbody');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #e74c3c;">Error al cargar las solicitudes. Por favor, recarga la página.</td></tr>';
      }
    }
  }

  // Función para cargar animales
  async function cargarAnimales() {
    try {
      animales = await api.getAnimales();
      
      // Llenar select de filtro de animales
      const selectAnimal = document.getElementById('filtroAnimal');
      selectAnimal.innerHTML = '<option value="">Todos los animales</option>';
      
      animales.forEach(animal => {
        const option = new Option(`${animal.nombre} (${animal.especie})`, animal.idAnimal);
        selectAnimal.add(option);
      });
    } catch (error) {
      console.error('Error al cargar animales:', error);
    }
  }

  // Función para mostrar solicitudes en la tabla
  async function mostrarSolicitudesEnTabla(solicitudes) {
    const tbody = solicitudesTable.querySelector('tbody');
    
    if (!tbody) {
      console.error('No se encontró el tbody de la tabla de solicitudes');
      return;
    }
    
    if (!solicitudes || !Array.isArray(solicitudes)) {
      console.error('Las solicitudes no son un array válido:', solicitudes);
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #e74c3c;">Error: Datos inválidos recibidos</td></tr>';
      return;
    }
    
    if (solicitudes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No hay solicitudes registradas</td></tr>';
      return;
    }

    // Cargar información de los animales para obtener puntajes mínimos
    const animalesInfo = {};
    for (const solicitud of solicitudes) {
      if (!animalesInfo[solicitud.idAnimal]) {
        try {
          const animal = await api.getAnimal(solicitud.idAnimal);
          animalesInfo[solicitud.idAnimal] = animal;
        } catch (error) {
          console.error(`Error al cargar animal ${solicitud.idAnimal}:`, error);
          animalesInfo[solicitud.idAnimal] = { puntajeMinimo: 0 };
        }
      }
    }

    try {
      tbody.innerHTML = solicitudes.map(solicitud => {
        // Validar que la solicitud tenga los datos necesarios
        if (!solicitud || !solicitud.idSolicitud) {
          console.warn('Solicitud inválida:', solicitud);
          return '';
        }
        
        const animal = animalesInfo[solicitud.idAnimal] || { puntajeMinimo: 0 };
        const puntaje = solicitud.puntajeEvaluacion || 0;
        const puntajeMinimo = animal.puntajeMinimo || 0;
        const cumpleRequisito = puntaje >= puntajeMinimo;
        
        // Clase CSS basada en si cumple o no el requisito
        const clasePuntaje = cumpleRequisito ? 'puntaje-cumple' : 'puntaje-no-cumple';
        
        return `
        <tr>
          <td>${solicitud.idSolicitud}</td>
          <td>${solicitud.nombreAdoptante || 'N/A'} ${solicitud.apellidoAdoptante || ''}</td>
          <td>${solicitud.nombreAnimal || 'N/A'} (${solicitud.especie || 'N/A'})</td>
          <td>${formatearFecha(solicitud.fecha)}</td>
          <td><span class="status ${getStatusClass(solicitud.estado || 'Pendiente')}">${solicitud.estado || 'Pendiente'}</span></td>
          <td>
            <span class="${clasePuntaje}" title="Puntaje: ${puntaje} / Mínimo requerido: ${puntajeMinimo}">
              ${puntaje}
              ${puntajeMinimo > 0 ? ` <small>(${puntajeMinimo} min)</small>` : ''}
              ${!cumpleRequisito ? ' ⚠️' : ' ✓'}
            </span>
          </td>
          <td>
            <button class="btn-table ver" onclick="verSolicitud(${solicitud.idSolicitud})">👁️</button>
            <button class="btn-table evaluar" onclick="evaluarSolicitud(${solicitud.idSolicitud})">📝</button>
            <button class="btn-table eliminar" onclick="eliminarSolicitud(${solicitud.idSolicitud})">🗑️</button>
            ${solicitud.estado === 'Aprobada' ? `<button class="btn-table aprobar" onclick="formalizarSolicitud(${solicitud.idSolicitud})">✅</button>` : ''}
          </td>
        </tr>
      `;
      }).filter(row => row !== '').join('');
    } catch (error) {
      console.error('Error al renderizar solicitudes:', error);
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #e74c3c;">Error al mostrar las solicitudes</td></tr>';
    }
  }

  // Función para actualizar estadísticas
  function actualizarEstadisticas(solicitudes) {
    const total = solicitudes.length;
    const pendientes = solicitudes.filter(s => s.estado === 'Pendiente').length;
    const aprobadas = solicitudes.filter(s => s.estado === 'Aprobada').length;
    const rechazadas = solicitudes.filter(s => s.estado === 'Rechazada').length;

    document.getElementById('totalSolicitudes').textContent = total;
    document.getElementById('solicitudesPendientes').textContent = pendientes;
    document.getElementById('solicitudesAprobadas').textContent = aprobadas;
    document.getElementById('solicitudesRechazadas').textContent = rechazadas;
  }

  // Función para aplicar filtros
  function aplicarFiltros() {
    let solicitudesFiltradas = [...solicitudes];

    const estadoFiltro = filtroEstado.value;
    const animalFiltro = filtroAnimal.value;

    if (estadoFiltro) {
      solicitudesFiltradas = solicitudesFiltradas.filter(s => s.estado === estadoFiltro);
    }

    if (animalFiltro) {
      solicitudesFiltradas = solicitudesFiltradas.filter(s => s.idAnimal == animalFiltro);
    }

    mostrarSolicitudesEnTabla(solicitudesFiltradas);
  }

  // Función para limpiar filtros
  function limpiarFiltros() {
    filtroEstado.value = '';
    filtroAnimal.value = '';
    mostrarSolicitudesEnTabla(solicitudes);
  }

  // Función para obtener clase CSS del estado
  function getStatusClass(estado) {
    const estados = {
      'Pendiente': 'proceso',
      'Aprobada': 'disponible',
      'Rechazada': 'tratamiento'
    };
    return estados[estado] || '';
  }

  // Función para formatear fecha
  function formatearFecha(fecha) {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES');
  }
});

// Funciones globales para acciones de la tabla
async function verSolicitud(id) {
  try {
    const solicitud = await api.getSolicitud(id);
    
    let mensaje = `Detalles de la Solicitud:\n\n`;
    mensaje += `ID: ${solicitud.idSolicitud}\n`;
    mensaje += `Adoptante: ${solicitud.nombreAdoptante} ${solicitud.apellidoAdoptante}\n`;
    mensaje += `Email: ${solicitud.email}\n`;
    mensaje += `Animal: ${solicitud.nombreAnimal} (${solicitud.especie})\n`;
    mensaje += `Fecha: ${new Date(solicitud.fecha).toLocaleDateString('es-ES')}\n`;
    mensaje += `Estado: ${solicitud.estado}\n`;
    mensaje += `Puntaje: ${solicitud.puntajeEvaluacion || 0}\n`;
    if (solicitud.motivoRechazo) {
      mensaje += `Motivo de rechazo: ${solicitud.motivoRechazo}\n`;
    }

    alert(mensaje);
  } catch (error) {
    alert('Error al obtener información de la solicitud');
  }
}

async function evaluarSolicitud(id) {
  try {
    console.log('Cargando solicitud para evaluación, ID:', id);
    window.solicitudActual = await api.getSolicitud(id);
    const solicitudActual = window.solicitudActual;
    
    // Validar que se obtuvo la solicitud correctamente
    if (!solicitudActual || !solicitudActual.idSolicitud) {
      alert('Error: No se pudo cargar la información de la solicitud');
      console.error('Solicitud no encontrada o inválida:', solicitudActual);
      return;
    }
    
    console.log('Solicitud cargada:', solicitudActual);
    
    // Obtener información del animal para mostrar puntaje mínimo
    let animal = null;
    let puntajeMinimo = 0;
    try {
      if (solicitudActual && solicitudActual.idAnimal) {
        animal = await api.getAnimal(solicitudActual.idAnimal);
        puntajeMinimo = animal.puntajeMinimo || 0;
      }
    } catch (error) {
      console.error('Error al cargar información del animal:', error);
    }
    
    const puntajeActual = (solicitudActual && solicitudActual.puntajeEvaluacion) ? solicitudActual.puntajeEvaluacion : 0;
    const cumpleRequisito = puntajeActual >= puntajeMinimo;
    
    // Mostrar detalles de la solicitud
    const detallesDiv = document.getElementById('solicitudDetalles');
    detallesDiv.innerHTML = `
      <div class="solicitud-info">
        <h4>Solicitud #${solicitudActual.idSolicitud}</h4>
        <p><strong>Adoptante:</strong> ${solicitudActual.nombreAdoptante} ${solicitudActual.apellidoAdoptante}</p>
        <p><strong>Email:</strong> ${solicitudActual.email}</p>
        <p><strong>Animal:</strong> ${solicitudActual.nombreAnimal} (${solicitudActual.especie})</p>
        <p><strong>Fecha:</strong> ${new Date(solicitudActual.fecha).toLocaleDateString('es-ES')}</p>
        <p><strong>Estado actual:</strong> <span class="status ${getStatusClass(solicitudActual.estado)}">${solicitudActual.estado}</span></p>
        <div style="margin: 15px 0; padding: 10px; background-color: ${cumpleRequisito ? '#d4edda' : '#f8d7da'}; border-radius: 5px; border-left: 4px solid ${cumpleRequisito ? '#28a745' : '#dc3545'};">
          <p><strong>Puntaje de Evaluación:</strong> <span style="font-size: 1.2em; font-weight: bold;">${puntajeActual}</span> / 100</p>
          ${puntajeMinimo > 0 ? `
            <p><strong>Puntaje Mínimo Requerido:</strong> ${puntajeMinimo}</p>
            <p style="margin: 5px 0 0 0;">
              <strong>Estado:</strong> 
              <span style="color: ${cumpleRequisito ? '#28a745' : '#dc3545'}; font-weight: bold;">
                ${cumpleRequisito ? '✓ Cumple con el requisito' : '⚠️ No cumple con el requisito mínimo'}
              </span>
            </p>
          ` : '<p><em>Este animal no tiene puntaje mínimo requerido</em></p>'}
        </div>
        <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
          <em>Nota: El puntaje es solo una referencia. La decisión final es del administrador.</em>
        </p>
      </div>
    `;
    
    // Configurar formulario
    const nuevoEstadoInput = document.getElementById('nuevoEstado');
    if (nuevoEstadoInput) {
      nuevoEstadoInput.value = solicitudActual.estado || 'Pendiente';
    }
    
    // El campo de puntaje está deshabilitado ya que se calcula automáticamente
    // pero lo mostramos como referencia
    const puntajeInput = document.getElementById('puntajeEvaluacion');
    if (puntajeInput) {
      puntajeInput.value = puntajeActual;
      puntajeInput.readOnly = true;
      puntajeInput.title = 'Este puntaje se calcula automáticamente basado en las respuestas del formulario';
    }
    
    const motivoRechazoInput = document.getElementById('motivoRechazo');
    if (motivoRechazoInput) {
      motivoRechazoInput.value = solicitudActual.motivoRechazo || '';
    }
    
    // Mostrar/ocultar motivo de rechazo según estado
    if (motivoRechazoGroup) {
      if (solicitudActual.estado === 'Rechazada') {
        motivoRechazoGroup.style.display = 'block';
      } else {
        motivoRechazoGroup.style.display = 'none';
      }
    }
    
    // Mostrar modal
    if (evaluacionModal) {
      evaluacionModal.style.display = 'block';
    } else {
      console.error('No se encontró el modal de evaluación');
      alert('Error: No se pudo abrir el modal de evaluación');
    }
    
  } catch (error) {
    console.error('Error al cargar la solicitud para evaluación:', error);
    alert(`Error al cargar la solicitud para evaluación: ${error.message || 'Error desconocido'}`);
  }
}

async function eliminarSolicitud(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar esta solicitud? Esta acción no se puede deshacer.')) {
    return;
  }

  try {
    await api.eliminarSolicitud(id);
    alert('Solicitud eliminada exitosamente');
    // Recargar tabla
    document.querySelector('script').dispatchEvent(new Event('DOMContentLoaded'));
  } catch (error) {
    alert('Error al eliminar la solicitud');
  }
}

function cerrarModal() {
  const evaluacionModal = document.getElementById('evaluacionModal');
  const evaluacionForm = document.getElementById('evaluacionForm');
  const motivoRechazoGroup = document.getElementById('motivoRechazoGroup');
  
  if (evaluacionModal) {
    evaluacionModal.style.display = 'none';
  }
  if (evaluacionForm) {
    evaluacionForm.reset();
  }
  if (motivoRechazoGroup) {
    motivoRechazoGroup.style.display = 'none';
  }
  // Limpiar la solicitud actual al cerrar el modal
  window.solicitudActual = null;
}

// Función auxiliar para obtener clase CSS del estado
function getStatusClass(estado) {
  const estados = {
    'Pendiente': 'proceso',
    'Aprobada': 'disponible',
    'Rechazada': 'tratamiento'
  };
  return estados[estado] || '';
}

async function formalizarSolicitud(idSolicitud) {
  if (!confirm('Vas a formalizar la adopción para esta solicitud aprobada. ¿Confirmas?')) {
    return;
  }

  const contrato = prompt('Ingrese referencia o número de contrato (opcional):', '');

  try {
    const resp = await api.formalizarAdopcion(idSolicitud, contrato || null);
    alert(resp.message);
    // Recargar solicitudes para reflejar el nuevo estado del animal si aplica
    document.querySelector('script').dispatchEvent(new Event('DOMContentLoaded'));
  } catch (error) {
    alert(error.message || 'Error al formalizar adopción');
  }
}
