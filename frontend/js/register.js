document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const errorMessage = document.getElementById('error-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      errorMessage.textContent = 'Las contraseñas no coinciden';
      errorMessage.style.display = 'block';
      return;
    }

    try {
      const result = await api.register(email, password);
      
      // Guardar sesión
      saveSession(result.token, result.user);

      // Redirigir
      window.location.href = 'animales.html';
    } catch (error) {
      errorMessage.textContent = error.message || 'Error al registrar usuario';
      errorMessage.style.display = 'block';
    }
  });
});

