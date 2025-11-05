// Gestión de animales para administradores
document.addEventListener('DOMContentLoaded', () => {
  // Verificar que el usuario es administrador
  requireAdmin();
  
  const form = document.getElementById('animalForm');
  const animalsTable = document.getElementById('animalsTable');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');
  const formTitle = document.querySelector('.form-section h3');
  const submitButton = form.querySelector('button[type="submit"]');
  
  let modoEdicion = false;
  let animalEditando = null;
  
  // Hacer variables accesibles globalmente para editarAnimal
  window.setModoEdicion = function(editar, animal) {
    modoEdicion = editar;
    animalEditando = animal;
  };
  
  // Función global para cancelar edición
  window.cancelarEdicion = function() {
    modoEdicion = false;
    animalEditando = null;
    
    // Obtener referencias a elementos
    const formTitle = document.querySelector('.form-section h3');
    const submitButton = document.getElementById('animalForm')?.querySelector('button[type="submit"]');
    const form = document.getElementById('animalForm');
    const fotoPreview = document.getElementById('foto-preview');
    const fotoPreviewImg = document.getElementById('foto-preview-img');
    
    // Restaurar título del formulario
    if (formTitle) formTitle.textContent = 'Registrar Nuevo Animal';
    if (submitButton) submitButton.textContent = 'Registrar Animal';
    
    // Limpiar formulario
    if (form) form.reset();
    if (fotoPreview) fotoPreview.style.display = 'none';
    if (fotoPreviewImg) fotoPreviewImg.src = '';
    
    // Eliminar botón cancelar
    const cancelButton = document.getElementById('btn-cancelar-edicion');
    if (cancelButton) {
      cancelButton.remove();
    }
    
    // Limpiar mensajes
    limpiarMensajes();
    limpiarErrores();
  };

  // Verificar si hay parámetro de edición en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const editarId = urlParams.get('editar');
  if (editarId) {
    // Esperar un momento para que todo esté cargado
    setTimeout(() => {
      editarAnimal(parseInt(editarId));
    }, 500);
  }

  // Vista previa de imagen
  const fotoInput = document.getElementById('foto');
  const fotoPreview = document.getElementById('foto-preview');
  const fotoPreviewImg = document.getElementById('foto-preview-img');
  const btnRemoveFoto = document.getElementById('btn-remove-foto');

  fotoInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño
      if (file.size > 5 * 1024 * 1024) {
        mostrarError('La imagen es demasiado grande. El tamaño máximo es 5MB.');
        e.target.value = '';
        return;
      }

      // Validar tipo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        mostrarError('Formato de imagen no válido. Use JPG, PNG, GIF o WEBP.');
        e.target.value = '';
        return;
      }

      // Mostrar vista previa
      const reader = new FileReader();
      reader.onload = function(e) {
        fotoPreviewImg.src = e.target.result;
        fotoPreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  btnRemoveFoto.addEventListener('click', function() {
    fotoInput.value = '';
    fotoPreview.style.display = 'none';
    fotoPreviewImg.src = '';
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
      // Crear FormData para enviar archivo
      const formData = new FormData(form);
      
      // Obtener token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        mostrarError('Debes estar autenticado para registrar/editar animales');
        return;
      }

      let response;
      
      // Obtener modo edición desde variables globales si están disponibles
      const esModoEdicion = modoEdicion && animalEditando;
      
      if (esModoEdicion) {
        // Modo edición: Actualizar animal existente
        const nombre = formData.get('nombre').trim();
        
        // Verificar duplicados solo si el nombre cambió
        if (nombre !== animalEditando.nombre) {
          if (await verificarDuplicado(nombre)) {
            mostrarError('Ya existe un animal registrado con ese nombre. Por favor, usa un nombre diferente.');
            return;
          }
        }

        // Enviar actualización con FormData
        const animalId = animalEditando.idAnimal;
        response = await fetch(`/api/animales/${animalId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al actualizar el animal');
        }
        
        // Mostrar éxito
        mostrarExito(`Animal "${data.animal.nombre}" actualizado exitosamente`);
        
        // Salir del modo edición
        window.cancelarEdicion();
        
      } else {
        // Modo creación: Registrar nuevo animal
        // Verificar duplicados por nombre
        const nombre = formData.get('nombre').trim();
        if (await verificarDuplicado(nombre)) {
          mostrarError('Ya existe un animal registrado con ese nombre. Por favor, verifica o usa un nombre diferente.');
          return;
        }

        // Enviar formulario con archivo usando FormData
        response = await fetch('/api/animales', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al registrar el animal');
        }
        
        // Mostrar éxito
        mostrarExito(`Animal "${data.animal.nombre}" registrado exitosamente con ID: ${data.animal.idAnimal}`);
        
        // Limpiar formulario y vista previa
        form.reset();
        fotoPreview.style.display = 'none';
        fotoPreviewImg.src = '';
      }
      
      // Recargar tabla
      window.cargarAnimales();

    } catch (error) {
      console.error('Error al procesar animal:', error);
      
      // Manejar diferentes tipos de errores
      if (error.message.includes('Campos obligatorios')) {
        mostrarError('Por favor, completa todos los campos obligatorios marcados con *');
      } else if (error.message.includes('Ya existe un animal')) {
        mostrarError('Ya existe un animal registrado con ese nombre. Por favor, usa un nombre diferente.');
      } else if (error.message.includes('edad debe estar')) {
        mostrarError('La edad debe estar entre 0 y 30 años');
      } else if (error.message.includes('fecha de ingreso no puede ser futura')) {
        mostrarError('La fecha de ingreso no puede ser futura');
      } else if (error.message.includes('puntaje mínimo')) {
        mostrarError('El puntaje mínimo debe estar entre 0 y 100');
      } else {
        mostrarError(error.message || 'Error al procesar el animal. Por favor, intenta nuevamente.');
      }
    }
  });

  // Función para validar formulario
  function validarFormulario() {
    let esValido = true;
    const camposObligatorios = ['nombre', 'especie', 'edad', 'estado', 'fechaIngreso', 'puntajeMinimo'];

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

    // Validaciones específicas
    const nombre = document.getElementById('nombre').value.trim();
    if (nombre && nombre.length < 2) {
      mostrarErrorCampo('nombre', 'El nombre debe tener al menos 2 caracteres');
      esValido = false;
    }

    const edad = parseInt(document.getElementById('edad').value);
    if (edad && (edad < 0 || edad > 30)) {
      mostrarErrorCampo('edad', 'La edad debe estar entre 0 y 30 años');
      esValido = false;
    }

    const fechaIngreso = document.getElementById('fechaIngreso').value;
    if (fechaIngreso && new Date(fechaIngreso) > new Date()) {
      mostrarErrorCampo('fechaIngreso', 'La fecha de ingreso no puede ser futura');
      esValido = false;
    }

    const puntajeMinimo = parseInt(document.getElementById('puntajeMinimo').value);
    if (isNaN(puntajeMinimo) || puntajeMinimo < 0 || puntajeMinimo > 100) {
      mostrarErrorCampo('puntajeMinimo', 'El puntaje mínimo debe estar entre 0 y 100');
      esValido = false;
    }

    return esValido;
  }

  // Función para verificar duplicados
  async function verificarDuplicado(nombre) {
    try {
      const animales = await api.getAnimales();
      return animales.some(animal => 
        animal.nombre.toLowerCase() === nombre.toLowerCase()
      );
    } catch (error) {
      console.error('Error al verificar duplicados:', error);
      return false;
    }
  }

  // Función para obtener clase CSS del estado (definir primero para que esté disponible)
  window.getStatusClass = function getStatusClass(estado) {
    const estados = {
      'Disponible': 'disponible',
      'En proceso': 'proceso',
      'Adoptado': 'adoptado',
      'En tratamiento': 'tratamiento'
    };
    return estados[estado] || '';
  };

  // Función para formatear fecha (definir primero para que esté disponible)
  window.formatearFecha = function formatearFecha(fecha) {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  // Variables para paginación y filtrado (definidas antes de usarlas)
  let todosLosAnimales = [];
  let animalesFiltrados = [];
  let paginaActual = 1;
  const registrosPorPagina = 5;

  // Función para filtrar animales por estado
  function filtrarAnimales(estado) {
    try {
      // Verificar que todosLosAnimales esté definido
      if (!todosLosAnimales || !Array.isArray(todosLosAnimales)) {
        todosLosAnimales = [];
      }
      
      if (!estado || estado === '') {
        animalesFiltrados = [...todosLosAnimales];
      } else {
        animalesFiltrados = todosLosAnimales.filter(animal => animal.estado === estado);
      }
      paginaActual = 1; // Resetear a la primera página
      mostrarAnimales();
    } catch (error) {
      console.error('Error en filtrarAnimales:', error);
    }
  }

  // Función para mostrar animales con paginación (definida antes de cargarAnimales)
  function mostrarAnimales() {
    try {
      const animalsTable = document.getElementById('animalsTable');
      if (!animalsTable) {
        console.error('No se encontró la tabla de animales');
        return;
      }
      const tbody = animalsTable.querySelector('tbody');
      if (!tbody) {
        console.error('No se encontró el tbody de la tabla');
        return;
      }
      
      // Verificar que animalesFiltrados esté definido
      if (!animalesFiltrados || !Array.isArray(animalesFiltrados)) {
        animalesFiltrados = [];
      }
      
      if (animalesFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">No hay animales registrados que coincidan con el filtro</td></tr>';
        return;
      }

    // Calcular índices para la paginación
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const animalesPagina = animalesFiltrados.slice(inicio, fin);

    tbody.innerHTML = animalesPagina.map(animal => `
      <tr>
        <td>${animal.idAnimal}</td>
        <td>${animal.nombre}</td>
        <td>${animal.especie || '-'}</td>
        <td>${animal.raza || '-'}</td>
        <td>${animal.edad || '-'}</td>
        <td><span class="status ${window.getStatusClass(animal.estado)}">${animal.estado || '-'}</span></td>
        <td>${animal.puntajeMinimo !== null && animal.puntajeMinimo !== undefined ? animal.puntajeMinimo : 0}</td>
        <td>${window.formatearFecha(animal.fechaIngreso)}</td>
        <td>
          <button class="btn-table ver" onclick="verAnimal(${animal.idAnimal})">👁️</button>
          <button class="btn-table salud" onclick="verHistorialSalud(${animal.idAnimal})">🏥</button>
          <button class="btn-table estado" onclick="cambiarEstadoAnimal(${animal.idAnimal})">🔄</button>
          <button class="btn-table editar" onclick="editarAnimal(${animal.idAnimal})">✏️</button>
          <button class="btn-table eliminar" onclick="eliminarAnimal(${animal.idAnimal})">🗑️</button>
        </td>
      </tr>
    `).join('');

    // Agregar controles de paginación si hay más de 5 registros
    if (animalesFiltrados.length > registrosPorPagina) {
      const totalPaginas = Math.ceil(animalesFiltrados.length / registrosPorPagina);
      const paginacionHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 15px; background-color: #f8f9fa; border-top: 2px solid #ddd;">
            <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
              <button onclick="window.paginaAnterior()" ${paginaActual === 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} class="btn btn-secondary" style="padding: 5px 15px;">« Anterior</button>
              <span style="font-weight: 500;">Página ${paginaActual} de ${totalPaginas} (${animalesFiltrados.length} registros)</span>
              <button onclick="window.paginaSiguiente()" ${paginaActual === totalPaginas ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} class="btn btn-secondary" style="padding: 5px 15px;">Siguiente »</button>
            </div>
          </td>
        </tr>
      `;
      tbody.innerHTML += paginacionHTML;
    }
    } catch (error) {
      console.error('Error en mostrarAnimales:', error);
      const animalsTable = document.getElementById('animalsTable');
      if (animalsTable) {
        const tbody = animalsTable.querySelector('tbody');
        if (tbody) {
          tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: #e74c3c;">Error al mostrar los animales</td></tr>';
        }
      }
    }
  }

  // Función para cargar animales en la tabla (hacerla global)
  window.cargarAnimales = async function cargarAnimales() {
    try {
      const animales = await api.getAnimales();
      if (!animales || !Array.isArray(animales)) {
        throw new Error('No se recibieron datos válidos de animales');
      }
      
      todosLosAnimales = animales;
      // Ordenar por ID descendente (por si acaso el backend no lo hace)
      todosLosAnimales.sort((a, b) => (b.idAnimal || 0) - (a.idAnimal || 0));
      
      // Aplicar filtro actual si existe
      const filtroEstado = document.getElementById('filtroEstado');
      const estadoFiltro = filtroEstado ? filtroEstado.value : '';
      filtrarAnimales(estadoFiltro);
      
    } catch (error) {
      console.error('Error al cargar animales:', error);
      console.error('Detalles:', error.message, error.stack);
      // Intentar mostrar error si la función está disponible
      const errorMessage = document.getElementById('error-message');
      if (errorMessage) {
        errorMessage.textContent = `Error al cargar la lista de animales: ${error.message || 'Error desconocido'}`;
        errorMessage.style.display = 'block';
      }
      
      // Mostrar mensaje en la tabla también
      const animalsTable = document.getElementById('animalsTable');
      if (animalsTable) {
        const tbody = animalsTable.querySelector('tbody');
        if (tbody) {
          tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: #e74c3c;">Error al cargar los animales. Por favor, recarga la página.</td></tr>';
        }
      }
    }
  };

  // Funciones de paginación globales
  window.paginaAnterior = function() {
    if (paginaActual > 1) {
      paginaActual--;
      mostrarAnimales();
      // Scroll al inicio de la tabla
      const tableContainer = document.querySelector('.table-container');
      if (tableContainer) {
        tableContainer.scrollTop = 0;
      }
    }
  };

  window.paginaSiguiente = function() {
    const totalPaginas = Math.ceil(animalesFiltrados.length / registrosPorPagina);
    if (paginaActual < totalPaginas) {
      paginaActual++;
      mostrarAnimales();
      // Scroll al inicio de la tabla
      const tableContainer = document.querySelector('.table-container');
      if (tableContainer) {
        tableContainer.scrollTop = 0;
      }
    }
  };

  // Configurar filtro por estado
  const filtroEstado = document.getElementById('filtroEstado');
  if (filtroEstado) {
    filtroEstado.addEventListener('change', (e) => {
      filtrarAnimales(e.target.value);
    });
  }

  // Cargar animales al iniciar (después de definir las funciones)
  window.cargarAnimales();

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
    const campos = ['nombre', 'especie', 'edad', 'estado', 'fechaIngreso', 'puntajeMinimo'];
    campos.forEach(campo => limpiarErrorCampo(campo));
  }
});

// Funciones globales para acciones de la tabla
async function verAnimal(id) {
  try {
    const animal = await api.getAnimal(id);
    alert(`Ficha del Animal:\n\nID: ${animal.idAnimal}\nNombre: ${animal.nombre}\nEspecie: ${animal.especie}\nRaza: ${animal.raza}\nEdad: ${animal.edad} años\nEstado: ${animal.estado}\nPuntaje Mínimo Requerido: ${animal.puntajeMinimo || 0}\nFecha Ingreso: ${new Date(animal.fechaIngreso).toLocaleDateString('es-ES')}`);
  } catch (error) {
    alert('Error al obtener información del animal');
  }
}

async function editarAnimal(id) {
  try {
    // Cargar datos del animal
    const animal = await api.getAnimal(id);
    
    // Obtener referencias a elementos del DOM
    const form = document.getElementById('animalForm');
    const formTitle = document.querySelector('.form-section h3');
    const submitButton = form.querySelector('button[type="submit"]');
    const fotoPreview = document.getElementById('foto-preview');
    const fotoPreviewImg = document.getElementById('foto-preview-img');
    
    // Establecer modo edición (usar variables globales si existen, sino crear nuevas)
    if (typeof window.setModoEdicion === 'function') {
      window.setModoEdicion(true, animal);
    }
    
    // Cambiar título del formulario
    if (formTitle) {
      formTitle.textContent = 'Editar Animal';
    }
    if (submitButton) {
      submitButton.textContent = 'Actualizar Animal';
    }
    
    // Llenar formulario con datos del animal
    const nombreInput = document.getElementById('nombre');
    const especieInput = document.getElementById('especie');
    const razaInput = document.getElementById('raza');
    const edadInput = document.getElementById('edad');
    const estadoInput = document.getElementById('estado');
    const fechaIngresoInput = document.getElementById('fechaIngreso');
    const descripcionInput = document.getElementById('descripcion');
    const puntajeMinimoInput = document.getElementById('puntajeMinimo');
    
    if (nombreInput) nombreInput.value = animal.nombre || '';
    if (especieInput) especieInput.value = animal.especie || '';
    if (razaInput) razaInput.value = animal.raza || '';
    if (edadInput) edadInput.value = animal.edad || '';
    if (estadoInput) estadoInput.value = animal.estado || '';
    if (fechaIngresoInput) {
      fechaIngresoInput.value = animal.fechaIngreso ? animal.fechaIngreso.split('T')[0] : '';
    }
    if (descripcionInput) descripcionInput.value = animal.descripcion || '';
    if (puntajeMinimoInput) {
      puntajeMinimoInput.value = animal.puntajeMinimo !== null && animal.puntajeMinimo !== undefined ? animal.puntajeMinimo : 0;
    }
    
    // Mostrar foto actual si existe
    if (animal.foto && fotoPreviewImg && fotoPreview) {
      fotoPreviewImg.src = animal.foto.startsWith('http') ? animal.foto : `/${animal.foto}`;
      fotoPreview.style.display = 'block';
    } else if (fotoPreview) {
      fotoPreview.style.display = 'none';
    }
    
    // Scroll al formulario
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Agregar botón cancelar si no existe
    if (submitButton && !document.getElementById('btn-cancelar-edicion')) {
      const cancelButton = document.createElement('button');
      cancelButton.type = 'button';
      cancelButton.id = 'btn-cancelar-edicion';
      cancelButton.className = 'btn btn-secondary';
      cancelButton.textContent = 'Cancelar Edición';
      cancelButton.style.marginLeft = '10px';
      cancelButton.onclick = () => {
        if (typeof window.cancelarEdicion === 'function') {
          window.cancelarEdicion();
        }
      };
      submitButton.parentElement.appendChild(cancelButton);
    }
    
  } catch (error) {
    console.error('Error al cargar animal para edición:', error);
    console.error('Detalles del error:', error.message, error.stack);
    alert(`Error al cargar los datos del animal para edición: ${error.message || 'Error desconocido'}`);
  }
}


async function eliminarAnimal(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este animal? Esta acción no se puede deshacer.')) {
    return;
  }

  try {
    await api.eliminarAnimal(id);
    alert('Animal eliminado exitosamente');
    // Recargar tabla
    document.getElementById('animalsTable').querySelector('tbody').innerHTML = '';
    document.querySelector('script').dispatchEvent(new Event('DOMContentLoaded'));
  } catch (error) {
    alert('Error al eliminar el animal');
  }
}

async function verHistorialSalud(animalId) {
  try {
    const animal = await api.getAnimal(animalId);
    const historial = await api.getHistorialSalud(animalId);
    
    if (historial.length === 0) {
      alert(`No hay controles de salud registrados para ${animal.nombre}`);
      return;
    }

    let mensaje = `Historial de Salud de ${animal.nombre}:\n\n`;
    historial.forEach((control, index) => {
      mensaje += `${index + 1}. Fecha: ${new Date(control.fechaControl).toLocaleDateString('es-ES')}\n`;
      mensaje += `   Veterinario: ${control.veterinario || 'No especificado'}\n`;
      mensaje += `   Vacunas: ${control.vacunas || 'No especificadas'}\n`;
      mensaje += `   Tratamientos: ${control.tratamientos || 'No especificados'}\n`;
      mensaje += `   Observaciones: ${control.observaciones || 'No especificadas'}\n\n`;
    });

    alert(mensaje);
  } catch (error) {
    alert('Error al obtener el historial de salud del animal');
  }
}

async function cambiarEstadoAnimal(animalId) {
  try {
    const animal = await api.getAnimal(animalId);
    const estadosDisponibles = await api.getEstadosDisponibles(animalId);
    
    if (!estadosDisponibles.puedeCambiar) {
      alert(`${animal.nombre} está en estado "${animal.estado}" y no se puede cambiar.`);
      return;
    }

    // Crear opciones para el select
    let opciones = `Estado actual: ${animal.estado}\n\nEstados disponibles:\n`;
    estadosDisponibles.estadosDisponibles.forEach((estado, index) => {
      opciones += `${index + 1}. ${estado}\n`;
    });

    const nuevoEstado = prompt(`${opciones}\nIngrese el nuevo estado:`);
    if (!nuevoEstado) return;

    if (!estadosDisponibles.estadosDisponibles.includes(nuevoEstado)) {
      alert('Estado no válido. Por favor, seleccione uno de los estados disponibles.');
      return;
    }

    const motivo = prompt('Ingrese el motivo del cambio (opcional):') || 'Cambio de estado';

    // Realizar cambio de estado
    const response = await api.cambiarEstadoAnimal(animalId, nuevoEstado, motivo);
    
    alert(`Estado de ${animal.nombre} actualizado exitosamente: ${response.cambio.animal.estadoAnterior} → ${response.cambio.animal.estadoNuevo}`);
    
    // Recargar tabla
    if (typeof window.cargarAnimales === 'function') {
      window.cargarAnimales();
    } else {
      // Si no está disponible, recargar la página
      location.reload();
    }

  } catch (error) {
    console.error('Error al cambiar estado:', error);
    alert(error.message || 'Error al cambiar el estado del animal');
  }
}
