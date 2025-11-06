// Gestión de salud para administradores
document.addEventListener('DOMContentLoaded', () => {
  // Verificar que el usuario es administrador
  requireAdmin();
  
  const form = document.getElementById('saludForm');
  const saludTable = document.getElementById('saludTable');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');
  const filtroAnimal = document.getElementById('filtroAnimal');
  const btnFiltrar = document.getElementById('btnFiltrar');

  let animales = [];
  let controlesSalud = [];

  // Cargar datos iniciales
  cargarAnimales();
  cargarControlesSalud();

  // Manejar envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Limpiar mensajes previos
    limpiarMensajes();
    limpiarErrores();

    // Validar formulario
    if (!validarFormulario()) {
      return;
    }

    try {
      // Obtener datos del formulario
      const formData = new FormData(form);
      const saludData = {
        idAnimal: parseInt(formData.get('idAnimal')),
        fechaControl: formData.get('fechaControl'),
        fechaProgramada: formData.get('fechaProgramada') || null,
        veterinario: formData.get('veterinario').trim(),
        vacunas: formData.get('vacunas').trim(),
        tratamientos: formData.get('tratamientos').trim(),
        observaciones: formData.get('observaciones').trim()
      };

      // Registrar control de salud
      const response = await api.crearControlSalud(saludData);
      
      // Mostrar éxito
      const animal = animales.find(a => a.idAnimal === saludData.idAnimal);
      mostrarExito(`Control de salud registrado exitosamente para ${animal.nombre} con ID: ${response.control.idSalud}`);
      
      // Limpiar formulario
      form.reset();
      
      // Recargar tabla
      cargarControlesSalud();

    } catch (error) {
      console.error('Error al registrar control de salud:', error);
      
      // Manejar diferentes tipos de errores
      if (error.message.includes('Campos obligatorios')) {
        mostrarError('Por favor, completa todos los campos obligatorios marcados con *');
      } else if (error.message.includes('fecha del control no puede ser futura')) {
        mostrarError('La fecha del control no puede ser futura');
      } else if (error.message.includes('al menos una información de salud')) {
        mostrarError('Debe registrar al menos una información de salud (vacunas, tratamientos, veterinario u observaciones)');
      } else {
        mostrarError(error.message || 'Error al registrar el control de salud. Por favor, intenta nuevamente.');
      }
    }
  });

  // Manejar filtro
  btnFiltrar.addEventListener('click', () => {
    const animalId = filtroAnimal.value;
    if (animalId) {
      cargarHistorialAnimal(animalId);
    } else {
      cargarControlesSalud();
    }
  });

  // Función para cargar animales
  async function cargarAnimales() {
    try {
      animales = await api.getAnimales();
      
      // Llenar select de animales en el formulario
      const selectAnimal = document.getElementById('idAnimal');
      const selectFiltro = document.getElementById('filtroAnimal');
      
      selectAnimal.innerHTML = '<option value="">Seleccionar animal</option>';
      selectFiltro.innerHTML = '<option value="">Todos los animales</option>';
      
      animales.forEach(animal => {
        const option1 = new Option(`${animal.nombre} (${animal.especie})`, animal.idAnimal);
        const option2 = new Option(`${animal.nombre} (${animal.especie})`, animal.idAnimal);
        selectAnimal.add(option1);
        selectFiltro.add(option2);
      });
    } catch (error) {
      console.error('Error al cargar animales:', error);
      mostrarError('Error al cargar la lista de animales');
    }
  }

  // Función para cargar controles de salud
  async function cargarControlesSalud() {
    try {
      controlesSalud = await api.getControlesSalud();
      mostrarControlesEnTabla(controlesSalud);
    } catch (error) {
      console.error('Error al cargar controles de salud:', error);
      mostrarError('Error al cargar el historial de controles de salud');
    }
  }

  // Función para cargar historial de un animal específico
  async function cargarHistorialAnimal(animalId) {
    try {
      const historial = await api.getHistorialSalud(animalId);
      mostrarControlesEnTabla(historial);
    } catch (error) {
      console.error('Error al cargar historial del animal:', error);
      mostrarError('Error al cargar el historial del animal');
    }
  }

  // Función para mostrar controles en la tabla
  function mostrarControlesEnTabla(controles) {
    const tbody = saludTable.querySelector('tbody');
    
    if (controles.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">No hay controles de salud registrados</td></tr>';
      return;
    }

    tbody.innerHTML = controles.map(control => {
      const estado = control.estado || calcularEstadoControl(control);
      const estadoClass = getEstadoClass(estado);
      const fechaMostrar = control.fechaProgramada || control.fechaControl;
      
      return `
      <tr>
        <td>${control.idSalud}</td>
        <td>${control.nombreAnimal} (${control.especie})</td>
        <td>${formatearFecha(fechaMostrar)}</td>
        <td><span class="status ${estadoClass}">${estado}</span></td>
        <td>${control.veterinario || '-'}</td>
        <td>${control.vacunas || '-'}</td>
        <td>${control.tratamientos || '-'}</td>
        <td>${control.observaciones || '-'}</td>
        <td>
          <button class="btn-table ver" onclick="verControlSalud(${control.idSalud})" title="Ver detalles">👁️</button>
          <button class="btn-table editar" onclick="editarControlSalud(${control.idSalud})" title="Editar">✏️</button>
          ${!control.fechaAltaVeterinaria ? `<button class="btn-table alta" onclick="darAltaVeterinaria(${control.idSalud})" title="Dar alta veterinaria">✅</button>` : ''}
          <button class="btn-table estado" onclick="cambiarEstadoControl(${control.idSalud})" title="Cambiar estado">🔄</button>
          <button class="btn-table eliminar" onclick="eliminarControlSalud(${control.idSalud})" title="Eliminar">🗑️</button>
        </td>
      </tr>
    `;
    }).join('');
  }

  // Función para calcular estado del control
  function calcularEstadoControl(control) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaControl = control.fechaProgramada ? new Date(control.fechaProgramada) : new Date(control.fechaControl);
    fechaControl.setHours(0, 0, 0, 0);
    
    if (control.fechaAltaVeterinaria) {
      return 'Realizado';
    }
    
    if (fechaControl > hoy) {
      return 'Pendiente';
    }
    
    return 'En Tratamiento';
  }

  // Función para obtener clase CSS del estado
  function getEstadoClass(estado) {
    const estados = {
      'Pendiente': 'pendiente',
      'En Tratamiento': 'tratamiento',
      'Realizado': 'realizado'
    };
    return estados[estado] || '';
  }

  // Función para validar formulario
  function validarFormulario() {
    let esValido = true;
    const camposObligatorios = ['idAnimal', 'fechaControl'];

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

    // Validar que al menos un campo de salud esté presente
    const veterinario = document.getElementById('veterinario').value.trim();
    const vacunas = document.getElementById('vacunas').value.trim();
    const tratamientos = document.getElementById('tratamientos').value.trim();
    const observaciones = document.getElementById('observaciones').value.trim();

    if (!veterinario && !vacunas && !tratamientos && !observaciones) {
      mostrarError('Debe registrar al menos una información de salud (vacunas, tratamientos, veterinario u observaciones)');
      esValido = false;
    }

    // Permitir fechas futuras para controles programados
    // La validación de fecha futura se elimina

    return esValido;
  }

  // Función para formatear fecha
  function formatearFecha(fecha) {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  // Funciones de mensajes
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
    errorSpan.textContent = mensaje;
    errorSpan.style.display = 'block';
  }

  function limpiarErrorCampo(campo) {
    const errorSpan = document.getElementById(`${campo}-error`);
    errorSpan.textContent = '';
    errorSpan.style.display = 'none';
  }

  function limpiarErrores() {
    const campos = ['idAnimal', 'fechaControl'];
    campos.forEach(campo => limpiarErrorCampo(campo));
  }
});

// Función helper para convertir fecha ISO a formato YYYY-MM-DD (formato MySQL DATE)
function formatearFechaParaInput(fecha) {
  if (!fecha) return '';
  
  // Si ya está en formato YYYY-MM-DD, retornarlo
  if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return fecha;
  }
  
  // Convertir fecha ISO o Date a formato YYYY-MM-DD
  const fechaObj = new Date(fecha);
  if (isNaN(fechaObj.getTime())) {
    return '';
  }
  
  const año = fechaObj.getFullYear();
  const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
  const dia = String(fechaObj.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

// Funciones globales para acciones de la tabla
async function verControlSalud(id) {
  try {
    const control = await api.getControlSalud(id);
    alert(`Control de Salud:\n\nID: ${control.idSalud}\nAnimal: ${control.nombreAnimal}\nFecha: ${new Date(control.fechaControl).toLocaleDateString('es-ES')}\nVeterinario: ${control.veterinario || 'No especificado'}\nVacunas: ${control.vacunas || 'No especificadas'}\nTratamientos: ${control.tratamientos || 'No especificados'}\nObservaciones: ${control.observaciones || 'No especificadas'}`);
  } catch (error) {
    alert('Error al obtener información del control de salud');
  }
}

async function editarControlSalud(id) {
  try {
    const control = await api.getControlSalud(id);
    
    // Convertir fechas al formato YYYY-MM-DD para los inputs
    const fechaControlFormateada = formatearFechaParaInput(control.fechaControl);
    const fechaProgramadaFormateada = formatearFechaParaInput(control.fechaProgramada);
    
    // Crear formulario de edición
    const nuevoVeterinario = prompt('Veterinario:', control.veterinario || '');
    if (nuevoVeterinario === null) return;
    
    const nuevasVacunas = prompt('Vacunas:', control.vacunas || '');
    if (nuevasVacunas === null) return;
    
    const nuevosTratamientos = prompt('Tratamientos:', control.tratamientos || '');
    if (nuevosTratamientos === null) return;
    
    const nuevasObservaciones = prompt('Observaciones:', control.observaciones || '');
    if (nuevasObservaciones === null) return;
    
    const nuevaFechaControl = prompt('Fecha del Control (YYYY-MM-DD):', fechaControlFormateada);
    if (nuevaFechaControl === null) return;
    
    const nuevaFechaProgramada = prompt('Fecha Programada (YYYY-MM-DD) - dejar vacío si no aplica:', fechaProgramadaFormateada);
    
    await api.actualizarControlSalud(id, {
      veterinario: nuevoVeterinario,
      vacunas: nuevasVacunas,
      tratamientos: nuevosTratamientos,
      observaciones: nuevasObservaciones,
      fechaControl: nuevaFechaControl,
      fechaProgramada: nuevaFechaProgramada || null
    });
    
    alert('Control de salud actualizado exitosamente');
    location.reload();
  } catch (error) {
    alert('Error al actualizar el control de salud: ' + (error.message || 'Error desconocido'));
  }
}

async function darAltaVeterinaria(id) {
  if (!confirm('¿Estás seguro de que quieres dar alta veterinaria a este control?')) {
    return;
  }

  try {
    await api.darAltaVeterinaria(id);
    alert('Alta veterinaria registrada exitosamente');
    location.reload();
  } catch (error) {
    alert('Error al dar alta veterinaria: ' + (error.message || 'Error desconocido'));
  }
}

async function cambiarEstadoControl(id) {
  try {
    const control = await api.getControlSalud(id);
    const estadoActual = control.estado || calcularEstadoControl(control);
    
    // Opciones de estado según el estado actual
    let opciones = [];
    if (estadoActual === 'Pendiente') {
      opciones = ['En Tratamiento', 'Realizado'];
    } else if (estadoActual === 'En Tratamiento') {
      opciones = ['Pendiente', 'Realizado'];
    } else if (estadoActual === 'Realizado') {
      opciones = ['Pendiente', 'En Tratamiento'];
    }
    
    const nuevoEstado = prompt(`Estado actual: ${estadoActual}\n\nNuevo estado (${opciones.join(', ')}):`, opciones[0]);
    if (!nuevoEstado || !opciones.includes(nuevoEstado)) {
      alert('Estado inválido');
      return;
    }
    
    let fechaProgramada = null;
    if (nuevoEstado === 'Pendiente') {
      // Convertir fecha al formato YYYY-MM-DD
      const fechaDefault = formatearFechaParaInput(control.fechaProgramada || control.fechaControl);
      const fechaProg = prompt('Fecha programada para el control (YYYY-MM-DD):', fechaDefault);
      if (fechaProg === null) return;
      if (fechaProg) {
        fechaProgramada = fechaProg;
      }
    }
    
    await api.cambiarEstadoControl(id, nuevoEstado, fechaProgramada);
    alert('Estado del control actualizado exitosamente');
    location.reload();
  } catch (error) {
    alert('Error al cambiar estado del control: ' + (error.message || 'Error desconocido'));
  }
}

function calcularEstadoControl(control) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const fechaControl = control.fechaProgramada ? new Date(control.fechaProgramada) : new Date(control.fechaControl);
  fechaControl.setHours(0, 0, 0, 0);
  
  if (control.fechaAltaVeterinaria) {
    return 'Realizado';
  }
  
  if (fechaControl > hoy) {
    return 'Pendiente';
  }
  
  return 'En Tratamiento';
}

async function eliminarControlSalud(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este control de salud? Esta acción no se puede deshacer.')) {
    return;
  }

  try {
    await api.eliminarControlSalud(id);
    alert('Control de salud eliminado exitosamente');
    // Recargar tabla
    document.querySelector('script').dispatchEvent(new Event('DOMContentLoaded'));
  } catch (error) {
    alert('Error al eliminar el control de salud');
  }
}
