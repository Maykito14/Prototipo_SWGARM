// Panel de Administración - Corazón de Trapo
document.addEventListener('DOMContentLoaded', async function() {
    requireAdmin();
    await loadQuickStats();
});

async function loadQuickStats() {
    try {
        const stats = await api.getDashboardStats();
        const {
            totalAnimales = 0,
            solicitudesPendientes = 0,
            adopcionesMes = 0,
            usuariosActivos = 0,
        } = stats || {};

        document.getElementById('total-animales').textContent = totalAnimales;
        document.getElementById('solicitudes-pendientes').textContent = solicitudesPendientes;
        document.getElementById('adopciones-mes').textContent = adopcionesMes;
        document.getElementById('usuarios-activos').textContent = usuariosActivos;

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        document.getElementById('total-animales').textContent = '0';
        document.getElementById('solicitudes-pendientes').textContent = '0';
        document.getElementById('adopciones-mes').textContent = '0';
        document.getElementById('usuarios-activos').textContent = '0';
    }
}

