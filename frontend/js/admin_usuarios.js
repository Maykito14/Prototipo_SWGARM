document.addEventListener('DOMContentLoaded', () => {
  requireAdmin();

  const tablaUsuarios = document.getElementById('tablaUsuarios');
  const paginacionUsuariosEl = document.getElementById('paginacionUsuarios');
  const modalRol = document.getElementById('modalRol');
  const formCambiarRol = document.getElementById('formCambiarRol');
  const nuevoRolSelect = document.getElementById('nuevoRol');
  let usuarioActual = null;
  let todosLosUsuarios = []; // Almacenar todos los usuarios para filtrar
  let usuariosFiltrados = [];
  let paginaActual = 1;
  const registrosPorPagina = 10;

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
      todosLosUsuarios = await api.getUsuarios();
      usuariosFiltrados = [...todosLosUsuarios];
      paginaActual = 1;
      mostrarUsuarios();
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      const tbody = tablaUsuarios.querySelector('tbody');
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:#d32f2f;">Error al cargar usuarios</td></tr>';
    }
  }

  function mostrarUsuarios() {
    const tbody = tablaUsuarios.querySelector('tbody');
    if (!usuariosFiltrados || usuariosFiltrados.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px;">No hay usuarios que coincidan con los filtros</td></tr>';
      actualizarPaginacion();
      return;
    }

    const totalRegistros = usuariosFiltrados.length;
    const totalPaginas = Math.max(Math.ceil(totalRegistros / registrosPorPagina), 1);
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const pagina = usuariosFiltrados.slice(inicio, inicio + registrosPorPagina);

    tbody.innerHTML = pagina.map(u => {
      const estaBloqueado = u.bloqueoPermanente || (u.cuentaBloqueada && !u.bloqueoPermanente);
      const estadoBloqueo = u.bloqueoPermanente ? 'Permanente' : (u.cuentaBloqueada ? 'Temporal' : '');
      
      return `
      <tr>
        <td>${u.idUsuario}</td>
        <td>${escapeHtml(u.email || '-')}</td>
        <td>${escapeHtml(u.nombre || '-')}</td>
        <td>${escapeHtml(u.apellido || '-')}</td>
        <td>${escapeHtml(u.telefono || '-')}</td>
        <td>${escapeHtml(u.direccion || '-')}</td>
        <td>
          <span class="badge-rol ${u.rol === 'administrador' ? 'admin' : 'adoptante'}">${u.rol}</span>
          ${estadoBloqueo ? `<span class="badge-rol" style="background-color: #e74c3c; margin-left: 5px;">Bloqueado (${estadoBloqueo})</span>` : ''}
        </td>
        <td>
          <button class="btn-table editar" onclick="abrirModalRol(${u.idUsuario})" title="Cambiar Rol">✏️ Rol</button>
          <button class="btn-table" onclick="blanquearPassword(${u.idUsuario})" title="Blanquear Contraseña" style="background-color: #f39c12; color: white;">🔑 Password</button>
          ${u.bloqueoPermanente 
            ? `<button class="btn-table" onclick="desbloquearPermanentemente(${u.idUsuario})" title="Desbloquear Cuenta" style="background-color: #27ae60; color: white;">🔓 Desbloquear</button>`
            : `<button class="btn-table" onclick="bloquearPermanentemente(${u.idUsuario})" title="Bloquear Cuenta Permanentemente" style="background-color: #e74c3c; color: white;">🚫 Bloquear</button>`
          }
        </td>
      </tr>
    `;
    }).join('');

    actualizarPaginacion();
  }

  // Función global para filtrar usuarios
  window.filtrarUsuarios = function() {
    const filterEmail = document.getElementById('filterEmail').value.toLowerCase().trim();
    const filterNombre = document.getElementById('filterNombre').value.toLowerCase().trim();
    const filterApellido = document.getElementById('filterApellido').value.toLowerCase().trim();
    const filterTelefono = document.getElementById('filterTelefono').value.toLowerCase().trim();
    const filterDireccion = document.getElementById('filterDireccion').value.toLowerCase().trim();
    const filterRol = document.getElementById('filterRol').value.toLowerCase().trim();

    usuariosFiltrados = todosLosUsuarios.filter(u => {
      const email = (u.email || '').toLowerCase();
      const nombre = (u.nombre || '').toLowerCase();
      const apellido = (u.apellido || '').toLowerCase();
      const telefono = (u.telefono || '').toLowerCase();
      const direccion = (u.direccion || '').toLowerCase();
      const rol = (u.rol || '').toLowerCase();

      const coincideEmail = !filterEmail || email.includes(filterEmail);
      const coincideNombre = !filterNombre || nombre.includes(filterNombre);
      const coincideApellido = !filterApellido || apellido.includes(filterApellido);
      const coincideTelefono = !filterTelefono || telefono.includes(filterTelefono);
      const coincideDireccion = !filterDireccion || direccion.includes(filterDireccion);
      const coincideRol = !filterRol || rol === filterRol;

      return coincideEmail && coincideNombre && coincideApellido && coincideTelefono && coincideDireccion && coincideRol;
    });

    paginaActual = 1;
    mostrarUsuarios();
  };

  window.abrirModalRol = async function(idUsuario) {
    try {
      // Si no hay usuarios cargados, cargarlos primero
      if (todosLosUsuarios.length === 0) {
        await cargarUsuarios();
      }
      
      usuarioActual = todosLosUsuarios.find(u => u.idUsuario === idUsuario);
      
      if (!usuarioActual) {
        alert('Usuario no encontrado');
        return;
      }

      document.getElementById('usuarioInfo').innerHTML = `
        <p><strong>Email:</strong> ${escapeHtml(usuarioActual.email || '-')}</p>
        ${usuarioActual.nombre ? `<p><strong>Nombre:</strong> ${escapeHtml(usuarioActual.nombre)}</p>` : ''}
        ${usuarioActual.apellido ? `<p><strong>Apellido:</strong> ${escapeHtml(usuarioActual.apellido)}</p>` : ''}
        ${usuarioActual.telefono ? `<p><strong>Teléfono:</strong> ${escapeHtml(usuarioActual.telefono)}</p>` : ''}
        ${usuarioActual.direccion ? `<p><strong>Dirección:</strong> ${escapeHtml(usuarioActual.direccion)}</p>` : ''}
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

  // Función para blanquear contraseña
  window.blanquearPassword = async function(idUsuario) {
    if (!confirm('¿Está seguro de que desea blanquear la contraseña de este usuario?\n\nSe generará una contraseña temporal que se mostrará después de confirmar.')) {
      return;
    }

    try {
      const response = await api.blanquearPassword(idUsuario);
      const passwordTemporal = response.passwordTemporal;
      
      alert(`Contraseña blanqueada exitosamente.\n\nContraseña temporal: ${passwordTemporal}\n\nIMPORTANTE: Guarde esta contraseña y compártala con el usuario de forma segura.`);
      cargarUsuarios();
    } catch (error) {
      alert('Error al blanquear contraseña: ' + (error.message || 'Error desconocido'));
    }
  };

  // Función para bloquear permanentemente
  window.bloquearPermanentemente = async function(idUsuario) {
    const usuario = todosLosUsuarios.find(u => u.idUsuario === idUsuario);
    if (!usuario) {
      alert('Usuario no encontrado');
      return;
    }

    if (!confirm(`¿Está seguro de que desea bloquear permanentemente la cuenta de ${usuario.email}?\n\nEsta acción impedirá que el usuario pueda iniciar sesión hasta que un administrador la desbloquee.`)) {
      return;
    }

    try {
      await api.bloquearPermanentemente(idUsuario);
      alert('Cuenta bloqueada permanentemente');
      cargarUsuarios();
    } catch (error) {
      alert('Error al bloquear cuenta: ' + (error.message || 'Error desconocido'));
    }
  };

  // Función para desbloquear permanentemente
  window.desbloquearPermanentemente = async function(idUsuario) {
    const usuario = todosLosUsuarios.find(u => u.idUsuario === idUsuario);
    if (!usuario) {
      alert('Usuario no encontrado');
      return;
    }

    if (!confirm(`¿Está seguro de que desea desbloquear la cuenta de ${usuario.email}?`)) {
      return;
    }

    try {
      await api.desbloquearPermanentemente(idUsuario);
      alert('Cuenta desbloqueada exitosamente');
      cargarUsuarios();
    } catch (error) {
      alert('Error al desbloquear cuenta: ' + (error.message || 'Error desconocido'));
    }
  };

  function actualizarPaginacion() {
    if (!paginacionUsuariosEl) return;
    const totalRegistros = usuariosFiltrados.length;
    const totalPaginas = Math.max(Math.ceil(totalRegistros / registrosPorPagina), 1);

    if (totalRegistros === 0) {
      paginacionUsuariosEl.innerHTML = '';
      return;
    }

    paginacionUsuariosEl.innerHTML = `
      <button class="btn btn-secondary" ${paginaActual <= 1 ? 'disabled' : ''} onclick="paginaAnteriorUsuarios()">«</button>
      <span>Página ${paginaActual} de ${totalPaginas} (${totalRegistros} registros)</span>
      <button class="btn btn-secondary" ${paginaActual >= totalPaginas ? 'disabled' : ''} onclick="paginaSiguienteUsuarios()">»</button>
    `;
  }

  window.paginaAnteriorUsuarios = function() {
    if (paginaActual > 1) {
      paginaActual--;
      mostrarUsuarios();
      const contenedor = tablaUsuarios.closest('.table-container-paginada')?.querySelector('.table-scrollable');
      if (contenedor) contenedor.scrollTop = 0;
    }
  };

  window.paginaSiguienteUsuarios = function() {
    const totalPaginas = Math.ceil(usuariosFiltrados.length / registrosPorPagina);
    if (paginaActual < totalPaginas) {
      paginaActual++;
      mostrarUsuarios();
      const contenedor = tablaUsuarios.closest('.table-container-paginada')?.querySelector('.table-scrollable');
      if (contenedor) contenedor.scrollTop = 0;
    }
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

