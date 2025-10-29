// Gestión de animales para administradores
document.addEventListener('DOMContentLoaded', () => {
  // Verificar que el usuario es administrador
  requireAdmin();
  
  const form = document.getElementById('animalForm');
  const animalsTable = document.getElementById('animalsTable');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');

  // Cargar animales al iniciar
  cargarAnimales();

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
      // Obtener datos del formulario
      const formData = new FormData(form);
      const animalData = {
        nombre: formData.get('nombre').trim(),
        especie: formData.get('especie'),
        raza: formData.get('raza').trim(),
        edad: parseInt(formData.get('edad')),
        estado: formData.get('estado'),
        fechaIngreso: formData.get('fechaIngreso'),
        descripcion: formData.get('descripcion').trim()
      };

      // Verificar duplicados por nombre
      if (await verificarDuplicado(animalData.nombre)) {
        mostrarError('Ya existe un animal registrado con ese nombre. Por favor, verifica o usa un nombre diferente.');
        return;
      }

      // Registrar animal
      const response = await api.crearAnimal(animalData);
      
      // Mostrar éxito
      mostrarExito(`Animal "${response.animal.nombre}" registrado exitosamente con ID: ${response.animal.idAnimal}`);
      
      // Limpiar formulario
      form.reset();
      
      // Recargar tabla
      cargarAnimales();

    } catch (error) {
      console.error('Error al registrar animal:', error);
      
      // Manejar diferentes tipos de errores
      if (error.message.includes('Campos obligatorios')) {
        mostrarError('Por favor, completa todos los campos obligatorios marcados con *');
      } else if (error.message.includes('Ya existe un animal')) {
        mostrarError('Ya existe un animal registrado con ese nombre. Por favor, usa un nombre diferente.');
      } else if (error.message.includes('edad debe estar')) {
        mostrarError('La edad debe estar entre 0 y 30 años');
      } else if (error.message.includes('fecha de ingreso no puede ser futura')) {
        mostrarError('La fecha de ingreso no puede ser futura');
      } else {
        mostrarError(error.message || 'Error al registrar el animal. Por favor, intenta nuevamente.');
      }
    }
  });

  // Función para validar formulario
  function validarFormulario() {
    let esValido = true;
    const camposObligatorios = ['nombre', 'especie', 'edad', 'estado', 'fechaIngreso'];

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

  // Función para cargar animales en la tabla
  async function cargarAnimales() {
    try {
      const animales = await api.getAnimales();
      const tbody = animalsTable.querySelector('tbody');
      
      if (animales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">No hay animales registrados</td></tr>';
        return;
      }

      tbody.innerHTML = animales.map(animal => `
        <tr>
          <td>${animal.idAnimal}</td>
          <td>${animal.nombre}</td>
          <td>${animal.especie || '-'}</td>
          <td>${animal.raza || '-'}</td>
          <td>${animal.edad || '-'}</td>
          <td><span class="status ${getStatusClass(animal.estado)}">${animal.estado || '-'}</span></td>
          <td>${formatearFecha(animal.fechaIngreso)}</td>
          <td>
            <button class="btn-table ver" onclick="verAnimal(${animal.idAnimal})">👁️</button>
            <button class="btn-table salud" onclick="verHistorialSalud(${animal.idAnimal})">🏥</button>
            <button class="btn-table estado" onclick="cambiarEstadoAnimal(${animal.idAnimal})">🔄</button>
            <button class="btn-table editar" onclick="editarAnimal(${animal.idAnimal})">✏️</button>
            <button class="btn-table eliminar" onclick="eliminarAnimal(${animal.idAnimal})">🗑️</button>
          </td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Error al cargar animales:', error);
      mostrarError('Error al cargar la lista de animales');
    }
  }

  // Función para obtener clase CSS del estado
  function getStatusClass(estado) {
    const estados = {
      'Disponible': 'disponible',
      'En proceso': 'proceso',
      'Adoptado': 'adoptado',
      'En tratamiento': 'tratamiento'
    };
    return estados[estado] || '';
  }

  // Función para formatear fecha
  function formatearFecha(fecha) {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

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
    const campos = ['nombre', 'especie', 'edad', 'estado', 'fechaIngreso'];
    campos.forEach(campo => limpiarErrorCampo(campo));
  }
});

// Funciones globales para acciones de la tabla
async function verAnimal(id) {
  try {
    const animal = await api.getAnimal(id);
    alert(`Ficha del Animal:\n\nID: ${animal.idAnimal}\nNombre: ${animal.nombre}\nEspecie: ${animal.especie}\nRaza: ${animal.raza}\nEdad: ${animal.edad} años\nEstado: ${animal.estado}\nFecha Ingreso: ${new Date(animal.fechaIngreso).toLocaleDateString('es-ES')}`);
  } catch (error) {
    alert('Error al obtener información del animal');
  }
}

async function editarAnimal(id) {
  // TODO: Implementar edición de animal
  alert('Función de edición en desarrollo');
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
    cargarAnimales();

  } catch (error) {
    console.error('Error al cambiar estado:', error);
    alert(error.message || 'Error al cambiar el estado del animal');
  }
}
