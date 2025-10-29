const app = require('./backend/app');
const pool = require('./backend/config/db');
const Notificacion = require('./backend/models/notificacion');
const PreferenciasNotificacion = require('./backend/models/preferenciasNotificacion');
const User = require('./backend/models/User');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor SWGARM corriendo en http://localhost:${PORT}`);
  console.log(`📝 API disponible en http://localhost:${PORT}/api`);
  iniciarRecordatoriosSeguimiento();
});

async function iniciarRecordatoriosSeguimiento() {
  const intervaloMinutos = 5; // revisar cada 5 minutos
  const ms = intervaloMinutos * 60 * 1000;
  console.log(`⏰ Recordatorios de seguimiento activos (cada ${intervaloMinutos} min)`);

  setInterval(async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const [pendientes] = await pool.query(
        `SELECT s.*, a.nombre AS nombreAnimal, adop.idUsuario AS idUsuarioAdoptante
         FROM seguimiento s
         JOIN animal a ON s.idAnimal = a.idAnimal
         JOIN adopcion adop ON s.idAdopcion = adop.idAdopcion
         WHERE s.estado = ? AND s.fechaProgramada <= ? AND s.recordatorioEnviado = 0`,
        ['Pendiente', hoy]
      );

      if (pendientes.length === 0) return;

      // Obtener admins
      const [admins] = await pool.query('SELECT idUsuario, email FROM usuario WHERE rol = ?', ['administrador']);
      
      for (const seg of pendientes) {
        // Notificar a administradores
        if (admins.length > 0) {
          for (const admin of admins) {
            await pool.query(
              'INSERT INTO notificacion (idUsuario, tipo, mensaje, fechaEnvio, idSeguimiento) VALUES (?, ?, ?, ?, ?)',
              [admin.idUsuario, 'Seguimiento', `Seguimiento pendiente (ID ${seg.idSeguimiento}) para el animal ${seg.nombreAnimal || seg.idAnimal} programado para ${seg.fechaProgramada}`, hoy, seg.idSeguimiento]
            );
          }
        }

        // Notificar a adoptante si tiene usuario registrado y preferencias lo permiten
        if (seg.idUsuarioAdoptante) {
          const preferencias = await PreferenciasNotificacion.getByUsuario(seg.idUsuarioAdoptante);
          
          if (preferencias && preferencias.notificarRecordatorioSeguimiento && preferencias.notificarEnSistema) {
            await Notificacion.create({
              idUsuario: seg.idUsuarioAdoptante,
              tipo: 'Recordatorio Seguimiento',
              mensaje: `Recordatorio: Tienes un seguimiento programado para ${seg.nombreAnimal || 'tu mascota adoptada'} el ${seg.fechaProgramada}. Por favor, contacta con el refugio para coordinar la visita.`,
              idSeguimiento: seg.idSeguimiento
            });
          } else if (!preferencias) {
            // Si no tiene preferencias, usar valores por defecto (todos habilitados)
            await Notificacion.create({
              idUsuario: seg.idUsuarioAdoptante,
              tipo: 'Recordatorio Seguimiento',
              mensaje: `Recordatorio: Tienes un seguimiento programado para ${seg.nombreAnimal || 'tu mascota adoptada'} el ${seg.fechaProgramada}. Por favor, contacta con el refugio para coordinar la visita.`,
              idSeguimiento: seg.idSeguimiento
            });
          }
        }
      }

      // Marcar como enviado
      const ids = pendientes.map(p => p.idSeguimiento);
      await pool.query(`UPDATE seguimiento SET recordatorioEnviado = 1 WHERE idSeguimiento IN (${ids.map(() => '?').join(',')})`, ids);

      console.log(`🔔 Recordatorios generados para ${pendientes.length} seguimiento(s)`);
    } catch (err) {
      console.error('Error en recordatorios de seguimiento:', err.message);
    }
  }, ms);
}

