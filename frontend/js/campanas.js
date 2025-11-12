document.addEventListener('DOMContentLoaded', () => {
  const estado = document.getElementById('estadoCampanas');
  const grid = document.getElementById('gridCampanas');
  const modal = document.getElementById('campanaModal');
  const modalBody = document.getElementById('modalCampanaBody');
  const modalTitulo = document.getElementById('modalCampanaTitulo');
  const btnCerrarModal = document.getElementById('btnCerrarCampana');

  let campanas = [];
  let campanaActiva = null;

  inicializar();

  async function inicializar() {
    await cargarCampanas();
    manejarEventoCerrarModal();
  }

  async function cargarCampanas() {
    try {
      mostrarEstado('Cargando campañas...', 'info');
      campanas = await api.getCampanasPublicas();

      if (!campanas || campanas.length === 0) {
        mostrarEstado('No hay campañas publicadas en este momento.', 'info');
        grid.innerHTML = '';
        return;
      }

      ocultarEstado();
      renderCampanas();
      abrirCampanaPorParametro();
    } catch (error) {
      console.error('Error al cargar campañas:', error);
      mostrarEstado(error.message || 'No se pudieron cargar las campañas.', 'error');
    }
  }

  function abrirCampanaPorParametro() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'), 10);
    if (Number.isNaN(id)) return;
    const campana = campanas.find((item) => item.idCampaña === id);
    if (campana) {
      abrirModalCampana(campana);
    }
  }

  function renderCampanas() {
    grid.innerHTML = campanas
      .map((campana) => crearPlantillaCampana(campana))
      .join('');

    grid.querySelectorAll('[data-accion="detalle"]').forEach((boton) => {
      boton.addEventListener('click', () => {
        const id = parseInt(boton.dataset.id, 10);
        const campana = campanas.find((item) => item.idCampaña === id);
        if (campana) abrirModalCampana(campana);
      });
    });
  }

  function crearPlantillaCampana(campana) {
    const principal = obtenerImagenPrincipal(campana);
    const fechas = formatearRangoFechas(campana.fechaInicio, campana.fechaFin);
    const resumen = resumirTexto(campana.descripcion || '', 180);

    return `
      <article class="campana-card">
        <div class="campana-image">
          <img src="${principal}" alt="Imagen de la campaña ${escaparHtml(campana.titulo)}" onerror="this.src='images/logo.png'">
        </div>
        <div class="campana-body">
          <span class="campana-fechas">${fechas}</span>
          <h3>${escaparHtml(campana.titulo)}</h3>
          <p>${resumen}</p>
          <button type="button" class="btn btn-secondary" data-accion="detalle" data-id="${campana.idCampaña}">
            Ver detalles
          </button>
        </div>
      </article>
    `;
  }

  function abrirModalCampana(campana) {
    campanaActiva = campana;
    modalTitulo.textContent = campana.titulo;
    modalBody.innerHTML = crearContenidoModal(campana);
    modal.style.display = 'block';
    inicializarMiniaturas();
  }

  function crearContenidoModal(campana) {
    const principal = obtenerImagenPrincipal(campana);
    const fechas = formatearRangoFechas(campana.fechaInicio, campana.fechaFin);
    const descripcion = campana.descripcion
      ? `<p class="modal-campana-descripcion">${escaparHtml(campana.descripcion).replace(/\n/g, '<br>')}</p>`
      : '<p class="modal-campana-descripcion">Esta campaña no tiene una descripción detallada.</p>';

    const listaFotos = (campana.fotos || []).map((foto, indice) => `
      <button type="button"
              class="modal-thumb ${foto.esPrincipal ? 'activa' : ''}"
              data-ruta="/${foto.ruta}"
              data-indice="${indice}">
        <img src="/${foto.ruta}" alt="Imagen alternativa de la campaña">
      </button>
    `).join('');

    const galeria = listaFotos
      ? `<div class="modal-campana-thumbs">${listaFotos}</div>`
      : '';

    return `
      <div class="modal-campana-main">
        <div class="modal-campana-imagen">
          <img id="modalCampanaImagen" src="${principal}" alt="Imagen principal de la campaña" onerror="this.src='images/logo.png'">
        </div>
        ${galeria}
      </div>
      <div class="modal-campana-info">
        <p class="modal-campana-fechas">${fechas}</p>
        ${descripcion}
      </div>
    `;
  }

  function inicializarMiniaturas() {
    const imagenPrincipal = document.getElementById('modalCampanaImagen');
    const miniaturas = modalBody.querySelectorAll('.modal-thumb');
    if (!imagenPrincipal || miniaturas.length === 0) return;

    miniaturas.forEach((boton) => {
      boton.addEventListener('click', () => {
        miniaturas.forEach((thumb) => thumb.classList.remove('activa'));
        boton.classList.add('activa');
        const ruta = boton.dataset.ruta;
        imagenPrincipal.src = ruta;
      });
    });
  }

  function manejarEventoCerrarModal() {
    btnCerrarModal?.addEventListener('click', cerrarModal);
    modal?.addEventListener('click', (event) => {
      if (event.target === modal) {
        cerrarModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal?.style.display === 'block') {
        cerrarModal();
      }
    });
  }

  function cerrarModal() {
    modal.style.display = 'none';
    campanaActiva = null;
  }

  function mostrarEstado(texto, tipo) {
    if (!estado) return;
    estado.textContent = texto;
    estado.classList.remove('info-message', 'error-message', 'success-message');
    const clase = tipo === 'error' ? 'error-message' : tipo === 'success' ? 'success-message' : 'info-message';
    estado.classList.add(clase);
    estado.style.display = 'block';
  }

  function ocultarEstado() {
    if (estado) {
      estado.style.display = 'none';
    }
  }

  function obtenerImagenPrincipal(campana) {
    if (campana && campana.fotoPrincipal) {
      return `/${campana.fotoPrincipal}`;
    }
    const primera = campana?.fotos?.[0]?.ruta;
    if (primera) return `/${primera}`;
    return 'images/logo.png';
  }

  function formatearRangoFechas(desde, hasta) {
    const inicio = formatearFecha(desde);
    const fin = formatearFecha(hasta);

    if (inicio && fin) {
      return `Del ${inicio} al ${fin}`;
    }
    if (inicio) return `Desde el ${inicio}`;
    if (fin) return `Hasta el ${fin}`;
    return 'Fechas a confirmar';
  }

  function formatearFecha(valor) {
    if (!valor) return '';
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return '';
    return fecha.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function resumirTexto(texto, max = 140) {
    const limpio = texto.replace(/\s+/g, ' ').trim();
    if (limpio.length <= max) return escaparHtml(limpio);
    return `${escaparHtml(limpio.substring(0, max))}…`;
  }

  function escaparHtml(texto) {
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


