function buildHeader(titleText) {
  const isAuthenticated = isAuthenticatedUser();
  const isAdmin = isAuthenticated && isAdminUser();
  const isPublicPage = !isAuthenticated;
  
  // Construir navegación según el estado del usuario
  let navLinks = '';
  
  if (isPublicPage) {
    // Usuarios no logueados: solo Inicio y Animales
    navLinks = `
      <a href="index.html">Inicio</a>
      <a href="animales.html">Animales</a>
      <a href="campanas.html">Campañas</a>
    `;
  } else if (isAdmin) {
    // Administradores: Solo Panel Admin y Animales (el resto está en el Panel Admin)
    navLinks = `
      <a href="admin_dashboard.html">Panel Admin</a>
      <a href="animales.html">Animales</a>
      <a href="campanas.html">Campañas</a>
    `;
  } else {
    // Usuarios adoptantes logueados: Mi Panel y Animales (postulación solo desde tarjeta de animal)
    navLinks = `
      <a href="user_dashboard.html">Mi Panel</a>
      <a href="animales.html">Animales</a>
      <a href="campanas.html">Campañas</a>
    `;
  }
  
  // Construir sección de usuario
  let userSection = '';
  if (isAuthenticated) {
    userSection = `
      <a href="perfil.html" class="btn-perfil-link">Mi Perfil</a>
      <a href="notificaciones.html" class="btn-notificaciones-link">
        Notificaciones <span id="badge-notificaciones" class="badge-no-leida" style="display:none;">0</span>
      </a>
      <span class="user-name"></span>
      <button class="btn-logout">Cerrar Sesión</button>
    `;
  } else {
    userSection = `
      <a href="login.html" class="btn-login-link">Iniciar sesión</a>
      <a href="register.html" class="btn-register-link">Registrarse</a>
    `;
  }
  
  return `
  <header class="main-header">
    <div class="header-container">
      <div class="logo-container">
        <img src="images/logo.png" alt="Logo Corazón de Trapo" class="logo">
        <h1 class="title">${titleText || 'Corazón de Trapo'}</h1>
      </div>
      <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Abrir menú">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav class="nav" id="mainNav">
        ${navLinks}
      </nav>
      <div class="user">
        ${userSection}
      </div>
    </div>
  </header>`;
}

// Funciones auxiliares para verificar autenticación y roles
function isAuthenticatedUser() {
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  } catch (error) {
    return false;
  }
}

function isAdminUser() {
  try {
    const user = localStorage.getItem('user');
    if (!user) return false;
    const userData = JSON.parse(user);
    return userData.rol === 'administrador' || userData.rol === 'admin';
  } catch (error) {
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const existing = document.querySelector('.main-header');
  // Obtener título del documento o del atributo data-page-title del body
  let pageTitle = document.body.getAttribute('data-page-title');
  if (!pageTitle) {
    // Extraer título del <title> del documento, removiendo sufijos comunes
    const docTitle = document.title || 'Corazón de Trapo';
    pageTitle = docTitle.replace(' - Corazón de Trapo', '').replace('Corazón de Trapo - ', '').trim() || 'Corazón de Trapo';
  }
  const headerHtml = buildHeader(pageTitle);
  if (existing) {
    existing.outerHTML = headerHtml;
  } else {
    document.body.insertAdjacentHTML('afterbegin', headerHtml);
  }

  // Inicializar menú móvil
  initMobileMenu();
});

function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');
  
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('nav-open');
      mobileMenuToggle.classList.toggle('active');
    });

    // Cerrar menú al hacer clic en un enlace
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('nav-open');
        mobileMenuToggle.classList.remove('active');
      });
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        mainNav.classList.remove('nav-open');
        mobileMenuToggle.classList.remove('active');
      }
    });
  }
}

