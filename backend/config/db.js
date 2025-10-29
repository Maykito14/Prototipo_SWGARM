const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de conexión
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'swgarm',
  waitForConnections: true,
  connectionLimit: 10,
};

// Solo agregar password si está definido y no está vacío
if (process.env.DB_PASS && process.env.DB_PASS.trim() !== '') {
  dbConfig.password = process.env.DB_PASS;
}

const pool = mysql.createPool(dbConfig);

module.exports = pool;
