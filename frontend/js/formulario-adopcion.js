// Formulario de adopción
document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticación
  if (!isAuthenticated()) {
    alert('Debes iniciar sesión para postularte a una adopción');
    window.location.href = 'index.html';
    return;
  }
  
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

  // Validar que se haya proporcionado un animalId (debe accederse desde una tarjeta de animal)
  if (!animalId) {
    alert('Debes seleccionar un animal desde la lista de animales disponibles para postularte a su adopción.');
    window.location.href = 'animales.html';
    return;
  }

  // Cargar información del animal
  cargarInformacionAnimal(animalId);

  // Manejar campo condicional de otras mascotas
  document.querySelectorAll('input[name="otrasMascotas"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const detalleDiv = document.getElementById('detalleOtrasMascotas');
      const detalleInput = document.getElementById('detalleMascotas');
      if (e.target.value === 'Sí') {
        detalleDiv.style.display = 'block';
        detalleInput.required = true;
      } else {
        detalleDiv.style.display = 'none';
        detalleInput.required = false;
        detalleInput.value = '';
      }
    });
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

      // Recopilar todas las respuestas del formulario
      const datosFormulario = {
        mayorEdad: formData.get('mayorEdad'),
        motivoAdopcion: formData.get('motivoAdopcion').trim(),
        experienciaMascotas: formData.get('experienciaMascotas'),
        tipoVivienda: formData.get('tipoVivienda'),
        cerramiento: formData.get('cerramiento').trim(),
        patio: formData.get('patio'),
        espaciosAcceso: formData.get('espaciosAcceso').trim(),
        ninosPequenos: formData.get('ninosPequenos'),
        otrasMascotas: formData.get('otrasMascotas'),
        detalleMascotas: formData.get('detalleMascotas') ? formData.get('detalleMascotas').trim() : '',
        permisos: formData.get('permisos'),
        horasFuera: formData.get('horasFuera'),
        cuidadoAusencia: formData.get('cuidadoAusencia').trim(),
        trabajoEstable: formData.get('trabajoEstable'),
        disposicionGastos: formData.get('disposicionGastos'),
        aceptaSeguimiento: formData.get('aceptaSeguimiento'),
        telefono: formData.get('telefono').trim(),
        direccion: formData.get('direccion').trim(),
        ocupacion: formData.get('ocupacion').trim()
      };

      // Validar que si tiene otras mascotas, debe especificar detalles
      if (datosFormulario.otrasMascotas === 'Sí' && !datosFormulario.detalleMascotas) {
        mostrarError('Si tiene otras mascotas, debe especificar detalles (especie/cantidad y si están castrados)');
        mostrarErrorCampo('detalleMascotas', 'Este campo es obligatorio si tiene otras mascotas');
        document.getElementById('detalleOtrasMascotas').style.display = 'block';
        return;
      }

      // Calcular puntaje basado en las respuestas
      const puntajeEvaluacion = calcularPuntaje(datosFormulario);

      const datosSolicitud = {
        datosAdoptante,
        idAnimal: parseInt(animalId),
        respuestasFormulario: JSON.stringify(datosFormulario), // Guardar todas las respuestas como JSON
        puntajeEvaluacion: puntajeEvaluacion
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

  // Sistema de evaluación de puntajes - Versión mejorada con todas las preguntas
  function calcularPuntaje(datosFormulario) {
    let puntaje = 0;

    // ============================================
    // VERIFICACIÓN BÁSICA (0-5 puntos)
    // ============================================
    // Mayor de edad - REQUISITO OBLIGATORIO (0 puntos si no, descalifica automáticamente)
    if (datosFormulario.mayorEdad === 'No') {
      return 0; // Descalifica automáticamente si no es mayor de edad
    }
    puntaje += 5; // Si es mayor de edad, base de 5 puntos

    // ============================================
    // MOTIVO DE ADOPCIÓN (0-10 puntos)
    // ============================================
    const motivoAdopcion = (datosFormulario.motivoAdopcion || '').trim();
    if (motivoAdopcion.length >= 100) {
      puntaje += 10;
    } else if (motivoAdopcion.length >= 50) {
      puntaje += 7;
    } else if (motivoAdopcion.length >= 20) {
      puntaje += 5;
    } else {
      puntaje += 2;
    }

    // ============================================
    // EXPERIENCIA CON MASCOTAS (0-8 puntos)
    // ============================================
    const experiencia = datosFormulario.experienciaMascotas;
    if (experiencia === 'Sí, he tenido mascotas antes') {
      puntaje += 8;
    } else if (experiencia === 'Sí, pero hace mucho tiempo') {
      puntaje += 4;
    } else {
      puntaje += 1;
    }

    // ============================================
    // VIVIENDA Y ESPACIO (0-25 puntos)
    // ============================================
    // Tipo de vivienda
    if (datosFormulario.tipoVivienda === 'Casa propia') {
      puntaje += 5;
    } else {
      puntaje += 2; // Alquilada - menos puntos pero no descalifica
    }

    // Patio o espacio abierto
    if (datosFormulario.patio === 'Sí, amplio') {
      puntaje += 8;
    } else if (datosFormulario.patio === 'Sí, pequeño') {
      puntaje += 4;
    } else {
      puntaje += 0; // No tiene patio
    }

    // Cerramiento (calidad de la descripción)
    const cerramiento = (datosFormulario.cerramiento || '').trim();
    const cerramientoLower = cerramiento.toLowerCase();
    if (cerramiento.length >= 50) {
      puntaje += 5;
      // Palabras clave positivas para cerramiento
      if (cerramientoLower.includes('alto') || cerramientoLower.includes('seguro') || 
          cerramientoLower.includes('cercado') || cerramientoLower.includes('malla') ||
          cerramientoLower.includes('alambrado')) {
        puntaje += 3;
      }
    } else if (cerramiento.length >= 20) {
      puntaje += 2;
    }

    // Espacios de acceso (calidad de la respuesta)
    const espaciosAcceso = (datosFormulario.espaciosAcceso || '').trim();
    if (espaciosAcceso.length >= 50) {
      puntaje += 5;
    } else if (espaciosAcceso.length >= 20) {
      puntaje += 2;
    }

    // ============================================
    // CONVIVENCIA (0-15 puntos)
    // ============================================
    // Niños pequeños
    if (datosFormulario.ninosPequenos === 'No') {
      puntaje += 5; // Sin niños es preferible para algunos animales
    } else {
      puntaje += 2; // Con niños puede ser más complicado pero no imposible
    }

    // Otras mascotas
    if (datosFormulario.otrasMascotas === 'Sí') {
      const detalleMascotas = (datosFormulario.detalleMascotas || '').trim().toLowerCase();
      if (detalleMascotas.length > 0) {
        puntaje += 5; // Tiene experiencia con mascotas
        // Bonus si menciona castración
        if (detalleMascotas.includes('castrado') || detalleMascotas.includes('castrados') ||
            detalleMascotas.includes('castrada') || detalleMascotas.includes('castradas')) {
          puntaje += 3; // Mascotas castradas = más responsable
        }
      } else {
        puntaje += 2; // Otras mascotas pero no especifica
      }
    } else {
      puntaje += 4; // Primera mascota - no hay riesgo de conflictos
    }

    // ============================================
    // DISPONIBILIDAD Y COMPROMISO (0-25 puntos)
    // ============================================
    // Permisos obtenidos
    if (datosFormulario.permisos === 'Sí') {
      puntaje += 8; // Muy importante - tiene permisos
    } else {
      puntaje += 0; // Sin permisos es un problema serio
    }

    // Horas fuera del hogar
    if (datosFormulario.horasFuera === 'Menos de 4 horas') {
      puntaje += 8; // Muy buena disponibilidad
    } else if (datosFormulario.horasFuera === 'Entre 4 y 8 horas') {
      puntaje += 5; // Disponibilidad moderada
    } else {
      puntaje += 2; // Muchas horas fuera - menos ideal
    }

    // Cuidado en ausencias (calidad de la respuesta)
    const cuidadoAusencia = (datosFormulario.cuidadoAusencia || '').trim();
    if (cuidadoAusencia.length >= 30) {
      puntaje += 5;
      // Palabras clave que indican planificación
      const cuidadoLower = cuidadoAusencia.toLowerCase();
      if (cuidadoLower.includes('familiar') || cuidadoLower.includes('familia') ||
          cuidadoLower.includes('veterinario') || cuidadoLower.includes('guardería') ||
          cuidadoLower.includes('cuidado')) {
        puntaje += 2;
      }
    } else if (cuidadoAusencia.length >= 10) {
      puntaje += 2;
    }

    // Trabajo estable
    if (datosFormulario.trabajoEstable === 'Sí') {
      puntaje += 5; // Estabilidad económica
    } else {
      puntaje += 1; // Sin trabajo estable - preocupante
    }

    // Disposición a gastos
    if (datosFormulario.disposicionGastos === 'Sí') {
      puntaje += 6; // Muy importante
    } else {
      puntaje += 0; // No está dispuesto - descalifica prácticamente
    }

    // Acepta seguimiento
    if (datosFormulario.aceptaSeguimiento === 'Sí') {
      puntaje += 4; // Muestra compromiso
    } else {
      puntaje += 0; // No acepta seguimiento - red flag
    }

    // ============================================
    // COMPLETITUD DE DATOS (0-12 puntos)
    // ============================================
    let camposCompletos = 0;
    if (datosFormulario.telefono && datosFormulario.telefono.trim().length > 0) camposCompletos++;
    if (datosFormulario.direccion && datosFormulario.direccion.trim().length > 0) camposCompletos++;
    if (datosFormulario.ocupacion && datosFormulario.ocupacion.trim().length > 0) camposCompletos++;
    
    // 0 campos: 2 puntos, 1 campo: 5 puntos, 2 campos: 8 puntos, 3 campos: 12 puntos
    puntaje += (2 + (camposCompletos * 3));

    // Limitar el puntaje máximo a 100
    return Math.min(100, Math.max(0, puntaje));
  }

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
    const camposObligatorios = ['nombre', 'apellido', 'email', 'mayorEdad', 'motivoAdopcion', 'experienciaMascotas', 
      'tipoVivienda', 'cerramiento', 'patio', 'espaciosAcceso', 'ninosPequenos', 'otrasMascotas',
      'permisos', 'horasFuera', 'cuidadoAusencia', 'trabajoEstable', 'disposicionGastos', 'aceptaSeguimiento'];

    camposObligatorios.forEach(campo => {
      // Manejar radio buttons diferente de inputs normales
      let input = document.getElementById(campo);
      let valor = null;
      
      // Si no encuentra por ID, buscar por name (radio buttons)
      if (!input) {
        const radio = document.querySelector(`input[name="${campo}"]:checked`);
        if (radio) {
          valor = radio.value;
        }
      } else {
        valor = input.value ? input.value.trim() : null;
      }
      
      const errorSpan = document.getElementById(`${campo}-error`);
      
      if (!valor) {
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

    // Validar campos de texto con longitud mínima
    const cerramiento = document.getElementById('cerramiento').value.trim();
    if (cerramiento && cerramiento.length < 10) {
      mostrarErrorCampo('cerramiento', 'La descripción debe tener al menos 10 caracteres');
      esValido = false;
    }

    const espaciosAcceso = document.getElementById('espaciosAcceso').value.trim();
    if (espaciosAcceso && espaciosAcceso.length < 10) {
      mostrarErrorCampo('espaciosAcceso', 'La descripción debe tener al menos 10 caracteres');
      esValido = false;
    }

    const cuidadoAusencia = document.getElementById('cuidadoAusencia').value.trim();
    if (cuidadoAusencia && cuidadoAusencia.length < 10) {
      mostrarErrorCampo('cuidadoAusencia', 'La descripción debe tener al menos 10 caracteres');
      esValido = false;
    }

    // Validar campo condicional de otras mascotas
    const otrasMascotas = document.querySelector('input[name="otrasMascotas"]:checked');
    if (otrasMascotas && otrasMascotas.value === 'Sí') {
      const detalleMascotas = document.getElementById('detalleMascotas').value.trim();
      if (!detalleMascotas || detalleMascotas.length < 5) {
        mostrarErrorCampo('detalleMascotas', 'Debe especificar detalles sobre sus mascotas (al menos 5 caracteres)');
        document.getElementById('detalleOtrasMascotas').style.display = 'block';
        esValido = false;
      }
    }

    // Validar mayor de edad
    const mayorEdad = document.querySelector('input[name="mayorEdad"]:checked');
    if (!mayorEdad) {
      mostrarErrorCampo('mayorEdad', 'Debe indicar si es mayor de edad');
      esValido = false;
    } else if (mayorEdad.value === 'No') {
      mostrarError('Debe ser mayor de edad para adoptar una mascota');
      mostrarErrorCampo('mayorEdad', 'Debe ser mayor de edad para adoptar');
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
    const campos = ['nombre', 'apellido', 'email', 'telefono', 'mayorEdad', 'motivoAdopcion', 'experienciaMascotas',
      'tipoVivienda', 'cerramiento', 'patio', 'espaciosAcceso', 'ninosPequenos', 'otrasMascotas', 'detalleMascotas',
      'permisos', 'horasFuera', 'cuidadoAusencia', 'trabajoEstable', 'disposicionGastos', 'aceptaSeguimiento'];
    campos.forEach(campo => limpiarErrorCampo(campo));
  }
});
