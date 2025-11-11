const API_URL = 'http://localhost:3001/api';

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || 'Error en la petición');
        // Pasar todos los datos adicionales del error
        if (data.intentosRestantes !== undefined) error.intentosRestantes = data.intentosRestantes;
        if (data.minutosRestantes !== undefined) error.minutosRestantes = data.minutosRestantes;
        if (data.mensaje) error.mensaje = data.mensaje;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error API:', error);
      throw error;
    }
  },

  // Usuarios
  async login(email, password) {
    return this.request('/usuarios/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async solicitarRecuperacionPassword(email) {
    return this.request('/usuarios/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async restablecerPassword(payload) {
    return this.request('/usuarios/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async register(email, password, rol = 'adoptante') {
    return this.request('/usuarios/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, rol }),
    });
  },

  async getDashboardStats() {
    return this.request('/dashboard/stats');
  },

  async getUsuarios() {
    return this.request('/usuarios/usuarios');
  },

  async actualizarRol(idUsuario, nuevoRol) {
    return this.request(`/usuarios/usuarios/${idUsuario}/rol`, {
      method: 'PUT',
      body: JSON.stringify({ rol: nuevoRol }),
    });
  },

  async blanquearPassword(idUsuario) {
    return this.request(`/usuarios/usuarios/${idUsuario}/blanquear-password`, {
      method: 'POST',
    });
  },

  async bloquearPermanentemente(idUsuario) {
    return this.request(`/usuarios/usuarios/${idUsuario}/bloquear-permanente`, {
      method: 'POST',
    });
  },

  async desbloquearPermanentemente(idUsuario) {
    return this.request(`/usuarios/usuarios/${idUsuario}/desbloquear-permanente`, {
      method: 'POST',
    });
  },

  // Animales
  async getAnimales() {
    return this.request('/animales');
  },

  async getAnimalesDisponibles() {
    return this.request('/animales/disponibles');
  },

  async getAnimal(id) {
    return this.request(`/animales/${id}`);
  },

  async crearAnimal(data) {
    return this.request('/animales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async actualizarAnimal(id, data) {
    return this.request(`/animales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async eliminarAnimal(id) {
    return this.request(`/animales/${id}`, {
      method: 'DELETE',
    });
  },

  // Salud
  async getControlesSalud() {
    return this.request('/salud');
  },

  async getControlSalud(id) {
    return this.request(`/salud/${id}`);
  },

  async getHistorialSalud(animalId) {
    return this.request(`/salud/animal/${animalId}`);
  },

  async getUltimoControlSalud(animalId) {
    return this.request(`/salud/animal/${animalId}/ultimo`);
  },

  async crearControlSalud(data) {
    return this.request('/salud', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async actualizarControlSalud(id, data) {
    return this.request(`/salud/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async eliminarControlSalud(id) {
    return this.request(`/salud/${id}`, {
      method: 'DELETE',
    });
  },

  async darAltaVeterinaria(id) {
    return this.request(`/salud/${id}/alta`, {
      method: 'PUT',
    });
  },

  async cambiarEstadoControl(id, estado, fechaProgramada = null) {
    return this.request(`/salud/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado, fechaProgramada }),
    });
  },

  // Estados de Animales
  async getCambiosEstado() {
    return this.request('/estados');
  },

  async getCambioEstado(id) {
    return this.request(`/estados/${id}`);
  },

  async getHistorialEstados(animalId) {
    return this.request(`/estados/animal/${animalId}`);
  },

  async getEstadosDisponibles(animalId) {
    return this.request(`/estados/animal/${animalId}/estados-disponibles`);
  },

  async cambiarEstadoAnimal(animalId, nuevoEstado, motivo) {
    return this.request('/estados/cambiar', {
      method: 'POST',
      body: JSON.stringify({ animalId, nuevoEstado, motivo }),
    });
  },

  async eliminarCambioEstado(id) {
    return this.request(`/estados/${id}`, {
      method: 'DELETE',
    });
  },

  // Adopción
  async getAdoptantes() {
    return this.request('/adopcion/adoptantes');
  },

  async getAdoptante(id) {
    return this.request(`/adopcion/adoptantes/${id}`);
  },

  async getSolicitudes() {
    return this.request('/adopcion/solicitudes');
  },

  async getSolicitud(id) {
    return this.request(`/adopcion/solicitudes/${id}`);
  },

  async getSolicitudesPorAdoptante(adoptanteId) {
    return this.request(`/adopcion/solicitudes/adoptante/${adoptanteId}`);
  },

  async getMisSolicitudes() {
    return this.request('/adopcion/mis-solicitudes');
  },

  async getSolicitudesPorAnimal(animalId) {
    return this.request(`/adopcion/solicitudes/animal/${animalId}`);
  },

  async crearSolicitudAdopcion(data) {
    return this.request('/adopcion/solicitar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Perfil de adoptante autenticado
  async obtenerMiPerfil() {
    return this.request('/perfil');
  },

  async actualizarMiPerfil(datos) {
    return this.request('/perfil', {
      method: 'PUT',
      body: JSON.stringify(datos),
    });
  },

  async cambiarMiPassword(payload) {
    return this.request('/perfil/password', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Notificaciones
  async getMisNotificaciones() {
    return this.request('/notificaciones');
  },

  async getMisNotificacionesNoLeidas() {
    return this.request('/notificaciones/no-leidas');
  },

  async contarNotificacionesNoLeidas() {
    return this.request('/notificaciones/contar');
  },

  async marcarNotificacionComoLeida(id) {
    return this.request(`/notificaciones/${id}/leida`, {
      method: 'PUT',
    });
  },

  async marcarTodasNotificacionesComoLeidas() {
    return this.request('/notificaciones/marcar-todas-leidas', {
      method: 'PUT',
    });
  },

  async eliminarNotificacion(id) {
    return this.request(`/notificaciones/${id}`, {
      method: 'DELETE',
    });
  },

  // Preferencias de notificación
  async getMisPreferenciasNotificacion() {
    return this.request('/notificaciones/preferencias');
  },

  async actualizarMisPreferenciasNotificacion(preferencias) {
    return this.request('/notificaciones/preferencias', {
      method: 'PUT',
      body: JSON.stringify(preferencias),
    });
  },

  // Campañas (solo administradores)
  async getCampanas() {
    return this.request('/campanas');
  },

  async getCampana(id) {
    return this.request(`/campanas/${id}`);
  },

  async crearCampana(datos) {
    return this.request('/campanas', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  },

  async actualizarCampana(id, datos) {
    return this.request(`/campanas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    });
  },

  async eliminarCampana(id) {
    return this.request(`/campanas/${id}`, {
      method: 'DELETE',
    });
  },

  async actualizarSolicitud(id, data) {
    return this.request(`/adopcion/solicitudes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async eliminarSolicitud(id) {
    return this.request(`/adopcion/solicitudes/${id}`, {
      method: 'DELETE',
    });
  },

  // Adopciones formalizadas
  async getAdopciones() {
    return this.request('/adopcion/adopciones');
  },

  async getAdopcion(id) {
    return this.request(`/adopcion/adopciones/${id}`);
  },

  async getAdopcionesPorAnimal(animalId) {
    return this.request(`/adopcion/adopciones/animal/${animalId}`);
  },

  async formalizarAdopcion(idSolicitud, contrato) {
    return this.request('/adopcion/formalizar', {
      method: 'POST',
      body: JSON.stringify({ idSolicitud, contrato }),
    });
  },

  // Seguimiento de adopción
  async crearSeguimiento(data) {
    return this.request('/seguimiento', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async completarSeguimiento(id, data) {
    return this.request(`/seguimiento/${id}/completar`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getSeguimientosPendientes() {
    return this.request('/seguimiento/pendientes');
  },

  async getMisSeguimientos() {
    return this.request('/seguimiento/mios');
  },

  async getSeguimientosPorAnimal(animalId) {
    return this.request(`/seguimiento/animal/${animalId}`);
  },

  async getSeguimientosPorAdopcion(adopcionId) {
    return this.request(`/seguimiento/adopcion/${adopcionId}`);
  },

  // Reportes
  async getReporteAdopciones(desde, hasta) {
    const params = new URLSearchParams({ desde, hasta });
    return this.request(`/reportes/adopciones?${params.toString()}`);
  },

  async getReporteAltasAnimales(desde, hasta) {
    const params = new URLSearchParams({ desde, hasta });
    return this.request(`/reportes/animales?${params.toString()}`);
  },
};

