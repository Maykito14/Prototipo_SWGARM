const pool = require('../config/db');

exports.reporteAdopciones = async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Parámetros requeridos: desde, hasta (YYYY-MM-DD)' });
    }

    const [rows] = await pool.query(`
      SELECT ad.idAdopcion, ad.fecha, ad.contrato, ad.activa,
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

    const totales = { activas: 0, fallidas: 0 };
    const porEspecie = { activas: {}, fallidas: {} };
    const porRaza = { activas: {}, fallidas: {} };
    const porMes = { activas: {}, fallidas: {} };
    const resumenRazas = {};

    const datos = rows.map(r => {
      const estadoClave = r.activa ? 'activas' : 'fallidas';
      const especie = r.especie || 'Desconocida';
      const raza = r.raza || 'Sin especificar';

      totales[estadoClave] += 1;
      porEspecie[estadoClave][especie] = (porEspecie[estadoClave][especie] || 0) + 1;
      porRaza[estadoClave][raza] = (porRaza[estadoClave][raza] || 0) + 1;

      if (!resumenRazas[raza]) {
        resumenRazas[raza] = { activas: 0, fallidas: 0 };
      }
      resumenRazas[raza][estadoClave] += 1;

      if (r.fecha) {
        const fechaObj = new Date(r.fecha);
        const mesKey = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}`;
        porMes[estadoClave][mesKey] = (porMes[estadoClave][mesKey] || 0) + 1;
      }

      return {
        ...r,
        estadoAdopcion: r.activa ? 'Activa' : 'Fallida'
      };
    });

    const total = totales.activas + totales.fallidas;

    const topRazas = Object.entries(resumenRazas)
      .map(([raza, valores]) => ({
        raza,
        activas: valores.activas,
        fallidas: valores.fallidas,
        total: valores.activas + valores.fallidas
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const ordenarMeses = (obj) => Object.entries(obj)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([mes, cantidad]) => ({ mes, cantidad }));

    const evolucionMensual = {
      activas: ordenarMeses(porMes.activas),
      fallidas: ordenarMeses(porMes.fallidas)
    };

    res.json({
      rango: { desde, hasta },
      total,
      totalActivas: totales.activas,
      totalFallidas: totales.fallidas,
      porEspecie,
      porRaza,
      topRazas,
      evolucionMensual,
      datos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reporte de adopciones' });
  }
};

exports.reporteAltasAnimales = async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Parámetros requeridos: desde, hasta (YYYY-MM-DD)' });
    }

    const [rows] = await pool.query(
      `SELECT idAnimal, nombre, especie, raza, estado, fechaIngreso
       FROM animal
       WHERE fechaIngreso BETWEEN ? AND ?
       ORDER BY fechaIngreso ASC, idAnimal ASC`,
      [desde, hasta]
    );

    const total = rows.length;
    const porEspecie = {};
    const porEstado = {};
    const porMes = {};

    rows.forEach((r) => {
      const especie = r.especie || 'Desconocida';
      const estado = r.estado || 'Sin estado';

      porEspecie[especie] = (porEspecie[especie] || 0) + 1;
      porEstado[estado] = (porEstado[estado] || 0) + 1;

      if (r.fechaIngreso) {
        const fechaObj = new Date(r.fechaIngreso);
        if (!Number.isNaN(fechaObj.getTime())) {
          const mesKey = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}`;
          porMes[mesKey] = (porMes[mesKey] || 0) + 1;
        }
      }
    });

    const evolucionMensual = Object.entries(porMes)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([mes, cantidad]) => ({ mes, cantidad }));

    res.json({
      rango: { desde, hasta },
      total,
      porEspecie,
      porEstado,
      evolucionMensual,
      datos: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reporte de altas de animales' });
  }
};


