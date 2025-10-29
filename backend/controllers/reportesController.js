const pool = require('../config/db');

exports.reporteAdopciones = async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Parámetros requeridos: desde, hasta (YYYY-MM-DD)' });
    }

    const [rows] = await pool.query(`
      SELECT ad.idAdopcion, ad.fecha, ad.contrato,
             s.idSolicitud, s.idAdoptante, s.idAnimal,
             a.nombre AS nombreAdoptante, a.apellido AS apellidoAdoptante,
             an.nombre AS nombreAnimal, an.especie, an.raza
      FROM adopcion ad
      JOIN solicitud s ON ad.idSolicitud = s.idSolicitud
      JOIN adoptante a ON s.idAdoptante = a.idAdoptante
      JOIN animal an ON s.idAnimal = an.idAnimal
      WHERE ad.fecha BETWEEN ? AND ?
      ORDER BY ad.fecha ASC, ad.idAdopcion ASC
    `, [desde, hasta]);

    // Agregados simples
    const total = rows.length;
    const porEspecie = {};
    const porRaza = {};
    const porMes = {};
    
    rows.forEach(r => {
      const esp = r.especie || 'Desconocida';
      porEspecie[esp] = (porEspecie[esp] || 0) + 1;
      
      const raza = r.raza || 'Sin especificar';
      porRaza[raza] = (porRaza[raza] || 0) + 1;
      
      if (r.fecha) {
        const fechaObj = new Date(r.fecha);
        const mesKey = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}`;
        porMes[mesKey] = (porMes[mesKey] || 0) + 1;
      }
    });

    // Top 5 razas más adoptadas
    const topRazas = Object.entries(porRaza)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([raza, cantidad]) => ({ raza, cantidad }));

    // Evolución por mes (ordenado)
    const evolucionMensual = Object.entries(porMes)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([mes, cantidad]) => ({ mes, cantidad }));

    res.json({
      rango: { desde, hasta },
      total,
      porEspecie,
      porRaza,
      topRazas,
      evolucionMensual,
      datos: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reporte de adopciones' });
  }
};


