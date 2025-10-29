const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacionController');
const { authMiddleware } = require('../middlewares/autMiddleware');

// Rutas protegidas (usuarios autenticados)
router.get('/', authMiddleware, notificacionController.getMisNotificaciones);
router.get('/no-leidas', authMiddleware, notificacionController.getMisNotificacionesNoLeidas);
router.get('/contar', authMiddleware, notificacionController.contarNoLeidas);
router.put('/:id/leida', authMiddleware, notificacionController.marcarComoLeida);
router.put('/marcar-todas-leidas', authMiddleware, notificacionController.marcarTodasComoLeidas);
router.delete('/:id', authMiddleware, notificacionController.eliminarNotificacion);

// Preferencias de notificación
router.get('/preferencias', authMiddleware, notificacionController.getMisPreferencias);
router.put('/preferencias', authMiddleware, notificacionController.actualizarMisPreferencias);

module.exports = router;

