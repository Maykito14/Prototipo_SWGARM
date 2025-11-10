// Gestión de salud para administradores
document.addEventListener('DOMContentLoaded', () => {
  // Verificar que el usuario es administrador
  requireAdmin();
  
  const form = document.getElementById('saludForm');
  const saludTable = document.getElementById('tablaControles');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');
  // Filtros configurados más abajo
  const filtroEstadoSelect = document.getElementById('filtroEstado');
  const filtroTextoInput = document.getElementById('filtroTexto');
  const animalBusquedaInput = document.getElementById('animalBusqueda');
  const listaAnimalesForm = document.getElementById('listaAnimales');
  const listaAnimalesFiltro = document.getElementById('listaAnimalesFiltro');
  const filtroAnimalInput = document.getElementById('filtroAnimal');
  const idAnimalHidden = document.getElementById('idAnimal');
  const mapaAnimalesPorValor = new Map();

  let animales = [];
  let controlesSalud = [];
  let controlesSaludFiltrados = [];
  let paginaActual = 1;
  const registrosPorPagina = 5;
  let filtroAnimal = '';
  let filtroEstado = '';
  let filtroTexto = '';

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

  if (animalBusquedaInput) {
    animalBusquedaInput.addEventListener('input', () => {
      const id = obtenerIdDesdeValor(animalBusquedaInput.value);
      if (idAnimalHidden) {
        idAnimalHidden.value = id || '';
      }
    });
  }

  if (filtroAnimalInput) {
    filtroAnimalInput.addEventListener('input', (e) => {
      filtroAnimal = obtenerIdDesdeValor(e.target.value) || '';
      aplicarFiltros();
    });
  }

  if (filtroEstadoSelect) {
    filtroEstadoSelect.addEventListener('change', (e) => {
      filtroEstado = e.target.value;
      aplicarFiltros();
    });
  }

  if (filtroTextoInput) {
    filtroTextoInput.addEventListener('input', (e) => {
      filtroTexto = e.target.value.toLowerCase();
      aplicarFiltros();
    });
  }

  // Función para cargar animales
  async function cargarAnimales() {
    try {
      const resultado = await api.getAnimales();
      animales = Array.isArray(resultado) ? resultado : [];
      mapaAnimalesPorValor.clear();
      
      if (listaAnimalesForm) {
        listaAnimalesForm.innerHTML = '';
      }
      if (listaAnimalesFiltro) {
        listaAnimalesFiltro.innerHTML = '';
      }
      const selectAnimal = document.getElementById('idAnimal');
      if (selectAnimal) {
        selectAnimal.value = '';
      }
      if (filtroAnimalInput) {
        filtroAnimalInput.value = '';
      }
      
      animales.forEach(animal => {
        const valor = `${animal.idAnimal} - ${animal.nombre} (${animal.especie})`;
        mapaAnimalesPorValor.set(valor.toLowerCase(), animal.idAnimal);

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
    } catch (error) {
      console.error('Error al cargar animales:', error);
      mostrarError(`Error al cargar la lista de animales: ${error.message || 'Error desconocido'}`);
    }
  }

  // Función para cargar controles de salud
  async function cargarControlesSalud() {
    try {
      const resultado = await api.getControlesSalud();
      if (Array.isArray(resultado)) {
        controlesSalud = resultado;
      } else if (Array.isArray(resultado?.controles)) {
        controlesSalud = resultado.controles;
      } else {
        controlesSalud = [];
      }
      controlesSaludFiltrados = [...controlesSalud];
      aplicarFiltros();
    } catch (error) {
      console.error('Error al cargar controles de salud:', error);
      mostrarError('Error al cargar el historial de controles de salud');
    }
  }

  // Función para mostrar controles en la tabla con paginación
  function mostrarControlesEnTabla() {
    if (!saludTable) {
      console.warn('Tabla de controles de salud no encontrada');
      return;
    }
    const tbody = saludTable.querySelector('tbody');

    if (!controlesSaludFiltrados || controlesSaludFiltrados.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">No se encontraron controles de salud</td></tr>';
      actualizarPaginacion();
      return;
    }

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const pagina = controlesSaludFiltrados.slice(inicio, fin);

    tbody.innerHTML = pagina.map(control => {
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

    actualizarPaginacion();
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
      
      if (!input || !input.value.trim()) {
        if (campo === 'idAnimal') {
          mostrarErrorCampo(campo, 'Selecciona un animal de la lista');
        } else {
          mostrarErrorCampo(campo, 'Este campo es obligatorio');
        }
        esValido = false;
      } else {
        limpiarErrorCampo(campo);
      }
    });

    if (idAnimalHidden && !idAnimalHidden.value) {
      mostrarErrorCampo('idAnimal', 'Selecciona un animal válido de la lista sugerida');
      if (animalBusquedaInput) {
        animalBusquedaInput.focus();
      }
      esValido = false;
    }

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

  function aplicarFiltros() {
    controlesSaludFiltrados = controlesSalud.filter((control) => {
      const estadoActual = control.estado || calcularEstadoControl(control);
      const coincideEstado = !filtroEstado || estadoActual === filtroEstado;
      const coincideAnimal = !filtroAnimal || String(control.idAnimal) === String(filtroAnimal);
      const texto = filtroTexto;
      const coincideTexto =
        !texto ||
        (control.nombreAnimal || '').toLowerCase().includes(texto) ||
        (control.especie || '').toLowerCase().includes(texto) ||
        (control.veterinario || '').toLowerCase().includes(texto) ||
        (control.vacunas || '').toLowerCase().includes(texto) ||
        (control.tratamientos || '').toLowerCase().includes(texto) ||
        (estadoActual || '').toLowerCase().includes(texto) ||
        String(control.idSalud || '').includes(texto);

      return coincideEstado && coincideAnimal && coincideTexto;
    });

    paginaActual = 1;
    mostrarControlesEnTabla();
  }

  function actualizarPaginacion() {
    const contenedor = document.getElementById('paginacionControles');
    if (!contenedor) return;

    const totalRegistros = controlesSaludFiltrados.length;
    const totalPaginas = Math.max(Math.ceil(totalRegistros / registrosPorPagina), 1);

    contenedor.innerHTML = totalRegistros === 0 ? '' : `
      <button class="btn btn-secondary" ${paginaActual === 1 ? 'disabled' : ''} onclick="paginaAnteriorControles()">«</button>
      <span>Página ${paginaActual} de ${totalPaginas} (${totalRegistros} registros)</span>
      <button class="btn btn-secondary" ${paginaActual === totalPaginas ? 'disabled' : ''} onclick="paginaSiguienteControles()">»</button>
    `;
  }

  window.paginaAnteriorControles = function() {
    if (paginaActual > 1) {
      paginaActual--;
      mostrarControlesEnTabla();
      const contenedorTabla = document.querySelector('.table-container-paginada .table-scrollable');
      if (contenedorTabla) contenedorTabla.scrollTop = 0;
    }
  };

  window.paginaSiguienteControles = function() {
    const totalPaginas = Math.ceil(controlesSaludFiltrados.length / registrosPorPagina);
    if (paginaActual < totalPaginas) {
      paginaActual++;
      mostrarControlesEnTabla();
      const contenedorTabla = document.querySelector('.table-container-paginada .table-scrollable');
      if (contenedorTabla) contenedorTabla.scrollTop = 0;
    }
  };
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
