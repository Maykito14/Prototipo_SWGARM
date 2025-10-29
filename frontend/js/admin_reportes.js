document.addEventListener('DOMContentLoaded', () => {
  requireAdmin();

  const fechaDesde = document.getElementById('fechaDesde');
  const fechaHasta = document.getElementById('fechaHasta');
  const btnGenerar = document.getElementById('btnGenerar');
  const btnCSV = document.getElementById('btnCSV');
  const btnPDF = document.getElementById('btnPDF');
  const tablaBody = document.querySelector('#tablaReporte tbody');
  const tablaRazasBody = document.querySelector('#tablaRazas tbody');
  const totalAdopEl = document.getElementById('totalAdop');
  const porEspecieEl = document.getElementById('porEspecie');
  const rangoEl = document.getElementById('rango');
  const promedioMesEl = document.getElementById('promedioMes');
  let datosActuales = null;
  let chartEspecie = null;
  let chartEvolucion = null;

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
      const res = await api.getReporteAdopciones(d, h);
      datosActuales = res;
      renderResumen(res);
      renderTabla(res.datos);
      renderTablaRazas(res.topRazas, res.total);
      renderChartEspecie(res.porEspecie);
      renderChartEvolucion(res.evolucionMensual);
    } catch (e) {
      alert(e.message || 'Error al generar reporte');
    }
  }

  function renderResumen(res) {
    totalAdopEl.textContent = res.total;
    rangoEl.textContent = `${res.rango.desde} a ${res.rango.hasta}`;
    porEspecieEl.innerHTML = Object.entries(res.porEspecie).map(([k,v]) => `<div>${k}: <strong>${v}</strong></div>`).join('');
    
    // Calcular promedio por mes
    const meses = res.evolucionMensual?.length || 1;
    const promedio = meses > 0 ? (res.total / meses).toFixed(1) : '0';
    promedioMesEl.textContent = promedio;
  }

  function renderTablaRazas(topRazas, total) {
    if (!topRazas || topRazas.length === 0) {
      tablaRazasBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:12px;">Sin datos de razas</td></tr>';
      return;
    }
    tablaRazasBody.innerHTML = topRazas.map((item, idx) => {
      const porcentaje = total > 0 ? ((item.cantidad / total) * 100).toFixed(1) : '0';
      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${escapeHtml(item.raza)}</td>
          <td>${item.cantidad}</td>
          <td>${porcentaje}%</td>
        </tr>
      `;
    }).join('');
  }

  function renderTabla(rows) {
    if (!rows || rows.length === 0) {
      tablaBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:12px;">Sin registros en el período</td></tr>';
      return;
    }
    tablaBody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.idAdopcion}</td>
        <td>${formatearFecha(r.fecha)}</td>
        <td>${r.nombreAdoptante} ${r.apellidoAdoptante}</td>
        <td>${r.nombreAnimal}</td>
        <td>${r.especie || '-'}</td>
        <td>${r.raza || '-'}</td>
        <td>${escapeHtml(r.contrato) || '-'}</td>
      </tr>
    `).join('');
  }

  function renderChartEspecie(porEspecie) {
    const labels = Object.keys(porEspecie);
    const values = Object.values(porEspecie);
    const ctx = document.getElementById('chartEspecie');
    if (chartEspecie) chartEspecie.destroy();
    chartEspecie = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Adopciones', data: values, backgroundColor: '#2f855a' }] },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }

  function renderChartEvolucion(evolucionMensual) {
    if (!evolucionMensual || evolucionMensual.length === 0) {
      const ctx = document.getElementById('chartEvolucion');
      if (chartEvolucion) chartEvolucion.destroy();
      chartEvolucion = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: { responsive: true }
      });
      return;
    }
    
    const labels = evolucionMensual.map(e => {
      const [year, month] = e.mes.split('-');
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${meses[parseInt(month) - 1]} ${year}`;
    });
    const values = evolucionMensual.map(e => e.cantidad);
    const ctx = document.getElementById('chartEvolucion');
    if (chartEvolucion) chartEvolucion.destroy();
    chartEvolucion = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Adopciones',
          data: values,
          borderColor: '#3182ce',
          backgroundColor: 'rgba(49, 130, 206, 0.1)',
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

  function exportarCSV() {
    if (!datosActuales) return;
    const rows = datosActuales.datos || [];
    const encabezados = ['ID','Fecha','Adoptante','Animal','Especie','Raza','Contrato'];
    const lineas = [encabezados.join(',')].concat(rows.map(r => [
      r.idAdopcion,
      r.fecha,
      `${r.nombreAdoptante} ${r.apellidoAdoptante}`.replace(/,/g,' '),
      (r.nombreAnimal||'').replace(/,/g,' '),
      (r.especie||'').replace(/,/g,' '),
      (r.raza||'').replace(/,/g,' '),
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
    // Uso de impresión del navegador como PDF
    const w = window.open('', '_blank');
    const titulo = `Reporte de adopciones (${datosActuales?.rango.desde} a ${datosActuales?.rango.hasta})`;
    w.document.write(`<!DOCTYPE html><html><head><title>${titulo}</title><style>
      body{font-family: Arial; padding:16px;}
      table{width:100%; border-collapse: collapse;}
      th,td{border:1px solid #ddd; padding:6px; font-size:12px;}
      h2{margin:0 0 12px 0;}
    </style></head><body>`);
    w.document.write(`<h2>${titulo}</h2>`);
    w.document.write(`<div>Total: ${datosActuales?.total || 0}</div>`);
    w.document.write(`<table><thead><tr><th>ID</th><th>Fecha</th><th>Adoptante</th><th>Animal</th><th>Especie</th><th>Raza</th><th>Contrato</th></tr></thead><tbody>`);
    (datosActuales?.datos||[]).forEach(r => {
      w.document.write(`<tr><td>${r.idAdopcion}</td><td>${r.fecha}</td><td>${r.nombreAdoptante} ${r.apellidoAdoptante}</td><td>${r.nombreAnimal}</td><td>${r.especie||''}</td><td>${r.raza||''}</td><td>${escapeHtml(r.contrato)||''}</td></tr>`);
    });
    w.document.write(`</tbody></table></body></html>`);
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


