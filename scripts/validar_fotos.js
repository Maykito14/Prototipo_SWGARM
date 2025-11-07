require('dotenv').config();

const path = require('path');
const fs = require('fs/promises');
const pool = require('../backend/config/db');

function normalizarRuta(ruta) {
  if (!ruta) return '';
  return ruta.replace(/\\/g, '/').replace(/^\/+/, '');
}

async function obtenerArchivosSistema(directorio) {
  try {
    const archivos = await fs.readdir(directorio);
    return archivos
      .filter((archivo) => archivo !== '.gitkeep')
      .map((archivo) => `uploads/images/${archivo}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function obtenerReferenciasBD() {
  const [rutasFoto] = await pool.query('SELECT ruta FROM animal_foto');
  // Compatibilidad: por si aún quedan valores en la columna antigua
  const [rutasAnimal] = await pool.query('SELECT foto FROM animal WHERE foto IS NOT NULL AND foto <> ""');

  const referencias = new Set();

  rutasFoto.forEach(({ ruta }) => {
    if (ruta) referencias.add(normalizarRuta(ruta));
  });
  rutasAnimal.forEach(({ foto }) => {
    if (foto) referencias.add(normalizarRuta(foto));
  });

  return referencias;
}

async function main() {
  const uploadsDir = path.join(__dirname, '..', 'backend', 'uploads', 'images');

  const [archivosSistema, referenciasBD] = await Promise.all([
    obtenerArchivosSistema(uploadsDir),
    obtenerReferenciasBD()
  ]);

  const archivosSet = new Set(archivosSistema.map(normalizarRuta));

  const archivosSinUso = archivosSistema
    .map(normalizarRuta)
    .filter((ruta) => !referenciasBD.has(ruta));

  const referenciasInvalidas = Array.from(referenciasBD).filter((ruta) => !archivosSet.has(ruta));

  console.log('📁 Validación de imágenes en uploads/images');
  console.log('------------------------------------------');
  console.log(`Total de archivos en disco: ${archivosSistema.length}`);
  console.log(`Total de referencias en BD: ${referenciasBD.size}\n`);

  if (archivosSinUso.length > 0) {
    console.log('Archivos sin uso (presentes en disco pero no referenciados):');
    archivosSinUso.forEach((ruta) => console.log(`  - ${ruta}`));
    console.log('');
  } else {
    console.log('✅ No se encontraron archivos huérfanos en disco.\n');
  }

  if (referenciasInvalidas.length > 0) {
    console.log('Referencias inválidas (registradas en BD pero faltan en disco):');
    referenciasInvalidas.forEach((ruta) => console.log(`  - ${ruta}`));
    console.log('');
  } else {
    console.log('✅ No se encontraron referencias inválidas en la base de datos.\n');
  }

  await pool.end();
}

main()
  .then(() => {
    console.log('Verificación completada.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error al verificar imágenes:', error);
    process.exit(1);
  });


