document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorMessage = document.getElementById('error-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const result = await api.login(email, password);
      
      // Guardar sesión
      saveSession(result.token, result.user);

      // Redirigir según rol
      if (result.user.rol === 'administrador') {
        window.location.href = 'index.html';
      } else {
        window.location.href = 'animales.html';
      }
    } catch (error) {
      errorMessage.textContent = error.message || 'Error al iniciar sesión';
      errorMessage.style.display = 'block';
    }
  });
});

