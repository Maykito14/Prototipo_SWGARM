const galeriaAnimales = {};
let modalGaleria = null;
let estadoGaleria = { id: null, fotos: [], indice: 0, nombre: '' };

document.addEventListener('DOMContentLoaded', async () => {
  inicializarModalGaleria();
  await cargarAnimales();
  
  const buscador = document.getElementById('buscador');
  const filtroEspecie = document.getElementById('filtroEspecie');
  const filtroEdad = document.getElementById('filtroEdad');
  const filtroEstado = document.getElementById('filtroEstado');
  const btnLimpiar = document.getElementById('btnLimpiar');
  
  buscador.addEventListener('input', aplicarFiltros);
  filtroEspecie.addEventListener('change', aplicarFiltros);
  filtroEdad.addEventListener('change', aplicarFiltros);
  filtroEstado.addEventListener('change', aplicarFiltros);
  btnLimpiar.addEventListener('click', limpiarFiltros);
});

let todosLosAnimales = [];

function normalizarRutaImagen(ruta) {
  if (!ruta) return '';
  if (ruta.startsWith('http') || ruta.startsWith('data:')) return ruta;
  const limpia = ruta.replace(/^\/+/, '').replace(/\\/g, '/');
  return `/${limpia}`;
}

function inicializarModalGaleria() {
  if (modalGaleria) return;

  modalGaleria = document.createElement('div');
  modalGaleria.id = 'galeriaModal';
  modalGaleria.className = 'gallery-modal';
  modalGaleria.innerHTML = `
    <div class="gallery-backdrop" data-action="close"></div>
    <div class="gallery-content" role="dialog" aria-modal="true" aria-labelledby="galeriaTitulo">
      <button class="gallery-close" data-action="close" aria-label="Cerrar galería">&times;</button>
      <div class="gallery-main">
        <button class="gallery-nav prev" data-action="prev" aria-label="Foto anterior">&#10094;</button>
        <img id="galeriaImagen" src="" alt="Galería de animal">
        <button class="gallery-nav next" data-action="next" aria-label="Foto siguiente">&#10095;</button>
      </div>
      <div class="gallery-caption">
        <span id="galeriaTitulo"></span>
        <span id="galeriaIndice"></span>
      </div>
      <div class="gallery-thumbs" id="galeriaThumbs"></div>
    </div>
  `;

  modalGaleria.addEventListener('click', manejarEventosModal);
  document.addEventListener('keydown', manejarTeclasGaleria);
  document.body.appendChild(modalGaleria);
}

function manejarEventosModal(evento) {
  const accion = evento.target.dataset?.action;
  if (!accion) return;

  if (accion === 'close') {
    cerrarGaleria();
  }
  if (accion === 'prev') {
    cambiarSlide(-1);
  }
  if (accion === 'next') {
    cambiarSlide(1);
  }
  if (accion === 'thumb') {
    const index = Number(evento.target.dataset.index || 0);
    if (!Number.isNaN(index)) {
      estadoGaleria.indice = index;
      actualizarModalGaleria();
    }
  }
}

function manejarTeclasGaleria(evento) {
  if (!modalGaleria || !modalGaleria.classList.contains('is-visible')) return;

  if (evento.key === 'Escape') {
    cerrarGaleria();
  } else if (evento.key === 'ArrowLeft') {
    evento.preventDefault();
    cambiarSlide(-1);
  } else if (evento.key === 'ArrowRight') {
    evento.preventDefault();
    cambiarSlide(1);
  }
}

function abrirGaleria(animalId, indice = 0) {
  const datos = galeriaAnimales[animalId];
  if (!datos || !datos.fotos || datos.fotos.length === 0) return;

  estadoGaleria = {
    id: animalId,
    fotos: datos.fotos,
    indice: Math.max(0, Math.min(indice, datos.fotos.length - 1)),
    nombre: datos.nombre || 'Galería'
  };

  actualizarModalGaleria();
  modalGaleria.classList.add('is-visible');
  document.body.classList.add('no-scroll');
}

function cerrarGaleria() {
  if (!modalGaleria) return;
  modalGaleria.classList.remove('is-visible');
  document.body.classList.remove('no-scroll');
}

function cambiarSlide(delta) {
  if (!estadoGaleria.fotos.length) return;
  const total = estadoGaleria.fotos.length;
  estadoGaleria.indice = (estadoGaleria.indice + delta + total) % total;
  actualizarModalGaleria();
}

function actualizarModalGaleria() {
  if (!modalGaleria || !estadoGaleria.fotos.length) return;

  const imagen = modalGaleria.querySelector('#galeriaImagen');
  const titulo = modalGaleria.querySelector('#galeriaTitulo');
  const indice = modalGaleria.querySelector('#galeriaIndice');
  const thumbs = modalGaleria.querySelector('#galeriaThumbs');
  const fotoActual = normalizarRutaImagen(estadoGaleria.fotos[estadoGaleria.indice]);

  if (imagen) {
    imagen.src = fotoActual;
    imagen.alt = `${estadoGaleria.nombre} - foto ${estadoGaleria.indice + 1}`;
  }
  if (titulo) {
    titulo.textContent = estadoGaleria.nombre;
  }
  if (indice) {
    indice.textContent = `${estadoGaleria.indice + 1} / ${estadoGaleria.fotos.length}`;
  }
  if (thumbs) {
    thumbs.innerHTML = '';
    estadoGaleria.fotos.forEach((foto, idx) => {
      const miniatura = document.createElement('img');
      miniatura.src = normalizarRutaImagen(foto);
      miniatura.alt = `${estadoGaleria.nombre} miniatura ${idx + 1}`;
      miniatura.dataset.action = 'thumb';
      miniatura.dataset.index = idx;
      if (idx === estadoGaleria.indice) {
        miniatura.classList.add('activo');
      }
      thumbs.appendChild(miniatura);
    });
  }
}

async function cargarAnimales() {
  try {
    // Cargar todos los animales para poder filtrar por estado
    todosLosAnimales = await api.getAnimales();
    // Por defecto, mostrar solo disponibles
    aplicarFiltros();
  } catch (error) {
    console.error('Error al cargar animales:', error);
    document.getElementById('animalList').innerHTML = `
      <div style="text-align: center; padding: 40px; color: #d32f2f;">
        Error al cargar los animales. Por favor, intente más tarde.
      </div>
    `;
  }
}

function renderizarAnimales(animales) {
  const container = document.getElementById('animalList');
  const contadorResultados = document.getElementById('contadorResultados');
  
  // Actualizar contador
  if (contadorResultados) {
    const total = todosLosAnimales.length;
    const mostrados = animales.length;
    if (mostrados === total) {
      contadorResultados.textContent = `Mostrando ${mostrados} animal${mostrados !== 1 ? 'es' : ''}`;
    } else {
      contadorResultados.textContent = `Mostrando ${mostrados} de ${total} animal${total !== 1 ? 'es' : ''}`;
    }
  }
  
  if (!animales || animales.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #666;">
        No se encontraron animales que coincidan con los filtros seleccionados.
        <br><br>
        <button onclick="limpiarFiltros()" class="btn btn-secondary">Limpiar filtros</button>
      </div>
    `;
    return;
  }
  
  // Reiniciar mapa de galerías
  Object.keys(galeriaAnimales).forEach((clave) => delete galeriaAnimales[clave]);

  container.innerHTML = animales.map(animal => {
    // Construir ruta de imagen correctamente
    const fotosDesdeApi = Array.isArray(animal.fotos) && animal.fotos.length > 0
      ? animal.fotos.map((foto) => (typeof foto === 'string' ? foto : foto.ruta))
      : [];

    if (!fotosDesdeApi.length && animal.foto) {
      fotosDesdeApi.push(animal.foto);
    }

    const fotosNormalizadas = fotosDesdeApi.length > 0
      ? fotosDesdeApi.map(normalizarRutaImagen)
      : [normalizarRutaImagen(obtenerImagenGenerica(animal.especie))];

    galeriaAnimales[animal.idAnimal] = {
      nombre: animal.nombre,
      fotos: fotosNormalizadas
    };

    const imagenSrc = fotosNormalizadas[0] || normalizarRutaImagen(obtenerImagenGenerica(animal.especie));
    const totalFotos = fotosNormalizadas.length;
    // Mostrar botón de postulación solo si está disponible y el usuario está autenticado
    const isAuthenticated = !!localStorage.getItem('token');
    let botonPostulacion = '';
    
    if (animal.estado === 'Disponible') {
      if (isAuthenticated) {
        botonPostulacion = `<a href="formulario-adopción.html?animalId=${animal.idAnimal}">
           <button class="btn btn-adopt">Postularme para adoptar</button>
         </a>`;
      } else {
        botonPostulacion = `<a href="login.html">
           <button class="btn btn-secondary">Inicia sesión para postularte</button>
         </a>`;
      }
    } else {
      botonPostulacion = `<button class="btn btn-secondary" disabled>No disponible para adopción</button>`;
    }
    
    return `
      <div class="animal-card">
        <div class="animal-image-wrapper" data-animal-id="${animal.idAnimal}" tabindex="0" role="button" aria-label="Ver galería de ${escapeHtml(animal.nombre)}">
          <img src="${imagenSrc}" alt="${animal.nombre}" class="animal-img" onerror="this.src='${obtenerImagenGenerica(animal.especie)}'; this.onerror=null;">
          ${totalFotos > 1 ? `<span class="gallery-badge">+${totalFotos - 1}</span>` : ''}
        </div>
        <h3>${escapeHtml(animal.nombre)}</h3>
        <p><strong>Especie:</strong> ${escapeHtml(animal.especie || 'No especificada')}</p>
        <p><strong>Edad:</strong> ${animal.edad !== null && animal.edad !== undefined ? animal.edad + ' ' + (animal.edad === 1 ? 'año' : 'años') : 'No especificada'}</p>
        <p><strong>Estado:</strong> <span class="badge-estado estado-${(animal.estado || '').toLowerCase().replace(/\s+/g, '-')}">${escapeHtml(animal.estado || 'No especificado')}</span></p>
        ${animal.raza ? `<p><strong>Raza:</strong> ${escapeHtml(animal.raza)}</p>` : ''}
        ${animal.descripcion ? `<p class="animal-desc">${escapeHtml(animal.descripcion)}</p>` : ''}
        ${botonPostulacion}
      </div>
    `;
  }).join('');

  // Asignar eventos de galería
  container.querySelectorAll('.animal-image-wrapper').forEach((wrapper) => {
    const id = Number(wrapper.dataset.animalId);
    wrapper.addEventListener('click', () => abrirGaleria(id, 0));
    wrapper.addEventListener('keydown', (evento) => {
      if (evento.key === 'Enter' || evento.key === ' ') {
        evento.preventDefault();
        abrirGaleria(id, 0);
      }
    });
  });
}

function aplicarFiltros() {
  const textoBusqueda = document.getElementById('buscador').value.toLowerCase().trim();
  const especieFiltro = document.getElementById('filtroEspecie').value;
  const edadFiltro = document.getElementById('filtroEdad').value;
  const estadoFiltro = document.getElementById('filtroEstado').value;
  
  let filtrados = [...todosLosAnimales];
  
  // Filtro por texto (nombre) - búsqueda más robusta
  if (textoBusqueda) {
    filtrados = filtrados.filter(a => {
      const nombre = (a.nombre || '').toLowerCase();
      const raza = (a.raza || '').toLowerCase();
      const descripcion = (a.descripcion || '').toLowerCase();
      // Buscar en nombre, raza y descripción
      return nombre.includes(textoBusqueda) || 
             raza.includes(textoBusqueda) || 
             descripcion.includes(textoBusqueda);
    });
  }
  
  // Filtro por especie
  if (especieFiltro) {
    filtrados = filtrados.filter(a => a.especie === especieFiltro);
  }
  
  // Filtro por edad - mejorado con rangos más precisos
  if (edadFiltro) {
    filtrados = filtrados.filter(a => {
      const edad = a.edad !== null && a.edad !== undefined ? a.edad : -1;
      if (edad === -1) return false; // Excluir sin edad si hay filtro
      
      if (edadFiltro === 'cachorro') return edad >= 0 && edad <= 1;
      if (edadFiltro === 'adulto') return edad > 1 && edad <= 7;
      if (edadFiltro === 'senior') return edad > 7;
      return true;
    });
  }
  
  // Filtro por estado
  if (estadoFiltro) {
    filtrados = filtrados.filter(a => a.estado === estadoFiltro);
  }
  
  renderizarAnimales(filtrados);
}

function limpiarFiltros() {
  document.getElementById('buscador').value = '';
  document.getElementById('filtroEspecie').value = '';
  document.getElementById('filtroEdad').value = '';
  document.getElementById('filtroEstado').value = 'Disponible'; // Por defecto mostrar disponibles
  aplicarFiltros();
}

// Hacer limpiarFiltros accesible globalmente para el botón en el mensaje sin resultados
window.limpiarFiltros = limpiarFiltros;

function obtenerImagenGenerica(especie) {
  // Intentar usar imágenes existentes según especie, sino usar SVG genérico
  const imagenesPorEspecie = {
    'Perro': 'images/bingo.jpg', // Imagen de ejemplo para perros
    'Gato': 'images/michu.jpg'   // Imagen de ejemplo para gatos
  };
  
  // Retornar imagen específica si existe, sino SVG genérico
  const imagenEspecifica = imagenesPorEspecie[especie];
  if (imagenEspecifica) {
    return imagenEspecifica;
  }
  
  // SVG genérico como fallback
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BbmltYWw8L3RleHQ+PC9zdmc+';
}

function categorizarEdad(edad) {
  if (!edad) return 'Desconocida';
  if (edad <= 1) return 'Cachorro';
  if (edad <= 7) return 'Adulto';
  return 'Senior';
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
