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
    
    // Restaurar título del formulario
    if (formTitle) formTitle.textContent = 'Registrar Nuevo Animal';
    if (submitButton) submitButton.textContent = 'Registrar Animal';
    
    // Limpiar formulario
    if (form) form.reset();
    limpiarVistaPreviaSeleccion();
    renderGaleriaActual([]);
    
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

  const filtroEstadoSelect = document.getElementById('filtroEstado');
  const filtroEspecieSelect = document.getElementById('filtroEspecie');
  const filtroGeneralInput = document.getElementById('filtroGeneral');
  const fotoInput = document.getElementById('foto');
  const fotoPreview = document.getElementById('foto-preview');
  const fotoPreviewList = document.getElementById('foto-preview-list');
  const btnRemoveFoto = document.getElementById('btn-remove-foto');
  const galeriaActual = document.getElementById('galeria-actual');

  function normalizarRutaImagen(ruta) {
    if (!ruta) return '';
    if (ruta.startsWith('http') || ruta.startsWith('data:')) return ruta;
    const base = ruta.startsWith('/') ? ruta : `/${ruta}`;
    return base.replace(/\\/g, '/').replace(/\/{2,}/g, '/');
  }

  function limpiarVistaPreviaSeleccion() {
    if (fotoPreviewList) {
      fotoPreviewList.innerHTML = '';
    }
    if (fotoPreview) {
      fotoPreview.style.display = 'none';
    }
  }

  function renderGaleriaActual(rutas) {
    if (!galeriaActual) return;

    if (!rutas || rutas.length === 0) {
      galeriaActual.innerHTML = '<small style="color:#666;">Este animal aún no tiene fotos registradas.</small>';
      return;
    }

    const contenido = rutas.map((ruta) => {
      const src = normalizarRutaImagen(ruta);
      return `<img src="${src}" alt="Foto registrada" style="width: 90px; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;">`;
    }).join('');

    galeriaActual.innerHTML = `
      <div style="margin-bottom:6px; font-size: 13px; color:#444; font-weight:500;">Galería actual (${rutas.length}):</div>
      <div style="display:flex; flex-wrap:wrap; gap:8px;">${contenido}</div>
    `;
  }

  renderGaleriaActual([]);

  fotoInput.addEventListener('change', function(e) {
    limpiarVistaPreviaSeleccion();
    const archivos = Array.from(e.target.files || []);

    if (archivos.length === 0) {
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    for (const archivo of archivos) {
      if (!allowedTypes.includes(archivo.type)) {
        mostrarError('Formato de imagen no válido. Usa JPG, PNG, GIF o WEBP.');
        fotoInput.value = '';
        return;
      }
      if (archivo.size > maxSize) {
        mostrarError('Alguna imagen supera el máximo de 5MB.');
        fotoInput.value = '';
        return;
      }
    }

    if (fotoPreviewList && archivos.length > 0) {
      fotoPreview.style.display = 'block';
      archivos.forEach((archivo) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const wrapper = document.createElement('div');
          wrapper.style.width = '100px';
          wrapper.style.height = '100px';
          wrapper.style.border = '1px solid #ddd';
          wrapper.style.borderRadius = '6px';
          wrapper.style.overflow = 'hidden';
          wrapper.style.position = 'relative';

          const img = document.createElement('img');
          img.src = ev.target.result;
          img.alt = archivo.name;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';

          wrapper.appendChild(img);
          fotoPreviewList.appendChild(wrapper);
        };
        reader.readAsDataURL(archivo);
      });
    }
  });

  btnRemoveFoto.addEventListener('click', function() {
    if (fotoInput) {
      fotoInput.value = '';
    }
    limpiarVistaPreviaSeleccion();
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
        limpiarVistaPreviaSeleccion();
        renderGaleriaActual([]);
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
  const registrosPorPagina = 10;
  let filtroEstado = '';
  let filtroEspecie = '';
  let filtroGeneral = '';

  function filtrarAnimalesPorEstado(estado) {
    filtroEstado = estado;
    aplicarFiltros();
  }

  function filtrarAnimalesPorEspecie(especie) {
    filtroEspecie = especie;
    aplicarFiltros();
  }

  function filtrarAnimalesPorTexto(texto) {
    filtroGeneral = texto.toLowerCase();
    aplicarFiltros();
  }

  function aplicarFiltros() {
    try {
      if (!todosLosAnimales || !Array.isArray(todosLosAnimales)) {
        todosLosAnimales = [];
      }

      animalesFiltrados = todosLosAnimales.filter((animal) => {
        const coincideEstado = !filtroEstado || animal.estado === filtroEstado;
        const coincideEspecie = !filtroEspecie || animal.especie === filtroEspecie;
        const coincideTexto =
          !filtroGeneral ||
          (animal.nombre || '').toLowerCase().includes(filtroGeneral) ||
          (animal.especie || '').toLowerCase().includes(filtroGeneral) ||
          (animal.raza || '').toLowerCase().includes(filtroGeneral) ||
          String(animal.idAnimal || '').includes(filtroGeneral);
        return coincideEstado && coincideEspecie && coincideTexto;
      });

      paginaActual = 1;
      mostrarAnimales();
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
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
        actualizarPaginacion();
        return;
      }

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

      actualizarPaginacion();

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

  function actualizarPaginacion() {
    const contenedor = document.querySelector('.table-container-paginada');
    if (!contenedor) return;

    const paginacionExistente = contenedor.querySelector('.paginacion');
    if (paginacionExistente) {
      paginacionExistente.remove();
    }

    const totalRegistros = animalesFiltrados.length;
    const totalPaginas = Math.max(Math.ceil(totalRegistros / registrosPorPagina), 1);

    const paginacion = document.createElement('div');
    paginacion.className = 'paginacion';
    paginacion.innerHTML = `
      <button class="btn btn-secondary" ${paginaActual === 1 ? 'disabled' : ''} onclick="paginaAnterior()">«</button>
      <span>Página ${paginaActual} de ${totalPaginas} (${totalRegistros} registros)</span>
      <button class="btn btn-secondary" ${paginaActual === totalPaginas ? 'disabled' : ''} onclick="paginaSiguiente()">»</button>
    `;

    contenedor.appendChild(paginacion);
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
      filtroEstado = filtroEstadoSelect ? filtroEstadoSelect.value : '';
      filtroEspecie = filtroEspecieSelect ? filtroEspecieSelect.value : '';
      filtroGeneral = filtroGeneralInput ? filtroGeneralInput.value.toLowerCase() : '';
      aplicarFiltros();
      
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
      const tableContainer = document.querySelector('.table-container-paginada');
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
      const tableContainer = document.querySelector('.table-container-paginada');
      if (tableContainer) {
        tableContainer.scrollTop = 0;
      }
    }
  };

  // Configurar filtro por estado
  if (filtroEstadoSelect) {
    filtroEstadoSelect.addEventListener('change', (e) => filtrarAnimalesPorEstado(e.target.value));
  }
  if (filtroEspecieSelect) {
    filtroEspecieSelect.addEventListener('change', (e) => filtrarAnimalesPorEspecie(e.target.value));
  }
  if (filtroGeneralInput) {
    filtroGeneralInput.addEventListener('input', (e) => filtrarAnimalesPorTexto(e.target.value));
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

  // Exponer utilidades para funciones globales
  window.renderGaleriaActual = renderGaleriaActual;
  window.limpiarVistaPreviaSeleccion = limpiarVistaPreviaSeleccion;
  window.normalizarRutaImagen = normalizarRutaImagen;
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
    const fotoPreviewList = document.getElementById('foto-preview-list');
    
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
    
    if (typeof window.limpiarVistaPreviaSeleccion === 'function') {
      window.limpiarVistaPreviaSeleccion();
    } else {
      if (fotoPreviewList) fotoPreviewList.innerHTML = '';
      if (fotoPreview) fotoPreview.style.display = 'none';
    }

    const inputFotos = document.getElementById('foto');
    if (inputFotos) {
      inputFotos.value = '';
    }

    const rutasGaleria = Array.isArray(animal.fotos) && animal.fotos.length > 0
      ? animal.fotos.map((f) => f.ruta)
      : (animal.foto ? [animal.foto] : []);

    if (typeof window.renderGaleriaActual === 'function') {
      window.renderGaleriaActual(rutasGaleria);
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
