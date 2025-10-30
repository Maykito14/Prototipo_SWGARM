document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorMessage = document.getElementById('error-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Limpiar mensaje anterior
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';

    // Validaciones básicas
    if (!email || !password) {
      errorMessage.textContent = 'Por favor, complete todos los campos';
      errorMessage.style.display = 'block';
      return;
    }

    try {
      const result = await api.login(email, password);
      
      // Guardar sesión
      saveSession(result.token, result.user);

      // Redirigir al dashboard correcto
      redirectToDashboard();
    } catch (error) {
      let mensajeError = error.message || 'Error al iniciar sesión';
      
      // Manejar errores específicos del bloqueo
      if (error.minutosRestantes !== undefined) {
        const minutos = error.minutosRestantes;
        if (minutos > 0) {
          mensajeError = `Cuenta bloqueada temporalmente. Intente nuevamente en ${minutos} minuto(s).`;
        } else {
          mensajeError = 'Cuenta bloqueada temporalmente. Intente nuevamente más tarde.';
        }
      } else if (error.intentosRestantes !== undefined && error.intentosRestantes > 0) {
        mensajeError = `Credenciales inválidas. Le quedan ${error.intentosRestantes} intento(s) antes del bloqueo.`;
      }
      
      errorMessage.textContent = mensajeError;
      errorMessage.style.display = 'block';
      errorMessage.style.color = '#d32f2f';
    }
  });
});

