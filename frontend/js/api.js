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
        throw new Error(data.error || 'Error en la petición');
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

  async register(email, password, rol = 'adoptante') {
    return this.request('/usuarios/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, rol }),
    });
  },

  // Animales
  async getAnimales() {
    return this.request('/animales');
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

  async getSolicitudesPorAnimal(animalId) {
    return this.request(`/adopcion/solicitudes/animal/${animalId}`);
  },

  async crearSolicitudAdopcion(data) {
    return this.request('/adopcion/solicitar', {
      method: 'POST',
      body: JSON.stringify(data),
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
};

