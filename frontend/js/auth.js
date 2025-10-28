// Funciones de autenticación y manejo de sesión

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
  window.location.href = 'login.html';
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
    window.location.href = 'login.html';
  }
}

function requireAdmin() {
  if (!isAuthenticated() || !isAdmin()) {
    window.location.href = 'index.html';
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
});

