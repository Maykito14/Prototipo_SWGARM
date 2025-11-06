// Panel de Usuario - Corazón de Trapo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Verificar que no sea admin (debe usar admin_dashboard)
    const user = getSession().user;
    if (user && (user.rol === 'administrador' || user.rol === 'admin')) {
        window.location.href = 'admin_dashboard.html';
        return;
    }
    
    loadUserInfo();
    loadUserStats();
});

async function loadUserInfo() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }

        const response = await fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            document.getElementById('user-name').textContent = `${user.nombre} ${user.apellido}`;
            document.getElementById('user-email').textContent = user.email;
            document.getElementById('last-activity').textContent = new Date().toLocaleDateString();
        }
    } catch (error) {
        console.error('Error cargando información del usuario:', error);
    }
}

async function loadUserStats() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Cargar solicitudes activas del usuario
        const response = await fetch('/api/solicitudes/usuario', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const solicitudes = await response.json();
            const activas = solicitudes.filter(s => s.estado === 'Pendiente').length;
            document.getElementById('active-requests').textContent = activas;
        }
    } catch (error) {
        console.error('Error cargando estadísticas del usuario:', error);
    }
}

