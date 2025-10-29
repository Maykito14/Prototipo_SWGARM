document.addEventListener('DOMContentLoaded', () => {
  requireAdmin();

  const form = document.getElementById('campanaForm');
  const tablaCampanas = document.getElementById('tablaCampanas');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');
  const modalCampana = document.getElementById('modalCampana');
  const modalForm = document.getElementById('modalCampanaForm');
  const descripcionInput = document.getElementById('descripcion');
  const descripcionCount = document.getElementById('descripcion-count');
  const modalDescripcion = document.getElementById('modalDescripcion');
  const modalDescripcionCount = document.getElementById('modal-descripcion-count');
  let campanaActual = null;

  // Cargar campañas al iniciar
  cargarCampanas();

  // Contador de caracteres para descripción
  descripcionInput.addEventListener('input', () => {
    const length = descripcionInput.value.length;
    descripcionCount.textContent = `${length} / 500 caracteres`;
  });

  modalDescripcion.addEventListener('input', () => {
    const length = modalDescripcion.value.length;
    modalDescripcionCount.textContent = `${length} / 500 caracteres`;
  });

  // Manejar envío del formulario de creación
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    limpiarMensajes();
    limpiarErrores();

    if (!validarFormulario(form)) {
      return;
    }

    try {
      const formData = new FormData(form);
      const campanaData = {
        titulo: formData.get('titulo').trim(),
        descripcion: formData.get('descripcion').trim() || null,
        responsable: formData.get('responsable').trim() || null,
        fecha: formData.get('fecha') || null
      };

      const response = await api.crearCampana(campanaData);
      
      mostrarExito(`Campaña "${response.campana.titulo}" registrada exitosamente con ID: ${response.campana.idCampaña}`);
      
      form.reset();
      descripcionCount.textContent = '0 / 500 caracteres';
      
      cargarCampanas();

    } catch (error) {
      console.error('Error al registrar campaña:', error);
      
      if (error.message.includes('título es obligatorio') || error.message.includes('obligatorio')) {
        mostrarError('Por favor, complete el campo título (obligatorio)');
        mostrarErrorCampo('titulo', 'Este campo es obligatorio');
      } else if (error.message.includes('longitud') || error.message.includes('caracteres')) {
        mostrarError(error.message);
      } else {
        mostrarError(error.message || 'Error al registrar la campaña. Por favor, intenta nuevamente.');
      }
    }
  });

  // Manejar envío del formulario de edición
  modalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    limpiarMensajes();
    limpiarErroresModal();

    if (!validarFormulario(modalForm)) {
      return;
    }

    try {
      const formData = new FormData(modalForm);
      const campanaData = {
        titulo: formData.get('titulo').trim(),
        descripcion: formData.get('descripcion').trim() || null,
        responsable: formData.get('responsable').trim() || null,
        fecha: formData.get('fecha') || null
      };

      await api.actualizarCampana(campanaActual.idCampaña, campanaData);
      
      mostrarExito('Campaña actualizada exitosamente');
      cerrarModalCampana();
      cargarCampanas();

    } catch (error) {
      console.error('Error al actualizar campaña:', error);
      mostrarError(error.message || 'Error al actualizar la campaña');
    }
  });

  // Función para validar formulario
  function validarFormulario(formElement) {
    let esValido = true;
    const tituloInput = formElement.querySelector('#titulo, #modalTituloInput');
    const tituloError = formElement.querySelector('#titulo-error, #modal-titulo-error');

    // Validar título
    const titulo = tituloInput.value.trim();
    if (!titulo) {
      mostrarErrorCampo(tituloError.id, 'El título es obligatorio', formElement);
      esValido = false;
    } else if (titulo.length < 3) {
      mostrarErrorCampo(tituloError.id, 'El título debe tener al menos 3 caracteres', formElement);
      esValido = false;
    } else if (titulo.length > 45) {
      mostrarErrorCampo(tituloError.id, 'El título no puede exceder 45 caracteres', formElement);
      esValido = false;
    } else {
      limpiarErrorCampo(tituloError.id, formElement);
    }

    return esValido;
  }

  // Función para cargar campañas en la tabla
  async function cargarCampanas() {
    try {
      const campanas = await api.getCampanas();
      const tbody = tablaCampanas.querySelector('tbody');
      
      if (!campanas || campanas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No hay campañas registradas</td></tr>';
        return;
      }

      tbody.innerHTML = campanas.map(campana => {
        const fechaCreacion = campana.fechaCreacion 
          ? new Date(campana.fechaCreacion).toLocaleDateString('es-ES') 
          : '-';
        const fechaEvento = campana.fecha 
          ? new Date(campana.fecha).toLocaleDateString('es-ES') 
          : '-';
        const descripcion = campana.descripcion 
          ? (campana.descripcion.length > 50 ? campana.descripcion.substring(0, 50) + '...' : campana.descripcion)
          : '-';
        
        return `
          <tr>
            <td>${campana.idCampaña}</td>
            <td>${escapeHtml(campana.titulo)}</td>
            <td>${escapeHtml(descripcion)}</td>
            <td>${escapeHtml(campana.responsable || '-')}</td>
            <td>${fechaEvento}</td>
            <td>${fechaCreacion}</td>
            <td>
              <button class="btn-table ver" onclick="verCampana(${campana.idCampaña})">👁️</button>
              <button class="btn-table editar" onclick="editarCampana(${campana.idCampaña})">✏️</button>
              <button class="btn-table eliminar" onclick="eliminarCampana(${campana.idCampaña})">🗑️</button>
            </td>
          </tr>
        `;
      }).join('');
    } catch (error) {
      console.error('Error al cargar campañas:', error);
      mostrarError('Error al cargar la lista de campañas');
    }
  }

  window.verCampana = async function(id) {
    try {
      const campana = await api.getCampana(id);
      alert(`Campaña:\n\nTítulo: ${campana.titulo}\nDescripción: ${campana.descripcion || 'Sin descripción'}\nResponsable: ${campana.responsable || 'No especificado'}\nFecha: ${campana.fecha ? new Date(campana.fecha).toLocaleDateString('es-ES') : 'No especificada'}\nFecha Creación: ${campana.fechaCreacion ? new Date(campana.fechaCreacion).toLocaleDateString('es-ES') : '-'}`);
    } catch (error) {
      alert('Error al obtener información de la campaña');
    }
  };

  window.editarCampana = async function(id) {
    try {
      campanaActual = await api.getCampana(id);
      
      document.getElementById('modalTitulo').textContent = 'Editar Campaña';
      document.getElementById('modalTituloInput').value = campanaActual.titulo;
      document.getElementById('modalDescripcion').value = campanaActual.descripcion || '';
      document.getElementById('modalResponsable').value = campanaActual.responsable || '';
      document.getElementById('modalFecha').value = campanaActual.fecha ? new Date(campanaActual.fecha).toISOString().split('T')[0] : '';
      
      const length = (campanaActual.descripcion || '').length;
      modalDescripcionCount.textContent = `${length} / 500 caracteres`;
      
      modalCampana.style.display = 'block';
    } catch (error) {
      alert('Error al cargar información de la campaña');
    }
  };

  window.eliminarCampana = async function(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta campaña? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await api.eliminarCampana(id);
      mostrarExito('Campaña eliminada exitosamente');
      cargarCampanas();
    } catch (error) {
      mostrarError(error.message || 'Error al eliminar la campaña');
    }
  };

  window.cerrarModalCampana = function() {
    modalCampana.style.display = 'none';
    modalForm.reset();
    campanaActual = null;
    limpiarErroresModal();
  };

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

  function mostrarErrorCampo(errorId, mensaje, formElement = form) {
    const errorSpan = formElement.querySelector(`#${errorId}`);
    if (errorSpan) {
      errorSpan.textContent = mensaje;
      errorSpan.style.display = 'block';
    }
  }

  function limpiarErrorCampo(errorId, formElement = form) {
    const errorSpan = formElement.querySelector(`#${errorId}`);
    if (errorSpan) {
      errorSpan.textContent = '';
      errorSpan.style.display = 'none';
    }
  }

  function limpiarErrores() {
    limpiarErrorCampo('titulo-error');
  }

  function limpiarErroresModal() {
    limpiarErrorCampo('modal-titulo-error', modalForm);
  }

  function escapeHtml(text) {
    if (text == null) return '';
    return text.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});

