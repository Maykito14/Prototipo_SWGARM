const express = require('express');
const router = express.Router();
const animalController = require('../controllers/animalController');
const { authMiddleware, adminMiddleware } = require('../middlewares/autMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const uploadFotos = upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'fotos', maxCount: 10 }
]);

// Rutas públicas (solo lectura)
router.get('/', animalController.listarAnimales);
router.get('/disponibles', animalController.listarAnimalesDisponibles);
router.get('/:id', animalController.obtenerAnimal);

// Rutas protegidas para administradores
router.post('/', authMiddleware, adminMiddleware, uploadFotos, animalController.crearAnimal);
router.put('/:id', authMiddleware, adminMiddleware, uploadFotos, animalController.actualizarAnimal);
router.delete('/:id', authMiddleware, adminMiddleware, animalController.eliminarAnimal);

module.exports = router;
