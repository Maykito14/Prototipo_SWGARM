// Formulario de adopción
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('adopcionForm');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');
  const animalInfo = document.getElementById('animal-info');
  const animalDetails = document.getElementById('animal-details');

  let animalId = null;
  let animalData = null;

  // Obtener ID del animal desde URL
  const urlParams = new URLSearchParams(window.location.search);
  animalId = urlParams.get('animalId');

  // Cargar información del animal si se proporcionó ID
  if (animalId) {
    cargarInformacionAnimal(animalId);
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

    // Si no hay animal seleccionado, mostrar error
    if (!animalId) {
      mostrarError('No se ha seleccionado un animal para adoptar. Por favor, vuelva a la lista de animales.');
      return;
    }

    try {
      // Obtener datos del formulario
      const formData = new FormData(form);
      const datosAdoptante = {
        nombre: formData.get('nombre').trim(),
        apellido: formData.get('apellido').trim(),
        email: formData.get('email').trim(),
        telefono: formData.get('telefono').trim(),
        direccion: formData.get('direccion').trim(),
        ocupacion: formData.get('ocupacion').trim()
      };

      const datosSolicitud = {
        datosAdoptante,
        idAnimal: parseInt(animalId),
        motivoAdopcion: formData.get('motivoAdopcion').trim(),
        experienciaMascotas: formData.get('experienciaMascotas'),
        condicionesVivienda: formData.get('condicionesVivienda').trim()
      };

      // Enviar solicitud de adopción
      const response = await api.crearSolicitudAdopcion(datosSolicitud);
      
      // Mostrar éxito
      mostrarExito(`¡Solicitud de adopción enviada exitosamente! Su solicitud para adoptar a ${response.animal.nombre} ha sido registrada y será evaluada por nuestro equipo. Le contactaremos pronto.`);
      
      // Limpiar formulario
      form.reset();
      
      // Ocultar información del animal
      animalInfo.style.display = 'none';

    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      
      // Manejar diferentes tipos de errores
      if (error.message.includes('Campos obligatorios')) {
        mostrarError('Por favor, completa todos los campos obligatorios marcados con *');
      } else if (error.message.includes('Formato de email inválido')) {
        mostrarError('El formato del correo electrónico no es válido');
      } else if (error.message.includes('Formato de teléfono inválido')) {
        mostrarError('El formato del teléfono no es válido');
      } else if (error.message.includes('Ya existe una solicitud')) {
        mostrarError('Ya has enviado una solicitud de adopción para este animal');
      } else if (error.message.includes('no está disponible para adopción')) {
        mostrarError('Este animal no está disponible para adopción en este momento');
      } else if (error.message.includes('Animal no encontrado')) {
        mostrarError('El animal seleccionado no existe');
      } else {
        mostrarError(error.message || 'Error al enviar la solicitud de adopción. Por favor, intenta nuevamente.');
      }
    }
  });

  // Función para cargar información del animal
  async function cargarInformacionAnimal(id) {
    try {
      animalData = await api.getAnimal(id);
      
      // Mostrar información del animal
      animalDetails.innerHTML = `
        <div class="animal-card-mini">
          <h4>${animalData.nombre}</h4>
          <p><strong>Especie:</strong> ${animalData.especie || 'No especificada'}</p>
          <p><strong>Raza:</strong> ${animalData.raza || 'No especificada'}</p>
          <p><strong>Edad:</strong> ${animalData.edad || 'No especificada'} años</p>
          <p><strong>Estado:</strong> ${animalData.estado || 'No especificado'}</p>
        </div>
      `;
      
      animalInfo.style.display = 'block';
    } catch (error) {
      console.error('Error al cargar información del animal:', error);
      mostrarError('Error al cargar la información del animal');
    }
  }

  // Función para validar formulario
  function validarFormulario() {
    let esValido = true;
    const camposObligatorios = ['nombre', 'apellido', 'email', 'motivoAdopcion', 'experienciaMascotas', 'condicionesVivienda'];

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

    const apellido = document.getElementById('apellido').value.trim();
    if (apellido && apellido.length < 2) {
      mostrarErrorCampo('apellido', 'El apellido debe tener al menos 2 caracteres');
      esValido = false;
    }

    const email = document.getElementById('email').value.trim();
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        mostrarErrorCampo('email', 'Formato de email inválido');
        esValido = false;
      }
    }

    const telefono = document.getElementById('telefono').value.trim();
    if (telefono) {
      const telefonoRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
      if (!telefonoRegex.test(telefono)) {
        mostrarErrorCampo('telefono', 'Formato de teléfono inválido');
        esValido = false;
      }
    }

    const motivoAdopcion = document.getElementById('motivoAdopcion').value.trim();
    if (motivoAdopcion && motivoAdopcion.length < 10) {
      mostrarErrorCampo('motivoAdopcion', 'El motivo debe tener al menos 10 caracteres');
      esValido = false;
    }

    const condicionesVivienda = document.getElementById('condicionesVivienda').value.trim();
    if (condicionesVivienda && condicionesVivienda.length < 10) {
      mostrarErrorCampo('condicionesVivienda', 'La descripción debe tener al menos 10 caracteres');
      esValido = false;
    }

    return esValido;
  }

  // Funciones de mensajes
  function mostrarExito(mensaje) {
    successMessage.textContent = mensaje;
    successMessage.style.display = 'block';
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 10000); // Mostrar por 10 segundos
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
    const campos = ['nombre', 'apellido', 'email', 'telefono', 'motivoAdopcion', 'experienciaMascotas', 'condicionesVivienda'];
    campos.forEach(campo => limpiarErrorCampo(campo));
  }
});
