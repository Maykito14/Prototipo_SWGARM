document.addEventListener('DOMContentLoaded', () => {
  requireAdmin();

  const tablaUsuarios = document.getElementById('tablaUsuarios');
  const modalRol = document.getElementById('modalRol');
  const formCambiarRol = document.getElementById('formCambiarRol');
  const nuevoRolSelect = document.getElementById('nuevoRol');
  let usuarioActual = null;

  cargarUsuarios();

  formCambiarRol.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nuevoRol = nuevoRolSelect.value;
    
    if (!nuevoRol || !usuarioActual) {
      alert('Seleccione un rol válido');
      return;
    }

    try {
      const response = await api.actualizarRol(usuarioActual.idUsuario, nuevoRol);
      alert(response.message);
      cerrarModalRol();
      cargarUsuarios();
    } catch (error) {
      alert(error.message || 'Error al actualizar el rol');
    }
  });

  async function cargarUsuarios() {
    try {
      const usuarios = await api.getUsuarios();
      const tbody = tablaUsuarios.querySelector('tbody');
      
      if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">No hay usuarios registrados</td></tr>';
        return;
      }

      tbody.innerHTML = usuarios.map(u => `
        <tr>
          <td>${u.idUsuario}</td>
          <td>${escapeHtml(u.email)}</td>
          <td><span class="badge-rol ${u.rol === 'administrador' ? 'admin' : 'adoptante'}">${u.rol}</span></td>
          <td>
            <button class="btn-table editar" onclick="abrirModalRol(${u.idUsuario})">✏️ Cambiar Rol</button>
          </td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      const tbody = tablaUsuarios.querySelector('tbody');
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#d32f2f;">Error al cargar usuarios</td></tr>';
    }
  }

  window.abrirModalRol = async function(idUsuario) {
    try {
      const usuarios = await api.getUsuarios();
      usuarioActual = usuarios.find(u => u.idUsuario === idUsuario);
      
      if (!usuarioActual) {
        alert('Usuario no encontrado');
        return;
      }

      document.getElementById('usuarioInfo').innerHTML = `
        <p><strong>Email:</strong> ${escapeHtml(usuarioActual.email)}</p>
        <p><strong>Rol actual:</strong> <span class="badge-rol ${usuarioActual.rol === 'administrador' ? 'admin' : 'adoptante'}">${usuarioActual.rol}</span></p>
      `;
      
      nuevoRolSelect.value = usuarioActual.rol;
      modalRol.style.display = 'block';
    } catch (error) {
      alert('Error al cargar información del usuario');
    }
  };

  window.cerrarModalRol = function() {
    modalRol.style.display = 'none';
    formCambiarRol.reset();
    usuarioActual = null;
  };
});

function escapeHtml(text) {
  if (text == null) return '';
  return text.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

