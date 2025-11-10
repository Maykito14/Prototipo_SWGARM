document.addEventListener('DOMContentLoaded', () => {
  requireAdmin();

  const fechaDesde = document.getElementById('fechaDesde');
  const fechaHasta = document.getElementById('fechaHasta');
  const btnGenerar = document.getElementById('btnGenerar');
  const btnCSV = document.getElementById('btnCSV');
  const btnPDF = document.getElementById('btnPDF');
  const tablaAnimalesBody = document.querySelector('#tablaAnimales tbody');
  const tablaBody = document.querySelector('#tablaReporte tbody');
  const paginacionAdopcionesEl = document.getElementById('paginacionAdopciones');
  const tablaRazasBody = document.querySelector('#tablaRazas tbody');
  const totalAdopEl = document.getElementById('totalAdop');
  const totalActivasEl = document.getElementById('totalActivas');
  const totalFallidasEl = document.getElementById('totalFallidas');
  const rangoEl = document.getElementById('rango');
  const promedioMesEl = document.getElementById('promedioMes');
  const porEspecieActivasEl = document.getElementById('porEspecieActivas');
  const porEspecieFallidasEl = document.getElementById('porEspecieFallidas');
  const totalAltasAnimalesEl = document.getElementById('totalAltasAnimales');
  const promedioAltasMesEl = document.getElementById('promedioAltasMes');
  const porEspecieAltasEl = document.getElementById('porEspecieAltas');
  const porEstadoAltasEl = document.getElementById('porEstadoAltas');
  let datosActuales = null;
  let datosAnimales = null;
  let datosTablaAdopciones = [];
  let paginaActualAdopciones = 1;
  const registrosPorPaginaAdopciones = 4;
  let chartEspecie = null;
  let chartEvolucion = null;
  let chartAnimalesEspecie = null;
  let chartAnimalesEvolucion = null;

  // Rango por defecto: último mes
  const hoy = new Date();
  const hace30 = new Date(hoy.getTime() - 29 * 24 * 60 * 60 * 1000);
  fechaDesde.value = hace30.toISOString().split('T')[0];
  fechaHasta.value = hoy.toISOString().split('T')[0];

  btnGenerar.addEventListener('click', async () => {
    await generar();
  });
  btnCSV.addEventListener('click', exportarCSV);
  btnPDF.addEventListener('click', exportarPDF);

  generar();

  async function generar() {
    try {
      const d = fechaDesde.value;
      const h = fechaHasta.value;
      if (!d || !h) { alert('Seleccione rango de fechas'); return; }
      const [altas, adopciones] = await Promise.all([
        api.getReporteAltasAnimales(d, h),
        api.getReporteAdopciones(d, h)
      ]);

      datosAnimales = altas;
      renderResumenAnimales(altas);
      renderTablaAnimales(altas.datos);
      renderChartAnimalesEspecie(altas.porEspecie);
      renderChartAnimalesEvolucion(altas.evolucionMensual);

      datosActuales = adopciones;
      renderResumen(adopciones);
      renderTabla(adopciones.datos);
      renderTablaRazas(adopciones.topRazas, adopciones.total);
      renderChartEspecie(adopciones.porEspecie);
      renderChartEvolucion(adopciones.evolucionMensual);
    } catch (e) {
      alert(e.message || 'Error al generar reporte');
    }
  }

  function renderResumenAnimales(res) {
    totalAltasAnimalesEl.textContent = res.total || 0;
    const meses = res.evolucionMensual?.length || 0;
    const promedio = meses > 0 ? (res.total / meses).toFixed(1) : (res.total || 0);
    promedioAltasMesEl.textContent = promedio;

    const renderDistribucion = (obj) => {
      const entries = Object.entries(obj || {});
      if (entries.length === 0) return '<div>Sin datos</div>';
      return entries.map(([k, v]) => `<div>${escapeHtml(k)}: <strong>${v}</strong></div>`).join('');
    };

    porEspecieAltasEl.innerHTML = renderDistribucion(res.porEspecie);
    porEstadoAltasEl.innerHTML = renderDistribucion(res.porEstado);
  }

  function renderTablaAnimales(rows) {
    if (!rows || rows.length === 0) {
      tablaAnimalesBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:12px;">Sin registros en el período</td></tr>';
      return;
    }
    tablaAnimalesBody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.idAnimal}</td>
        <td>${formatearFecha(r.fechaIngreso)}</td>
        <td>${escapeHtml(r.nombre) || '-'}</td>
        <td>${escapeHtml(r.especie) || '-'}</td>
        <td>${escapeHtml(r.raza) || '-'}</td>
        <td>${escapeHtml(r.estado) || '-'}</td>
      </tr>
    `).join('');
  }

  function renderResumen(res) {
    totalAdopEl.textContent = res.total;
    totalActivasEl.textContent = res.totalActivas || 0;
    totalFallidasEl.textContent = res.totalFallidas || 0;
    rangoEl.textContent = `${res.rango.desde} a ${res.rango.hasta}`;

    const renderDistribucion = (obj) => {
      const entries = Object.entries(obj || {});
      if (entries.length === 0) return '<div>Sin datos</div>';
      return entries.map(([k, v]) => `<div>${escapeHtml(k)}: <strong>${v}</strong></div>`).join('');
    };

    porEspecieActivasEl.innerHTML = renderDistribucion(res.porEspecie?.activas);
    porEspecieFallidasEl.innerHTML = renderDistribucion(res.porEspecie?.fallidas);

    const mesesConDatos = new Set([
      ...((res.evolucionMensual?.activas || []).map(e => e.mes)),
      ...((res.evolucionMensual?.fallidas || []).map(e => e.mes))
    ]);
    const totalMeses = mesesConDatos.size || 1;
    const promedio = totalMeses > 0 ? (res.totalActivas / totalMeses).toFixed(1) : '0';
    promedioMesEl.textContent = promedio;
  }

  function renderTablaRazas(topRazas, total) {
    if (!topRazas || topRazas.length === 0) {
      tablaRazasBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:12px;">Sin datos de razas</td></tr>';
      return;
    }
    tablaRazasBody.innerHTML = topRazas.map((item, idx) => {
      const porcentaje = total > 0 ? ((item.total / total) * 100).toFixed(1) : '0';
      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${escapeHtml(item.raza)}</td>
          <td>${item.activas}</td>
          <td>${item.fallidas}</td>
          <td>${item.total}</td>
          <td>${porcentaje}%</td>
        </tr>
      `;
    }).join('');
  }

  function renderTabla(rows) {
    datosTablaAdopciones = Array.isArray(rows) ? rows : [];
    paginaActualAdopciones = 1;
    renderTablaAdopcionesPagina();
  }

  function renderTablaAdopcionesPagina() {
    const totalRegistros = datosTablaAdopciones.length;
    if (totalRegistros === 0) {
      tablaBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:12px;">Sin registros en el período</td></tr>';
      actualizarPaginacionAdopciones(0, 0);
      return;
    }

    const totalPaginas = Math.max(Math.ceil(totalRegistros / registrosPorPaginaAdopciones), 1);
    const inicio = (paginaActualAdopciones - 1) * registrosPorPaginaAdopciones;
    const pagina = datosTablaAdopciones.slice(inicio, inicio + registrosPorPaginaAdopciones);

    tablaBody.innerHTML = pagina.map(r => `
      <tr>
        <td>${r.idAdopcion}</td>
        <td>${formatearFecha(r.fecha)}</td>
        <td>${r.nombreAdoptante} ${r.apellidoAdoptante}</td>
        <td>${r.nombreAnimal}</td>
        <td>${r.especie || '-'}</td>
        <td>${r.raza || '-'}</td>
        <td>${r.estadoAdopcion}</td>
        <td>${escapeHtml(r.contrato) || '-'}</td>
      </tr>
    `).join('');

    actualizarPaginacionAdopciones(paginaActualAdopciones, totalPaginas, totalRegistros);
  }

  function actualizarPaginacionAdopciones(pagina, totalPaginas, totalRegistros = datosTablaAdopciones.length) {
    if (!paginacionAdopcionesEl) return;
    if (totalRegistros === 0) {
      paginacionAdopcionesEl.innerHTML = '';
      return;
    }

    paginacionAdopcionesEl.innerHTML = `
      <button class="btn btn-secondary" ${pagina <= 1 ? 'disabled' : ''} onclick="paginaAnteriorAdopciones()">«</button>
      <span>Página ${pagina} de ${totalPaginas} (${totalRegistros} registros)</span>
      <button class="btn btn-secondary" ${pagina >= totalPaginas ? 'disabled' : ''} onclick="paginaSiguienteAdopciones()">»</button>
    `;
  }

  window.paginaAnteriorAdopciones = function () {
    if (paginaActualAdopciones > 1) {
      paginaActualAdopciones--;
      renderTablaAdopcionesPagina();
      const contenedorTabla = document.getElementById('tablaReporte')?.parentElement;
      if (contenedorTabla) contenedorTabla.scrollTop = 0;
    }
  };

  window.paginaSiguienteAdopciones = function () {
    const totalPaginas = Math.ceil(datosTablaAdopciones.length / registrosPorPaginaAdopciones);
    if (paginaActualAdopciones < totalPaginas) {
      paginaActualAdopciones++;
      renderTablaAdopcionesPagina();
      const contenedorTabla = document.getElementById('tablaReporte')?.parentElement;
      if (contenedorTabla) contenedorTabla.scrollTop = 0;
    }
  };

  function renderChartEspecie(porEspecie) {
    const especiesSet = new Set([
      ...Object.keys(porEspecie?.activas || {}),
      ...Object.keys(porEspecie?.fallidas || {})
    ]);
    const labels = Array.from(especiesSet);
    const dataActivas = labels.map(l => porEspecie?.activas?.[l] || 0);
    const dataFallidas = labels.map(l => porEspecie?.fallidas?.[l] || 0);
    const ctx = document.getElementById('chartEspecie');
    if (chartEspecie) chartEspecie.destroy();
    chartEspecie = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Activas', data: dataActivas, backgroundColor: '#2f855a' },
          { label: 'Fallidas', data: dataFallidas, backgroundColor: '#c53030' }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  function renderChartAnimalesEspecie(porEspecie) {
    const labels = Object.keys(porEspecie || {});
    const values = Object.values(porEspecie || {});
    const ctx = document.getElementById('chartAnimalesEspecie');
    if (chartAnimalesEspecie) chartAnimalesEspecie.destroy();
    chartAnimalesEspecie = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Altas',
          data: values,
          backgroundColor: '#805ad5'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  function renderChartAnimalesEvolucion(evolucionMensual) {
    const labels = (evolucionMensual || []).map(e => {
      const [year, month] = e.mes.split('-');
      const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${mesesNombres[parseInt(month, 10) - 1]} ${year}`;
    });
    const values = (evolucionMensual || []).map(e => e.cantidad);
    const ctx = document.getElementById('chartAnimalesEvolucion');
    if (chartAnimalesEvolucion) chartAnimalesEvolucion.destroy();
    chartAnimalesEvolucion = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Altas',
          data: values,
          borderColor: '#38a169',
          backgroundColor: 'rgba(56, 161, 105, 0.15)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  function renderChartEvolucion(evolucionMensual) {
    const mapaActivas = new Map((evolucionMensual?.activas || []).map(e => [e.mes, e.cantidad]));
    const mapaFallidas = new Map((evolucionMensual?.fallidas || []).map(e => [e.mes, e.cantidad]));

    const mesesSet = new Set([
      ...mapaActivas.keys(),
      ...mapaFallidas.keys()
    ]);

    if (mesesSet.size === 0) {
      const ctx = document.getElementById('chartEvolucion');
      if (chartEvolucion) chartEvolucion.destroy();
      chartEvolucion = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: { responsive: true }
      });
      return;
    }

    const mesesOrdenados = Array.from(mesesSet).sort((a, b) => a.localeCompare(b));
    const mesesLabels = mesesOrdenados.map(mes => {
      const [year, month] = mes.split('-');
      const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${mesesNombres[parseInt(month, 10) - 1]} ${year}`;
    });
    const dataActivas = mesesOrdenados.map(mes => mapaActivas.get(mes) || 0);
    const dataFallidas = mesesOrdenados.map(mes => mapaFallidas.get(mes) || 0);
    const ctx = document.getElementById('chartEvolucion');
    if (chartEvolucion) chartEvolucion.destroy();
    chartEvolucion = new Chart(ctx, {
      type: 'line',
      data: {
        labels: mesesLabels,
        datasets: [{
          label: 'Activas',
          data: dataActivas,
          borderColor: '#3182ce',
          backgroundColor: 'rgba(49, 130, 206, 0.1)',
          tension: 0.4,
          fill: true
        }, {
          label: 'Fallidas',
          data: dataFallidas,
          borderColor: '#dd6b20',
          backgroundColor: 'rgba(221, 107, 32, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  function exportarCSV() {
    if (!datosActuales) return;
    const rows = datosActuales.datos || [];
    const encabezados = ['ID','Fecha','Adoptante','Animal','Especie','Raza','Estado','Contrato'];
    const lineas = [encabezados.join(',')].concat(rows.map(r => [
      r.idAdopcion,
      r.fecha,
      `${r.nombreAdoptante} ${r.apellidoAdoptante}`.replace(/,/g,' '),
      (r.nombreAnimal||'').replace(/,/g,' '),
      (r.especie||'').replace(/,/g,' '),
      (r.raza||'').replace(/,/g,' '),
      r.estadoAdopcion,
      (r.contrato||'').toString().replace(/,/g,' ')
    ].join(',')));
    const blob = new Blob([lineas.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_adopciones_${datosActuales.rango.desde}_${datosActuales.rango.hasta}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportarPDF() {
    const w = window.open('', '_blank');
    const titulo = `Reporte de adopciones (${datosActuales?.rango.desde} a ${datosActuales?.rango.hasta})`;
    const chartEspecieCanvas = document.getElementById('chartEspecie');
    const chartEvolucionCanvas = document.getElementById('chartEvolucion');
    const chartAnimalesEspecieCanvas = document.getElementById('chartAnimalesEspecie');
    const chartAnimalesEvolucionCanvas = document.getElementById('chartAnimalesEvolucion');
    let chartEspecieImg = '';
    let chartEvolucionImg = '';
    let chartAnimalesEspecieImg = '';
    let chartAnimalesEvolucionImg = '';

    try {
      if (chartEspecieCanvas) chartEspecieImg = chartEspecieCanvas.toDataURL('image/png');
      if (chartEvolucionCanvas) chartEvolucionImg = chartEvolucionCanvas.toDataURL('image/png');
      if (chartAnimalesEspecieCanvas) chartAnimalesEspecieImg = chartAnimalesEspecieCanvas.toDataURL('image/png');
      if (chartAnimalesEvolucionCanvas) chartAnimalesEvolucionImg = chartAnimalesEvolucionCanvas.toDataURL('image/png');
    } catch (err) {
      console.warn('No se pudieron exportar los gráficos a imagen:', err);
    }

    const tablaAltasHTML = document.getElementById('tablaAnimales')?.outerHTML || '';
    const tablaRazasHTML = document.getElementById('tablaRazas')?.outerHTML || '';
    const tablaReporteHTML = document.getElementById('tablaReporte')?.outerHTML || '';

    w.document.write(`<!DOCTYPE html><html><head><title>${titulo}</title><style>
      body{font-family: Arial; padding:16px;}
      h2,h3{margin:0 0 12px 0;}
      table{width:100%; border-collapse: collapse; margin-bottom:16px;}
      th,td{border:1px solid #ddd; padding:6px; font-size:12px;}
      .charts img{max-width:100%; height:auto; margin-bottom:16px; border:1px solid #eee; padding:8px;}
      .stats{display:flex; gap:16px; flex-wrap:wrap; margin:12px 0;}
      .stats div{background:#f7fafc; padding:12px 16px; border-radius:8px; min-width:160px;}
    </style></head><body>`);
    w.document.write(`<h2>${titulo}</h2>`);

    // Altas de animales
    w.document.write('<h3>Altas de animales</h3>');
    w.document.write(`<div class="stats">
      <div><strong>Total altas:</strong> ${datosAnimales?.total || 0}</div>
      <div><strong>Promedio/mes:</strong> ${promedioAltasMesEl.textContent}</div>
    </div>`);

    if (chartAnimalesEspecieImg || chartAnimalesEvolucionImg) {
      w.document.write('<div class="charts">');
      if (chartAnimalesEspecieImg) {
        w.document.write('<h3>Altas por especie</h3>');
        w.document.write(`<img src="${chartAnimalesEspecieImg}" alt="Altas por especie" />`);
      }
      if (chartAnimalesEvolucionImg) {
        w.document.write('<h3>Altas mensuales</h3>');
        w.document.write(`<img src="${chartAnimalesEvolucionImg}" alt="Altas mensuales" />`);
      }
      w.document.write('</div>');
    }

    if (tablaAltasHTML) {
      w.document.write('<h3>Detalle de altas</h3>');
      w.document.write(tablaAltasHTML);
    }

    // Adopciones
    w.document.write('<h3>Adopciones formalizadas</h3>');
    w.document.write(`<div class="stats">
      <div><strong>Total adopciones:</strong> ${datosActuales?.total || 0}</div>
      <div><strong>Activas:</strong> ${datosActuales?.totalActivas || 0}</div>
      <div><strong>Fallidas:</strong> ${datosActuales?.totalFallidas || 0}</div>
      <div><strong>Promedio/mes (activas):</strong> ${promedioMesEl.textContent}</div>
    </div>`);

    if (chartEspecieImg || chartEvolucionImg) {
      w.document.write('<div class="charts">');
      if (chartEspecieImg) {
        w.document.write('<h3>Adopciones por especie</h3>');
        w.document.write(`<img src="${chartEspecieImg}" alt="Adopciones por especie" />`);
      }
      if (chartEvolucionImg) {
        w.document.write('<h3>Adopciones mensuales</h3>');
        w.document.write(`<img src="${chartEvolucionImg}" alt="Adopciones mensuales" />`);
      }
      w.document.write('</div>');
    }

    if (tablaRazasHTML) {
      w.document.write('<h3>Top 5 razas más adoptadas</h3>');
      w.document.write(tablaRazasHTML);
    }

    if (tablaReporteHTML) {
      w.document.write('<h3>Detalle de adopciones</h3>');
      w.document.write(tablaReporteHTML);
    }

    w.document.write('</body></html>');
    w.document.close();
    w.focus();
    w.print();
  }
});

function formatearFecha(f) {
  if (!f) return '-';
  return new Date(f).toLocaleDateString('es-ES');
}

function escapeHtml(text) {
  if (text == null) return '';
  return text.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


