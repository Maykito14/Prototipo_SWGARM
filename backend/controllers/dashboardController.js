const pool = require('../config/db');

exports.obtenerEstadisticas = async (req, res) => {
  try {
    const [
      [totalAnimalesRow],
      [solicitudesPendientesRow],
      [adopcionesMesRow],
      [usuariosActivosRow],
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM animal'),
      pool.query(
        "SELECT COUNT(*) AS total FROM solicitud WHERE estado = 'Pendiente'"
      ),
      pool.query(
        `SELECT COUNT(*) AS total
         FROM adopcion
         WHERE activa = 1
           AND fecha IS NOT NULL
           AND MONTH(fecha) = MONTH(CURDATE())
           AND YEAR(fecha) = YEAR(CURDATE())`
      ),
      pool.query(
        `SELECT COUNT(*) AS total
         FROM usuario
         WHERE (bloqueoPermanente = 0 OR bloqueoPermanente IS NULL)
           AND (cuentaBloqueada = 0 OR cuentaBloqueada IS NULL)`
      ),
    ]);

    res.json({
      totalAnimales: totalAnimalesRow[0]?.total || 0,
      solicitudesPendientes: solicitudesPendientesRow[0]?.total || 0,
      adopcionesMes: adopcionesMesRow[0]?.total || 0,
      usuariosActivos: usuariosActivosRow[0]?.total || 0,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
  }
};

exports.obtenerMetricasPublicas = async (req, res) => {
  try {
    const [
      [totalAnimalesRow],
      [adopcionesActivasRow],
      [solicitudesTotalesRow],
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM animal'),
      pool.query('SELECT COUNT(*) AS total FROM adopcion WHERE activa = 1'),
      pool.query('SELECT COUNT(*) AS total FROM solicitud'),
    ]);

    res.json({
      animalesRegistrados: totalAnimalesRow[0]?.total || 0,
      adopcionesActivas: adopcionesActivasRow[0]?.total || 0,
      solicitudesTotales: solicitudesTotalesRow[0]?.total || 0,
    });
  } catch (error) {
    console.error('Error al obtener métricas públicas:', error);
    res.status(500).json({ error: 'Error al obtener métricas públicas' });
  }
};


