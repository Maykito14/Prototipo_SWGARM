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
  let solicitudActual = null;

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
      const formData = new FormData(evaluacionForm);
      const datosEvaluacion = {
        estado: formData.get('nuevoEstado'),
        puntajeEvaluacion: parseInt(formData.get('puntajeEvaluacion')) || 0,
        motivoRechazo: formData.get('motivoRechazo') || null
      };

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
      solicitudes = await api.getSolicitudes();
      mostrarSolicitudesEnTabla(solicitudes);
      actualizarEstadisticas(solicitudes);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      alert('Error al cargar las solicitudes');
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
  function mostrarSolicitudesEnTabla(solicitudes) {
    const tbody = solicitudesTable.querySelector('tbody');
    
    if (solicitudes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No hay solicitudes registradas</td></tr>';
      return;
    }

    tbody.innerHTML = solicitudes.map(solicitud => `
      <tr>
        <td>${solicitud.idSolicitud}</td>
        <td>${solicitud.nombreAdoptante} ${solicitud.apellidoAdoptante}</td>
        <td>${solicitud.nombreAnimal} (${solicitud.especie})</td>
        <td>${formatearFecha(solicitud.fecha)}</td>
        <td><span class="status ${getStatusClass(solicitud.estado)}">${solicitud.estado}</span></td>
        <td>${solicitud.puntajeEvaluacion || 0}</td>
        <td>
          <button class="btn-table ver" onclick="verSolicitud(${solicitud.idSolicitud})">👁️</button>
          <button class="btn-table evaluar" onclick="evaluarSolicitud(${solicitud.idSolicitud})">📝</button>
          <button class="btn-table eliminar" onclick="eliminarSolicitud(${solicitud.idSolicitud})">🗑️</button>
        </td>
      </tr>
    `).join('');
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
      'En evaluación': 'proceso',
      'Aprobada': 'disponible',
      'Rechazada': 'tratamiento',
      'No Seleccionada': 'tratamiento'
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
    solicitudActual = await api.getSolicitud(id);
    
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
        <p><strong>Puntaje actual:</strong> ${solicitudActual.puntajeEvaluacion || 0}</p>
      </div>
    `;
    
    // Configurar formulario
    document.getElementById('nuevoEstado').value = solicitudActual.estado;
    document.getElementById('puntajeEvaluacion').value = solicitudActual.puntajeEvaluacion || 0;
    document.getElementById('motivoRechazo').value = solicitudActual.motivoRechazo || '';
    
    // Mostrar/ocultar motivo de rechazo según estado
    if (solicitudActual.estado === 'Rechazada') {
      motivoRechazoGroup.style.display = 'block';
    } else {
      motivoRechazoGroup.style.display = 'none';
    }
    
    // Mostrar modal
    evaluacionModal.style.display = 'block';
    
  } catch (error) {
    alert('Error al cargar la solicitud para evaluación');
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
  evaluacionModal.style.display = 'none';
  evaluacionForm.reset();
  motivoRechazoGroup.style.display = 'none';
}

// Función auxiliar para obtener clase CSS del estado
function getStatusClass(estado) {
  const estados = {
    'Pendiente': 'proceso',
    'En evaluación': 'proceso',
    'Aprobada': 'disponible',
    'Rechazada': 'tratamiento',
    'No Seleccionada': 'tratamiento'
  };
  return estados[estado] || '';
}
