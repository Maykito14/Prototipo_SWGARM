function buildHeader(titleText) {
  return `
  <header class="main-header">
    <div class="header-container">
      <div class="logo-container">
        <img src="images/logo.png" alt="Logo Corazón de Trapo" class="logo">
        <h1 class="title">${titleText || 'Corazón de Trapo'}</h1>
      </div>
      <nav class="nav">
        <a href="index.html">Inicio</a>
        <a href="animales.html">Animales</a>
        <a href="formulario-adopción.html" data-role="public">Postular adopción</a>
        <a href="admin_solicitudes.html" data-role="admin">Evaluar Solicitudes</a>
        <a href="admin_animales.html" data-role="admin">Gestión Animales</a>
        <a href="admin_salud.html" data-role="admin">Gestión Salud</a>
        <a href="admin_estados.html" data-role="admin">Gestión Estados</a>
        <a href="admin_seguimiento.html" data-role="admin">Seguimiento</a>
        <a href="admin_reportes.html" data-role="admin">Reportes</a>
        <a href="admin_usuarios.html" data-role="admin">Gestión Usuarios</a>
        <a href="admin_campanas.html" data-role="admin">Gestión Campañas</a>
      </nav>
      <div class="user">
        <a href="login.html" class="btn-login-link">Iniciar sesión</a>
        <a href="perfil.html" class="btn-perfil-link" data-role="authenticated" style="display:none;">Mi Perfil</a>
        <a href="notificaciones.html" class="btn-notificaciones-link" data-role="authenticated" style="display:none;">
          Notificaciones <span id="badge-notificaciones" class="badge-no-leida" style="display:none;">0</span>
        </a>
        <span class="user-name"></span>
        <button class="btn-logout">Cerrar Sesión</button>
      </div>
    </div>
  </header>`;
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
});


