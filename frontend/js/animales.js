// Página de animales - funcionalidad de adopción
document.addEventListener('DOMContentLoaded', async () => {
  // Cargar animales desde la API
  await cargarAnimalesDesdeAPI();
  
  // Configurar enlaces de adopción
  configurarEnlacesAdopcion();
});

async function cargarAnimalesDesdeAPI() {
  try {
    const animales = await api.getAnimales();
    
    // Actualizar las tarjetas de animales con datos reales
    const animalCards = document.querySelectorAll('.animal-card');
    
    animales.forEach((animal, index) => {
      if (animalCards[index]) {
        const card = animalCards[index];
        
        // Actualizar información del animal
        const nombreElement = card.querySelector('h3');
        const especieElement = card.querySelector('p:nth-of-type(1)');
        const edadElement = card.querySelector('p:nth-of-type(2)');
        const descripcionElement = card.querySelector('.animal-desc');
        
        if (nombreElement) nombreElement.textContent = animal.nombre;
        if (especieElement) especieElement.innerHTML = `<strong>Especie:</strong> ${animal.especie || 'No especificada'}`;
        if (edadElement) edadElement.innerHTML = `<strong>Edad:</strong> ${animal.edad || 'No especificada'} años`;
        if (descripcionElement) descripcionElement.textContent = animal.descripcion || 'Descripción no disponible';
        
        // Actualizar enlace de adopción con ID del animal
        const enlaceAdopcion = card.querySelector('a[href="formulario-adopción.html"]');
        if (enlaceAdopcion) {
          enlaceAdopcion.href = `formulario-adopción.html?animalId=${animal.idAnimal}`;
        }
      }
    });
  } catch (error) {
    console.error('Error al cargar animales:', error);
    // Si hay error, mantener los datos estáticos
  }
}

function configurarEnlacesAdopcion() {
  const enlacesAdopcion = document.querySelectorAll('a[href="formulario-adopción.html"]');
  
  enlacesAdopcion.forEach((enlace, index) => {
    // Si no se actualizó dinámicamente, usar índice + 1 como ID
    if (enlace.href === window.location.origin + '/formulario-adopción.html') {
      enlace.href = `formulario-adopción.html?animalId=${index + 1}`;
    }
  });
}