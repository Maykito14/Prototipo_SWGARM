const express = require('express');
const router = express.Router();
const saludController = require('../controllers/saludController');
const { authMiddleware, adminMiddleware } = require('../middlewares/autMiddleware');

// Rutas públicas (solo lectura)
router.get('/', saludController.listarControlesSalud);
router.get('/animal/:animalId', saludController.obtenerHistorialAnimal);
router.get('/animal/:animalId/ultimo', saludController.obtenerUltimoControl);
router.get('/:id', saludController.obtenerControlSalud);

// Rutas protegidas para administradores
router.post('/', authMiddleware, adminMiddleware, saludController.crearControlSalud);
router.put('/:id', authMiddleware, adminMiddleware, saludController.actualizarControlSalud);
router.delete('/:id', authMiddleware, adminMiddleware, saludController.eliminarControlSalud);

module.exports = router;
