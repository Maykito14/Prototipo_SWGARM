// Panel de Administración - Corazón de Trapo
document.addEventListener('DOMContentLoaded', function() {
    loadQuickStats();
});

async function loadQuickStats() {
    try {
        // Cargar estadísticas rápidas
        const stats = await Promise.all([
            fetch('/api/animales/count').then(res => res.json()),
            fetch('/api/solicitudes/count?estado=Pendiente').then(res => res.json()),
            fetch('/api/adopciones/count?mes=actual').then(res => res.json()),
            fetch('/api/usuarios/count?activos=true').then(res => res.json())
        ]);

        // Actualizar los números en la interfaz
        document.getElementById('total-animales').textContent = stats[0].count || 0;
        document.getElementById('solicitudes-pendientes').textContent = stats[1].count || 0;
        document.getElementById('adopciones-mes').textContent = stats[2].count || 0;
        document.getElementById('usuarios-activos').textContent = stats[3].count || 0;

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        // Mostrar valores por defecto en caso de error
        document.getElementById('total-animales').textContent = '0';
        document.getElementById('solicitudes-pendientes').textContent = '0';
        document.getElementById('adopciones-mes').textContent = '0';
        document.getElementById('usuarios-activos').textContent = '0';
    }
}

// Verificar que el usuario sea administrador
document.addEventListener('DOMContentLoaded', function() {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
        // Redirigir a la página de bienvenida si no es admin
        window.location.href = 'welcome.html';
    }
});
