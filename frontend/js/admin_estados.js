// Gestión de estados para administradores
document.addEventListener('DOMContentLoaded', () => {
  // Verificar que el usuario es administrador
  requireAdmin();
  
  const form = document.getElementById('estadoForm');
  const estadosTable = document.getElementById('estadosTable');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');
  const animalBusquedaInput = document.getElementById('animalBusqueda');
  const listaAnimalesForm = document.getElementById('listaAnimalesEstados');
  const listaAnimalesFiltro = document.getElementById('listaAnimalesEstadosFiltro');
  const filtroTextoInput = document.getElementById('filtroTexto');
  const filtroEstadoSelect = document.getElementById('filtroEstado');
  const filtroAnimalInput = document.getElementById('filtroAnimal');
  const estadoActual = document.getElementById('estadoActual');
  const nuevoEstado = document.getElementById('nuevoEstado');
  const idAnimalHidden = document.getElementById('idAnimal');

  let animales = [];
  let cambiosEstado = [];
  let cambiosEstadoFiltrados = [];
  const mapaAnimalesPorValor = new Map();
  const mapaEtiquetasPorId = new Map();
  let paginaActual = 1;
  const registrosPorPagina = 5;
  let filtroAnimal = '';
  let filtroEstado = '';
  let filtroTexto = '';

  // Cargar datos iniciales
  cargarAnimales();
  cargarCambiosEstado();

  if (animalBusquedaInput) {
    animalBusquedaInput.addEventListener('input', async () => {
      const valor = animalBusquedaInput.value;
      const id = obtenerIdDesdeValor(valor);
      if (idAnimalHidden) {
        idAnimalHidden.value = id || '';
      }
      if (id) {
        await cargarEstadosDisponibles(Number(id));
      } else {
        limpiarFormularioEstado();
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

  // Función para cargar animales
  async function cargarAnimales() {
    try {
      const resultado = await api.getAnimales();
      animales = Array.isArray(resultado) ? resultado : [];
      mapaAnimalesPorValor.clear();

      if (listaAnimalesForm) listaAnimalesForm.innerHTML = '';
      if (listaAnimalesFiltro) listaAnimalesFiltro.innerHTML = '';
      if (animalBusquedaInput) animalBusquedaInput.value = '';
      if (idAnimalHidden) idAnimalHidden.value = '';
      if (filtroAnimalInput) filtroAnimalInput.value = '';

      animales.forEach(animal => {
        const valor = `${animal.idAnimal} - ${animal.nombre} (${animal.especie}) - ${animal.estado}`;
        mapaAnimalesPorValor.set(valor.toLowerCase(), animal.idAnimal);
        mapaEtiquetasPorId.set(String(animal.idAnimal), valor);

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
      mostrarError('Error al cargar la lista de animales');
    }
  }

  // Función para cargar estados disponibles
  async function cargarEstadosDisponibles(animalId) {
    try {
      const response = await api.getEstadosDisponibles(animalId);

      if (animalBusquedaInput && mapaEtiquetasPorId.has(String(animalId))) {
        animalBusquedaInput.value = mapaEtiquetasPorId.get(String(animalId));
      }
      if (idAnimalHidden) {
        idAnimalHidden.value = animalId;
      }
      
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
      const resultado = await api.getCambiosEstado();
      cambiosEstado = Array.isArray(resultado) ? resultado : [];
      aplicarFiltros();
    } catch (error) {
      console.error('Error al cargar cambios de estado:', error);
      mostrarError('Error al cargar el historial de cambios de estado');
    }
  }

  // Función para mostrar cambios en la tabla con paginación
  function mostrarCambiosEnTabla() {
    const tbody = estadosTable.querySelector('tbody');
    
    if (!cambiosEstadoFiltrados || cambiosEstadoFiltrados.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No hay cambios de estado registrados</td></tr>';
      actualizarPaginacion();
      return;
    }

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const pagina = cambiosEstadoFiltrados.slice(inicio, fin);

    tbody.innerHTML = pagina.map(cambio => `
      <tr>
        <td>${cambio.idEstado}</td>
        <td>${cambio.nombreAnimal} (${cambio.especie})</td>
        <td><span class="status ${getStatusClass(cambio.estadoAnterior)}">${cambio.estadoAnterior}</span></td>
        <td><span class="status ${getStatusClass(cambio.estadoNuevo)}">${cambio.estadoNuevo}</span></td>
        <td>${formatearFecha(cambio.fechaCambio)}</td>
        <td>${cambio.motivo || '-'}</td>
        <td>
          <button class="btn-table ver" onclick="verCambioEstado(${cambio.idEstado})">👁️</button>
          <button class="btn-table editar" onclick="editarAnimalDesdeEstados(${cambio.idAnimal})">✏️</button>
          <button class="btn-table eliminar" onclick="eliminarCambioEstado(${cambio.idEstado})">🗑️</button>
        </td>
      </tr>
    `).join('');

    actualizarPaginacion();
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
    if (estadoActual) estadoActual.value = '';
    if (animalBusquedaInput) animalBusquedaInput.value = '';
    if (idAnimalHidden) idAnimalHidden.value = '';
    if (nuevoEstado) {
      nuevoEstado.innerHTML = '<option value="">Seleccionar nuevo estado</option>';
      nuevoEstado.disabled = true;
    }
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

  function aplicarFiltros() {
    cambiosEstadoFiltrados = cambiosEstado.filter((cambio) => {
      const idAnimal = String(cambio.idAnimal || '');
      const coincideAnimal = !filtroAnimal || idAnimal === String(filtroAnimal);
      const coincideEstado = !filtroEstado || (cambio.estadoNuevo || '').toLowerCase() === filtroEstado.toLowerCase();
      const texto = filtroTexto;
      const coincideTexto =
        !texto ||
        (cambio.nombreAnimal || '').toLowerCase().includes(texto) ||
        (cambio.estadoAnterior || '').toLowerCase().includes(texto) ||
        (cambio.estadoNuevo || '').toLowerCase().includes(texto) ||
        (cambio.motivo || '').toLowerCase().includes(texto) ||
        String(cambio.idEstado || '').includes(texto);

      return coincideAnimal && coincideEstado && coincideTexto;
    });

    paginaActual = 1;
    mostrarCambiosEnTabla();
  }

  function actualizarPaginacion() {
    const contenedor = document.getElementById('paginacionEstados');
    if (!contenedor) return;

    const totalRegistros = cambiosEstadoFiltrados.length;
    const totalPaginas = Math.max(Math.ceil(totalRegistros / registrosPorPagina), 1);
    contenedor.innerHTML = `
      <button class="btn btn-secondary" ${paginaActual === 1 ? 'disabled' : ''} onclick="paginaAnteriorEstados()">«</button>
      <span>Página ${paginaActual} de ${totalPaginas} (${totalRegistros} registros)</span>
      <button class="btn btn-secondary" ${paginaActual === totalPaginas ? 'disabled' : ''} onclick="paginaSiguienteEstados()">»</button>
    `;
  }

  window.paginaAnteriorEstados = function() {
    if (paginaActual > 1) {
      paginaActual--;
      mostrarCambiosEnTabla();
      const contenedorTabla = document.querySelector('.table-container-paginada');
      if (contenedorTabla) contenedorTabla.scrollTop = 0;
    }
  };

  window.paginaSiguienteEstados = function() {
    const totalPaginas = Math.ceil(cambiosEstadoFiltrados.length / registrosPorPagina);
    if (paginaActual < totalPaginas) {
      paginaActual++;
      mostrarCambiosEnTabla();
      const contenedorTabla = document.querySelector('.table-container-paginada');
      if (contenedorTabla) contenedorTabla.scrollTop = 0;
    }
  };
});

// Funciones globales para acciones de la tabla
async function verCambioEstado(id) {
  try {
    const cambio = await api.getCambioEstado(id);
    const adoptanteInfo = cambio.emailAdoptante 
      ? `${cambio.nombreAdoptante || 'Sistema'}\nEmail: ${cambio.emailAdoptante}`
      : cambio.nombreAdoptante || 'Sistema';
    alert(`Cambio de Estado:\n\nID: ${cambio.idEstado}\nAnimal: ${cambio.nombreAnimal}\nEstado Anterior: ${cambio.estadoAnterior}\nEstado Nuevo: ${cambio.estadoNuevo}\nFecha: ${new Date(cambio.fechaCambio).toLocaleDateString('es-ES')}\nMotivo: ${cambio.motivo || 'No especificado'}\nAdoptante: ${adoptanteInfo}`);
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
