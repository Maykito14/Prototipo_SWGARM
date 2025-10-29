// Página de animales - funcionalidad de adopción
document.addEventListener('DOMContentLoaded', async () => {
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
  
  container.innerHTML = animales.map(animal => {
    const imagenSrc = animal.foto || obtenerImagenGenerica(animal.especie);
    const categoriaEdad = categorizarEdad(animal.edad);
    
    // Mostrar botón de postulación solo si está disponible
    const botonPostulacion = animal.estado === 'Disponible' 
      ? `<a href="formulario-adopción.html?animalId=${animal.idAnimal}">
           <button class="btn btn-adopt">Postularme para adoptar</button>
         </a>`
      : `<button class="btn btn-secondary" disabled>No disponible para adopción</button>`;
    
    return `
      <div class="animal-card">
        <img src="${imagenSrc}" alt="${animal.nombre}" class="animal-img" onerror="this.src='${obtenerImagenGenerica(animal.especie)}'">
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
