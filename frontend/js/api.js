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
};

