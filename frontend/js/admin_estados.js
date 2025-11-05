// Gestión de estados para administradores
document.addEventListener('DOMContentLoaded', () => {
  // Verificar que el usuario es administrador
  requireAdmin();
  
  const form = document.getElementById('estadoForm');
  const estadosTable = document.getElementById('estadosTable');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');
  const filtroAnimal = document.getElementById('filtroAnimal');
  const btnFiltrar = document.getElementById('btnFiltrar');
  const estadoActual = document.getElementById('estadoActual');
  const nuevoEstado = document.getElementById('nuevoEstado');

  let animales = [];
  let cambiosEstado = [];

  // Cargar datos iniciales
  cargarAnimales();
  cargarCambiosEstado();

  // Manejar cambio de animal seleccionado
  document.getElementById('idAnimal').addEventListener('change', async (e) => {
    const animalId = e.target.value;
    if (animalId) {
      await cargarEstadosDisponibles(animalId);
    } else {
      limpiarFormularioEstado();
    }
  });

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
      const estadoData = {
        animalId: parseInt(formData.get('idAnimal')),
        nuevoEstado: formData.get('nuevoEstado'),
        motivo: formData.get('motivo').trim()
      };

      // Cambiar estado del animal
      const response = await api.cambiarEstadoAnimal(estadoData.animalId, estadoData.nuevoEstado, estadoData.motivo);
      
      // Mostrar éxito
      const animal = animales.find(a => a.idAnimal === estadoData.animalId);
      mostrarExito(`Estado de ${animal.nombre} actualizado exitosamente: ${response.cambio.animal.estadoAnterior} → ${response.cambio.animal.estadoNuevo}`);
      
      // Limpiar formulario
      form.reset();
      limpiarFormularioEstado();
      
      // Recargar datos
      cargarAnimales();
      cargarCambiosEstado();

    } catch (error) {
      console.error('Error al cambiar estado:', error);
      
      // Manejar diferentes tipos de errores
      if (error.message.includes('Campos obligatorios')) {
        mostrarError('Por favor, completa todos los campos obligatorios marcados con *');
      } else if (error.message.includes('Transición no válida')) {
        mostrarError(error.message);
      } else if (error.message.includes('Animal no encontrado')) {
        mostrarError('El animal seleccionado no existe');
      } else {
        mostrarError(error.message || 'Error al cambiar el estado del animal. Por favor, intenta nuevamente.');
      }
    }
  });

  // Manejar filtro
  btnFiltrar.addEventListener('click', () => {
    const animalId = filtroAnimal.value;
    if (animalId) {
      cargarHistorialAnimal(animalId);
    } else {
      cargarCambiosEstado();
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
        const option1 = new Option(`${animal.nombre} (${animal.especie}) - ${animal.estado}`, animal.idAnimal);
        const option2 = new Option(`${animal.nombre} (${animal.especie}) - ${animal.estado}`, animal.idAnimal);
        selectAnimal.add(option1);
        selectFiltro.add(option2);
      });
    } catch (error) {
      console.error('Error al cargar animales:', error);
      mostrarError('Error al cargar la lista de animales');
    }
  }

  // Función para cargar estados disponibles
  async function cargarEstadosDisponibles(animalId) {
    try {
      const response = await api.getEstadosDisponibles(animalId);
      
      // Mostrar estado actual
      estadoActual.value = response.estadoActual;
      
      // Llenar select de nuevos estados
      nuevoEstado.innerHTML = '<option value="">Seleccionar nuevo estado</option>';
      
      if (response.puedeCambiar) {
        response.estadosDisponibles.forEach(estado => {
          const option = new Option(estado, estado);
          nuevoEstado.add(option);
        });
        nuevoEstado.disabled = false;
      } else {
        nuevoEstado.innerHTML = '<option value="">No se puede cambiar el estado</option>';
        nuevoEstado.disabled = true;
      }
    } catch (error) {
      console.error('Error al cargar estados disponibles:', error);
      mostrarError('Error al cargar los estados disponibles');
    }
  }

  // Función para cargar cambios de estado
  async function cargarCambiosEstado() {
    try {
      cambiosEstado = await api.getCambiosEstado();
      mostrarCambiosEnTabla(cambiosEstado);
    } catch (error) {
      console.error('Error al cargar cambios de estado:', error);
      mostrarError('Error al cargar el historial de cambios de estado');
    }
  }

  // Función para cargar historial de un animal específico
  async function cargarHistorialAnimal(animalId) {
    try {
      const historial = await api.getHistorialEstados(animalId);
      mostrarCambiosEnTabla(historial);
    } catch (error) {
      console.error('Error al cargar historial del animal:', error);
      mostrarError('Error al cargar el historial del animal');
    }
  }

  // Función para mostrar cambios en la tabla
  function mostrarCambiosEnTabla(cambios) {
    const tbody = estadosTable.querySelector('tbody');
    
    if (cambios.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">No hay cambios de estado registrados</td></tr>';
      return;
    }

    tbody.innerHTML = cambios.map(cambio => `
      <tr>
        <td>${cambio.idEstado}</td>
        <td>${cambio.nombreAnimal} (${cambio.especie})</td>
        <td><span class="status ${getStatusClass(cambio.estadoAnterior)}">${cambio.estadoAnterior}</span></td>
        <td><span class="status ${getStatusClass(cambio.estadoNuevo)}">${cambio.estadoNuevo}</span></td>
        <td>${formatearFecha(cambio.fechaCambio)}</td>
        <td>${cambio.motivo || '-'}</td>
        <td>${cambio.usuario || '-'}</td>
        <td>
          <button class="btn-table ver" onclick="verCambioEstado(${cambio.idEstado})">👁️</button>
          <button class="btn-table editar" onclick="editarAnimalDesdeEstados(${cambio.idAnimal})">✏️</button>
          <button class="btn-table eliminar" onclick="eliminarCambioEstado(${cambio.idEstado})">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  // Función para obtener clase CSS del estado
  function getStatusClass(estado) {
    const estados = {
      'Disponible': 'disponible',
      'En proceso': 'proceso',
      'Adoptado': 'adoptado',
      'En tratamiento': 'tratamiento'
    };
    return estados[estado] || '';
  }

  // Función para formatear fecha
  function formatearFecha(fecha) {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  // Función para limpiar formulario de estado
  function limpiarFormularioEstado() {
    estadoActual.value = '';
    nuevoEstado.innerHTML = '<option value="">Seleccionar nuevo estado</option>';
    nuevoEstado.disabled = true;
  }

  // Función para validar formulario
  function validarFormulario() {
    let esValido = true;
    const camposObligatorios = ['idAnimal', 'nuevoEstado'];

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

    return esValido;
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
    const campos = ['idAnimal', 'nuevoEstado'];
    campos.forEach(campo => limpiarErrorCampo(campo));
  }
});

// Funciones globales para acciones de la tabla
async function verCambioEstado(id) {
  try {
    const cambio = await api.getCambioEstado(id);
    alert(`Cambio de Estado:\n\nID: ${cambio.idEstado}\nAnimal: ${cambio.nombreAnimal}\nEstado Anterior: ${cambio.estadoAnterior}\nEstado Nuevo: ${cambio.estadoNuevo}\nFecha: ${new Date(cambio.fechaCambio).toLocaleDateString('es-ES')}\nMotivo: ${cambio.motivo || 'No especificado'}\nUsuario: ${cambio.usuario || 'No especificado'}`);
  } catch (error) {
    alert('Error al obtener información del cambio de estado');
  }
}

async function eliminarCambioEstado(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este cambio de estado? Esta acción no se puede deshacer.')) {
    return;
  }

  try {
    await api.eliminarCambioEstado(id);
    alert('Cambio de estado eliminado exitosamente');
    // Recargar tabla
    document.querySelector('script').dispatchEvent(new Event('DOMContentLoaded'));
  } catch (error) {
    alert('Error al eliminar el cambio de estado');
  }
}

async function editarAnimalDesdeEstados(animalId) {
  // Redirigir a la página de gestión de animales con el animal pre-seleccionado
  window.location.href = `admin_animales.html?editar=${animalId}`;
}
