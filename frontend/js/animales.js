const API = 'http://localhost:3001/api/animales';
const tabla = document.getElementById('tabla-animales');
const form = document.getElementById('form-animal');

async function cargarAnimales() {
  const res = await fetch(API);
  const datos = await res.json();
  tabla.innerHTML = datos.map(a => `
    <tr>
      <td>${a.idAnimal}</td>
      <td>${a.nombre}</td>
      <td>${a.especie || ''}</td>
      <td>${a.edad || ''}</td>
      <td>${a.estado || ''}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="eliminar(${a.idAnimal})">🗑️</button>
      </td>
    </tr>
  `).join('');
}

async function eliminar(id) {
  if (!confirm('¿Eliminar este animal?')) return;
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  cargarAnimales();
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  form.reset();
  cargarAnimales();
});

cargarAnimales();

