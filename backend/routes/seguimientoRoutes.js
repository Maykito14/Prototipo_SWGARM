const express = require('express');
const router = express.Router();
const seguimientoController = require('../controllers/seguimientoController');
const { authMiddleware, adminMiddleware } = require('../middlewares/autMiddleware');

// Rutas protegidas para administradores
router.get('/pendientes', authMiddleware, adminMiddleware, seguimientoController.listarPendientes);
router.get('/animal/:animalId', authMiddleware, adminMiddleware, seguimientoController.listarPorAnimal);
router.get('/adopcion/:adopcionId', authMiddleware, adminMiddleware, seguimientoController.listarPorAdopcion);
router.post('/', authMiddleware, adminMiddleware, seguimientoController.crearSeguimiento);
router.put('/:id/completar', authMiddleware, adminMiddleware, seguimientoController.completarSeguimiento);

module.exports = router;


