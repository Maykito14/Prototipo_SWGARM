const express = require('express');
const router = express.Router();
const estadoAnimalController = require('../controllers/estadoAnimalController');
const { authMiddleware, adminMiddleware } = require('../middlewares/autMiddleware');

// Rutas públicas (solo lectura)
router.get('/', estadoAnimalController.listarCambiosEstado);
router.get('/animal/:animalId', estadoAnimalController.obtenerHistorialAnimal);
router.get('/animal/:animalId/estados-disponibles', estadoAnimalController.obtenerEstadosDisponibles);
router.get('/:id', estadoAnimalController.obtenerCambioEstado);

// Rutas protegidas para administradores
router.post('/cambiar', authMiddleware, adminMiddleware, estadoAnimalController.cambiarEstadoAnimal);
router.delete('/:id', authMiddleware, adminMiddleware, estadoAnimalController.eliminarCambioEstado);

module.exports = router;
