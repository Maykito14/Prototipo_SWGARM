/* eslint-disable no-alert */
document.addEventListener('DOMContentLoaded', () => {
  requireAdmin();

  const form = document.getElementById('campanaForm');
  const tablaCampanas = document.getElementById('tablaCampanas');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');
  const modalCampana = document.getElementById('modalCampana');
  const modalForm = document.getElementById('modalCampanaForm');
  const previewCampana = document.getElementById('previewCampana');
  const modalPreview = document.getElementById('modalPreview');
  const galeriaCampana = document.getElementById('galeriaCampana');
  const descripcionInput = document.getElementById('descripcion');
  const descripcionCount = document.getElementById('descripcion-count');
  const modalDescripcion = document.getElementById('modalDescripcion');
  const modalDescripcionCount = document.getElementById('modal-descripcion-count');
  const fotosCampanaInput = document.getElementById('fotosCampana');
  const modalFotosInput = document.getElementById('modalFotos');
  const btnResetForm = document.getElementById('btnResetForm');

  let campanas = [];
  let campanaActual = null;

  inicializar();

  function inicializar() {
    cargarCampanas();
    registrarListeners();
  }

  function registrarListeners() {
    if (descripcionInput && descripcionCount) {
      descripcionInput.addEventListener('input', () =>
        actualizarContador(descripcionInput, descripcionCount, 5000)
      );
    }

    if (modalDescripcion && modalDescripcionCount) {
      modalDescripcion.addEventListener('input', () =>
        actualizarContador(modalDescripcion, modalDescripcionCount, 5000)
      );
    }

    if (fotosCampanaInput && previewCampana) {
      fotosCampanaInput.addEventListener('change', (event) => {
        renderPreviewArchivos(event.target.files, previewCampana);
      });
    }

    if (modalFotosInput && modalPreview) {
      modalFotosInput.addEventListener('change', (event) => {
        renderPreviewArchivos(event.target.files, modalPreview);
      });
    }

    if (btnResetForm) {
      btnResetForm.addEventListener('click', () => {
        limpiarPreview(previewCampana);
        actualizarContador(descripcionInput, descripcionCount, 5000);
      });
    }

    if (form) {
      form.addEventListener('submit', manejarSubmitCrear);
    }

    if (modalForm) {
      modalForm.addEventListener('submit', manejarSubmitEditar);
    }

    if (tablaCampanas) {
      tablaCampanas.addEventListener('click', manejarAccionesTabla);
    }

    if (galeriaCampana) {
      galeriaCampana.addEventListener('click', manejarAccionesGaleria);
    }
  }

  function actualizarContador(textarea, contador, max) {
    if (!textarea || !contador) return;
    const longitud = textarea.value.length;
    contador.textContent = `${longitud} / ${max} caracteres`;
  }

  function renderPreviewArchivos(files, contenedor) {
    if (!contenedor) return;
    limpiarPreview(contenedor);
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.innerHTML = `
          <img src="${event.target.result}" alt="${file.name}">
          <span class="preview-name">${file.name}</span>
        `;
        contenedor.appendChild(item);
      };
      reader.readAsDataURL(file);
    });
  }

  function limpiarPreview(contenedor) {
    if (contenedor) {
      contenedor.innerHTML = '';
    }
  }

  async function manejarSubmitCrear(event) {
    event.preventDefault();
    limpiarMensajes();

    if (!validarFormulario(form, 'titulo', 'titulo-error')) return;

    try {
      const formData = prepararFormDataCampana(form, {
        visible: form.querySelector('#visible')?.checked,
      });

      const respuesta = await api.crearCampana(formData);

      mostrarExito(`Campaña "${respuesta.campana.titulo}" registrada exitosamente.`);
      form.reset();
      limpiarPreview(previewCampana);
      actualizarContador(descripcionInput, descripcionCount, 5000);
      await cargarCampanas();
    } catch (error) {
      console.error('Error al registrar campaña:', error);
      mostrarError(error.message || 'Error al registrar la campaña.');
    }
  }

  async function manejarSubmitEditar(event) {
    event.preventDefault();
    limpiarMensajes();

    if (!campanaActual) {
      mostrarError('No hay una campaña seleccionada.');
      return;
    }

    if (!validarFormulario(modalForm, 'modalTituloInput', 'modal-titulo-error')) return;

    try {
      const formData = prepararFormDataCampana(modalForm, {
        visible: modalForm.querySelector('#modalVisible')?.checked,
      });

      await api.actualizarCampana(campanaActual.idCampaña, formData);

      mostrarExito('Campaña actualizada exitosamente.');
      modalForm.reset();
      limpiarPreview(modalPreview);
      cerrarModalCampana();
      await cargarCampanas();
    } catch (error) {
      console.error('Error al actualizar campaña:', error);
      mostrarError(error.message || 'Error al actualizar la campaña.');
    }
  }

  function prepararFormDataCampana(formElement, opciones = {}) {
    const formData = new FormData(formElement);

    const camposTexto = ['titulo', 'descripcion', 'responsable'];
    camposTexto.forEach((campo) => {
      if (formData.has(campo)) {
        const valor = formData.get(campo);
        formData.set(campo, valor ? valor.toString().trim() : '');
      }
    });

    if (formData.has('fecha') && !formData.has('fechaInicio')) {
      formData.set('fechaInicio', formData.get('fecha'));
      formData.delete('fecha');
    }

    const visible = opciones.visible === undefined ? true : !!opciones.visible;
    formData.set('visible', visible ? '1' : '0');

    return formData;
  }

  function validarFormulario(formElement, inputId, errorId) {
    const input = formElement.querySelector(`#${inputId}`);
    const errorSpan = formElement.querySelector(`#${errorId}`);
    if (!input) return false;

    const valor = input.value.trim();
    if (!valor) {
      if (errorSpan) {
        errorSpan.textContent = 'El título es obligatorio';
        errorSpan.style.display = 'block';
      }
      return false;
    }

    if (valor.length < 3) {
      if (errorSpan) {
        errorSpan.textContent = 'El título debe tener al menos 3 caracteres';
        errorSpan.style.display = 'block';
      }
      return false;
    }

    if (valor.length > 255) {
      if (errorSpan) {
        errorSpan.textContent = 'El título no puede exceder 255 caracteres';
        errorSpan.style.display = 'block';
      }
      return false;
    }

    if (errorSpan) {
      errorSpan.textContent = '';
      errorSpan.style.display = 'none';
    }
    return true;
  }

  async function cargarCampanas() {
    try {
      campanas = await api.getCampanas();
      renderCampanas();
    } catch (error) {
      console.error('Error al cargar campañas:', error);
      mostrarError('Error al cargar la lista de campañas.');
    }
  }

  function renderCampanas() {
    const tbody = tablaCampanas?.querySelector('tbody');
    if (!tbody) return;

    if (!campanas || campanas.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center; padding:20px;">No hay campañas registradas</td></tr>';
      return;
    }

    tbody.innerHTML = campanas
      .map((campana) => {
        const fechaCreacion = formatearFecha(campana.fechaCreacion);
        const fechaDesde = formatearFecha(campana.fechaInicio);
        const fechaHasta = formatearFecha(campana.fechaFin);
        const estadoBadge = campana.visible
          ? '<span class="status aprobada">Visible</span>'
          : '<span class="status rechazada">Oculta</span>';

        return `
          <tr data-id="${campana.idCampaña}">
            <td>${campana.idCampaña}</td>
            <td>${escapeHtml(campana.titulo)}</td>
            <td>
              <div class="tabla-fechas">
                <strong>Desde:</strong> ${fechaDesde || '—'}<br>
                <strong>Hasta:</strong> ${fechaHasta || '—'}
              </div>
            </td>
            <td>${estadoBadge}</td>
            <td>${fechaCreacion || '—'}</td>
            <td class="tabla-acciones">
              <button class="btn-table ver" data-accion="ver" title="Ver publicación">🌐</button>
              <button class="btn-table editar" data-accion="editar" title="Editar">✏️</button>
              <button class="btn-table toggle" data-accion="toggle" title="${
                campana.visible ? 'Ocultar publicación' : 'Mostrar publicación'
              }">${campana.visible ? '🙈' : '👁️'}</button>
              <button class="btn-table eliminar" data-accion="eliminar" title="Eliminar">🗑️</button>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  async function manejarAccionesTabla(event) {
    const boton = event.target.closest('button[data-accion]');
    if (!boton) return;

    const fila = boton.closest('tr[data-id]');
    if (!fila) return;
    const id = parseInt(fila.dataset.id, 10);
    if (Number.isNaN(id)) return;

    const accion = boton.dataset.accion;
    switch (accion) {
      case 'ver':
        abrirCampanaPublica(id);
        break;
      case 'editar':
        editarCampana(id);
        break;
      case 'toggle':
        cambiarVisibilidad(id);
        break;
      case 'eliminar':
        eliminarCampana(id);
        break;
      default:
        break;
    }
  }

  function abrirCampanaPublica(id) {
    window.open(`campanas.html?id=${id}`, '_blank');
  }

  async function editarCampana(id) {
    try {
      campanaActual = await api.getCampana(id);
      if (!campanaActual) {
        mostrarError('No se pudo cargar la campaña seleccionada.');
        return;
      }

      document.getElementById('modalTitulo').textContent = `Editar campaña #${campanaActual.idCampaña}`;
      document.getElementById('modalTituloInput').value = campanaActual.titulo || '';
      document.getElementById('modalDescripcion').value = campanaActual.descripcion || '';
      document.getElementById('modalResponsable').value = campanaActual.responsable || '';
      document.getElementById('modalFechaInicio').value = campanaActual.fechaInicio || '';
      document.getElementById('modalFechaFin').value = campanaActual.fechaFin || '';
      document.getElementById('modalVisible').checked = !!campanaActual.visible;
      actualizarContador(modalDescripcion, modalDescripcionCount, 5000);
      limpiarPreview(modalPreview);
      renderGaleriaCampana(campanaActual);

      modalCampana.style.display = 'block';
    } catch (error) {
      console.error('Error al cargar campaña:', error);
      mostrarError('No se pudo cargar la campaña seleccionada.');
    }
  }

  async function cambiarVisibilidad(id) {
    const campana = campanas.find((item) => item.idCampaña === id);
    if (!campana) return;

    try {
      const respuesta = await api.cambiarVisibilidadCampana(id, !campana.visible);
      mostrarExito(respuesta.message || 'Visibilidad actualizada.');
      await cargarCampanas();

      if (campanaActual && campanaActual.idCampaña === id) {
        campanaActual = await api.getCampana(id);
        document.getElementById('modalVisible').checked = !!campanaActual.visible;
      }
    } catch (error) {
      console.error('Error al cambiar visibilidad:', error);
      mostrarError(error.message || 'Error al cambiar la visibilidad.');
    }
  }

  async function eliminarCampana(id) {
    if (!confirm('¿Eliminar esta campaña? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const respuesta = await api.eliminarCampana(id);
      mostrarExito(respuesta.message || 'Campaña eliminada.');
      await cargarCampanas();
      if (campanaActual && campanaActual.idCampaña === id) {
        cerrarModalCampana();
      }
    } catch (error) {
      console.error('Error al eliminar campaña:', error);
      mostrarError(error.message || 'Error al eliminar la campaña.');
    }
  }

  function renderGaleriaCampana(campana) {
    if (!galeriaCampana) return;
    galeriaCampana.innerHTML = '';

    const fotos = campana.fotos || [];
    if (fotos.length === 0) {
      galeriaCampana.innerHTML = '<p class="gallery-empty">Esta campaña no tiene imágenes registradas.</p>';
      return;
    }

    fotos.forEach((foto) => {
      const item = document.createElement('div');
      item.className = `gallery-item${foto.esPrincipal ? ' principal' : ''}`;
      item.dataset.idFoto = foto.idFoto;
      item.dataset.ruta = foto.ruta;
      item.innerHTML = `
        <img src="/${foto.ruta}" alt="Foto de campaña">
        <div class="gallery-actions">
          <button type="button" class="btn-icon principal" data-action="principal" title="Establecer como portada">⭐</button>
          <button type="button" class="btn-icon eliminar" data-action="eliminar" title="Eliminar foto">🗑️</button>
        </div>
        ${foto.esPrincipal ? '<span class="badge badge-principal">Portada</span>' : ''}
      `;
      galeriaCampana.appendChild(item);
    });
  }

  async function manejarAccionesGaleria(event) {
    const boton = event.target.closest('button[data-action]');
    if (!boton || !campanaActual) return;

    const item = boton.closest('.gallery-item');
    if (!item) return;

    const idFoto = parseInt(item.dataset.idFoto, 10);
    const ruta = item.dataset.ruta;
    if (Number.isNaN(idFoto)) return;

    const accion = boton.dataset.action;
    switch (accion) {
      case 'principal':
        await establecerFotoPrincipal(idFoto, ruta);
        break;
      case 'eliminar':
        await eliminarFotoCampana(idFoto);
        break;
      default:
        break;
    }
  }

  async function establecerFotoPrincipal(idFoto, ruta) {
    try {
      await api.establecerFotoPrincipalCampana(campanaActual.idCampaña, ruta);
      campanaActual = await api.getCampana(campanaActual.idCampaña);
      renderGaleriaCampana(campanaActual);
      mostrarExito('Foto principal actualizada.');
      await cargarCampanas();
    } catch (error) {
      console.error('Error al establecer foto principal:', error);
      mostrarError(error.message || 'Error al establecer la foto principal.');
    }
  }

  async function eliminarFotoCampana(idFoto) {
    if (!confirm('¿Eliminar esta imagen de la campaña?')) {
      return;
    }

    try {
      await api.eliminarFotoCampana(campanaActual.idCampaña, idFoto);
      campanaActual = await api.getCampana(campanaActual.idCampaña);
      renderGaleriaCampana(campanaActual);
      mostrarExito('Foto eliminada.');
      await cargarCampanas();
    } catch (error) {
      console.error('Error al eliminar foto:', error);
      mostrarError(error.message || 'Error al eliminar la foto.');
    }
  }

  function cerrarModalCampana() {
    modalCampana.style.display = 'none';
    modalForm.reset();
    limpiarPreview(modalPreview);
    galeriaCampana.innerHTML = '';
    campanaActual = null;
  }

  function mostrarExito(mensaje) {
    if (!successMessage) return;
    successMessage.textContent = mensaje;
    successMessage.style.display = 'block';
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 5000);
  }

  function mostrarError(mensaje) {
    if (!errorMessage) return;
    errorMessage.textContent = mensaje;
    errorMessage.style.display = 'block';
  }

  function limpiarMensajes() {
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
  }

  function formatearFecha(valor) {
    if (!valor) return '';
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return valor;
    return fecha.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  function escapeHtml(texto) {
    if (texto == null) return '';
    return texto
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
