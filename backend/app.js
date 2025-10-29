const express = require('express');
const path = require('path');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const animalRoutes = require('./routes/animalRoutes');
const saludRoutes = require('./routes/saludRoutes');
const estadoAnimalRoutes = require('./routes/estadoAnimalRoutes');
const adopcionRoutes = require('./routes/adopcionRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos - frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas API
app.use('/api/usuarios', userRoutes);
app.use('/api/animales', animalRoutes);
app.use('/api/salud', saludRoutes);
app.use('/api/estados', estadoAnimalRoutes);
app.use('/api/adopcion', adopcionRoutes);

// Ruta base
app.get('/', (req, res) => res.send('API SWGARM funcionando correctamente 🚀'));

module.exports = app;
