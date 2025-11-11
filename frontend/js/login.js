document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('error-message');
  const loginLinks = document.querySelector('.login-links');

  const recoverySection = document.getElementById('recoverySection');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const backToLoginButton = document.getElementById('backToLogin');
  const recoveryMessage = document.getElementById('recovery-message');
  const requestResetForm = document.getElementById('requestResetForm');
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  const resetEmailInput = document.getElementById('resetEmail');
  const resetEmailConfirmInput = document.getElementById('resetEmailConfirm');
  const resetTokenInput = document.getElementById('resetToken');
  const resetPasswordInput = document.getElementById('resetPassword');
  const resetPasswordConfirmInput = document.getElementById('resetPasswordConfirm');
  const loginEmailInput = document.getElementById('email');

  function toggleRecovery(showRecovery) {
    if (!loginForm || !recoverySection || !loginLinks) return;
    loginForm.classList.toggle('hidden', showRecovery);
    loginLinks.classList.toggle('hidden', showRecovery);
    recoverySection.classList.toggle('hidden', !showRecovery);

    if (showRecovery) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      requestResetForm.reset();
      resetPasswordForm.reset();
      showRecoveryMessage('', null);
    }
  }

  function showRecoveryMessage(message, type = 'info') {
    if (!recoveryMessage) return;
    if (!message) {
      recoveryMessage.textContent = '';
      recoveryMessage.classList.remove('error', 'success', 'info');
      recoveryMessage.classList.add('hidden');
      return;
    }

    recoveryMessage.textContent = message;
    recoveryMessage.classList.remove('hidden', 'error', 'success', 'info');
    recoveryMessage.classList.add(type);
  }

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', () => toggleRecovery(true));
  }

  if (backToLoginButton) {
    backToLoginButton.addEventListener('click', () => toggleRecovery(false));
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = loginEmailInput.value;
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
  }

  if (requestResetForm) {
    requestResetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = resetEmailInput.value.trim();

      if (!email) {
        showRecoveryMessage('Ingrese un correo electrónico válido.', 'error');
        return;
      }

      try {
        const respuesta = await api.solicitarRecuperacionPassword(email);
        let mensaje = respuesta.message || 'Si el correo está registrado, enviaremos un código.';

        if (respuesta.debugToken) {
          mensaje += ` Código temporal: ${respuesta.debugToken}`;
          resetTokenInput.value = respuesta.debugToken;
          resetEmailConfirmInput.value = email;
        }

        showRecoveryMessage(mensaje, 'success');
      } catch (error) {
        showRecoveryMessage(error.message || 'No se pudo solicitar la recuperación.', 'error');
      }
    });
  }

  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = resetEmailConfirmInput.value.trim();
      const token = resetTokenInput.value.trim();
      const nuevaPassword = resetPasswordInput.value.trim();
      const confirmarPassword = resetPasswordConfirmInput.value.trim();

      if (!email || !token || !nuevaPassword || !confirmarPassword) {
        showRecoveryMessage('Todos los campos son obligatorios.', 'error');
        return;
      }

      if (nuevaPassword !== confirmarPassword) {
        showRecoveryMessage('La nueva contraseña y su confirmación no coinciden.', 'error');
        return;
      }

      if (nuevaPassword.length < 6) {
        showRecoveryMessage('La nueva contraseña debe tener al menos 6 caracteres.', 'error');
        return;
      }

      try {
        const respuesta = await api.restablecerPassword({
          email,
          token,
          nuevaPassword,
          confirmarPassword,
        });

        showRecoveryMessage(respuesta.message || 'Contraseña restablecida correctamente.', 'success');
        loginEmailInput.value = email;
        resetPasswordForm.reset();
        setTimeout(() => {
          toggleRecovery(false);
          errorMessage.textContent = 'Contraseña actualizada correctamente. Ingrese con sus nuevos datos.';
          errorMessage.style.display = 'block';
          errorMessage.style.color = '#2e7d32';
        }, 1500);
      } catch (error) {
        showRecoveryMessage(error.message || 'No se pudo restablecer la contraseña.', 'error');
      }
    });
  }
});

