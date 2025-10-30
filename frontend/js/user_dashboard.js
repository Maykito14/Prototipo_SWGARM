// Panel de Usuario - Corazón de Trapo
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadUserStats();
});

async function loadUserInfo() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'welcome.html';
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
            const activas = solicitudes.filter(s => s.estado === 'Pendiente' || s.estado === 'En evaluación').length;
            document.getElementById('active-requests').textContent = activas;
        }
    } catch (error) {
        console.error('Error cargando estadísticas del usuario:', error);
    }
}

// Verificar que el usuario esté logueado
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'welcome.html';
    }
});
