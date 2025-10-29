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
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">No hay controles de salud registrados</td></tr>';
      return;
    }

    tbody.innerHTML = controles.map(control => `
      <tr>
        <td>${control.idSalud}</td>
        <td>${control.nombreAnimal} (${control.especie})</td>
        <td>${formatearFecha(control.fechaControl)}</td>
        <td>${control.veterinario || '-'}</td>
        <td>${control.vacunas || '-'}</td>
        <td>${control.tratamientos || '-'}</td>
        <td>${control.observaciones || '-'}</td>
        <td>
          <button class="btn-table ver" onclick="verControlSalud(${control.idSalud})">👁️</button>
          <button class="btn-table editar" onclick="editarControlSalud(${control.idSalud})">✏️</button>
          <button class="btn-table eliminar" onclick="eliminarControlSalud(${control.idSalud})">🗑️</button>
        </td>
      </tr>
    `).join('');
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

    // Validar fecha
    const fechaControl = document.getElementById('fechaControl').value;
    if (fechaControl && new Date(fechaControl) > new Date()) {
      mostrarErrorCampo('fechaControl', 'La fecha del control no puede ser futura');
      esValido = false;
    }

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
  // TODO: Implementar edición de control de salud
  alert('Función de edición en desarrollo');
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
