const express = require('express');
const router = express.Router();
const campanaController = require('../controllers/campanaController');
const { authMiddleware, adminMiddleware } = require('../middlewares/autMiddleware');

// Rutas protegidas para administradores
router.get('/', authMiddleware, adminMiddleware, campanaController.listarCampanas);
router.get('/:id', authMiddleware, adminMiddleware, campanaController.obtenerCampana);
router.post('/', authMiddleware, adminMiddleware, campanaController.crearCampana);
router.put('/:id', authMiddleware, adminMiddleware, campanaController.actualizarCampana);
router.delete('/:id', authMiddleware, adminMiddleware, campanaController.eliminarCampana);

module.exports = router;

