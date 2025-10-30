// Funciones de autenticación y manejo de sesión
let intervaloNotificaciones = null;

function saveSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function getSession() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return {
    token,
    user: user ? JSON.parse(user) : null,
  };
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'welcome.html';
}

function isAuthenticated() {
  return !!localStorage.getItem('token');
}

function isAdmin() {
  const user = getSession().user;
  return user && user.rol === 'administrador';
}

function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'welcome.html';
  }
}

function requireAdmin() {
  if (!isAuthenticated() || !isAdmin()) {
    window.location.href = 'welcome.html';
  }
}

// Redirigir al dashboard correcto según el rol del usuario
function redirectToDashboard() {
  if (isAdmin()) {
    window.location.href = 'admin_dashboard.html';
  } else if (isAuthenticated()) {
    window.location.href = 'user_dashboard.html';
  } else {
    window.location.href = 'welcome.html';
  }
}

// Mostrar información del usuario en el header
function displayUserInfo() {
  const user = getSession().user;
  if (user) {
    const userElements = document.querySelectorAll('.user-info, .user-name');
    userElements.forEach(el => {
      el.textContent = user.email;
    });
  }
}

// Agregar listener al botón de cerrar sesión
document.addEventListener('DOMContentLoaded', () => {
  displayUserInfo();
  const logoutBtn = document.querySelector('.btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  ajustarMenuPorRol();
  actualizarBotonesSesion();
});

function ajustarMenuPorRol() {
  const admin = isAdmin();
  document.querySelectorAll('[data-role="admin"]').forEach(el => {
    el.style.display = admin ? '' : 'none';
  });
  document.querySelectorAll('[data-role="public"]').forEach(el => {
    el.style.display = admin ? 'none' : '';
  });
}

function actualizarBotonesSesion() {
  const autenticado = isAuthenticated();
  const logoutBtn = document.querySelector('.btn-logout');
  const loginLink = document.querySelector('.btn-login-link');
  const perfilLink = document.querySelector('.btn-perfil-link');
  const notificacionesLink = document.querySelector('.btn-notificaciones-link');
  if (logoutBtn) logoutBtn.style.display = autenticado ? '' : 'none';
  if (loginLink) loginLink.style.display = autenticado ? 'none' : '';
  if (perfilLink) perfilLink.style.display = autenticado ? '' : 'none';
  if (notificacionesLink) notificacionesLink.style.display = autenticado ? '' : 'none';
  
  // Actualizar contador de notificaciones
  if (autenticado) {
    actualizarContadorNotificaciones();
    // Actualizar cada 30 segundos (solo si no existe ya)
    if (!intervaloNotificaciones) {
      intervaloNotificaciones = setInterval(actualizarContadorNotificaciones, 30000);
    }
  } else {
    // Limpiar intervalo si el usuario cierra sesión
    if (intervaloNotificaciones) {
      clearInterval(intervaloNotificaciones);
      intervaloNotificaciones = null;
    }
  }
}

async function actualizarContadorNotificaciones() {
  try {
    if (!isAuthenticated()) return;
    const response = await api.contarNotificacionesNoLeidas();
    const badge = document.getElementById('badge-notificaciones');
    if (badge) {
      if (response.count > 0) {
        badge.textContent = response.count;
        badge.style.display = '';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error al actualizar contador de notificaciones:', error);
  }
}

