document.addEventListener('DOMContentLoaded', () => {
  // Verificar que el usuario está autenticado
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('perfilForm');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');
  const emailInput = document.getElementById('email');

  // Cargar perfil al iniciar
  cargarPerfil();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    limpiarMensajes();
    limpiarErrores();

    if (!validarFormulario()) {
      return;
    }

    try {
      const formData = new FormData(form);
      const datosPerfil = {
        nombre: formData.get('nombre').trim(),
        apellido: formData.get('apellido').trim(),
        telefono: formData.get('telefono').trim() || null,
        direccion: formData.get('direccion').trim() || null,
        ocupacion: formData.get('ocupacion').trim() || null
      };

      const response = await api.actualizarMiPerfil(datosPerfil);
      
      mostrarExito(response.message || 'Perfil actualizado exitosamente');
      cargarPerfil(); // Recargar para mostrar datos actualizados
    } catch (error) {
      mostrarError(error.message || 'Error al actualizar el perfil');
    }
  });

  async function cargarPerfil() {
    try {
      const perfil = await api.obtenerMiPerfil();
      
      // Llenar formulario con datos del perfil
      // Si los valores son "Pendiente", mostrar como vacío
      document.getElementById('nombre').value = (perfil.nombre === 'Pendiente' ? '' : perfil.nombre) || '';
      document.getElementById('apellido').value = (perfil.apellido === 'Pendiente' ? '' : perfil.apellido) || '';
      document.getElementById('email').value = perfil.email || '';
      document.getElementById('telefono').value = perfil.telefono || '';
      document.getElementById('direccion').value = perfil.direccion || '';
      document.getElementById('ocupacion').value = perfil.ocupacion || '';
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      mostrarError('Error al cargar los datos del perfil');
    }
  }

  function validarFormulario() {
    let esValido = true;
    const camposObligatorios = ['nombre', 'apellido'];

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

    // Validar formato de teléfono si se proporciona
    const telefono = document.getElementById('telefono').value.trim();
    if (telefono) {
      const telefonoRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
      if (!telefonoRegex.test(telefono)) {
        mostrarErrorCampo('telefono', 'Formato de teléfono inválido');
        esValido = false;
      } else {
        limpiarErrorCampo('telefono');
      }
    }

    return esValido;
  }

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
    if (errorSpan) {
      errorSpan.textContent = mensaje;
      errorSpan.style.display = 'block';
    }
  }

  function limpiarErrorCampo(campo) {
    const errorSpan = document.getElementById(`${campo}-error`);
    if (errorSpan) {
      errorSpan.textContent = '';
      errorSpan.style.display = 'none';
    }
  }

  function limpiarErrores() {
    const campos = ['nombre', 'apellido', 'telefono'];
    campos.forEach(campo => limpiarErrorCampo(campo));
  }
});

