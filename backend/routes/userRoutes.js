const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middlewares/autMiddleware');

// Rutas públicas
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.solicitarRecuperacionPassword);
router.post('/reset-password', userController.restablecerPassword);

// Rutas protegidas para administradores
router.get('/usuarios', authMiddleware, adminMiddleware, userController.listarUsuarios);
router.put('/usuarios/:id/rol', authMiddleware, adminMiddleware, userController.actualizarRol);
router.post('/usuarios/:id/blanquear-password', authMiddleware, adminMiddleware, userController.blanquearPassword);
router.post('/usuarios/:id/bloquear-permanente', authMiddleware, adminMiddleware, userController.bloquearPermanentemente);
router.post('/usuarios/:id/desbloquear-permanente', authMiddleware, adminMiddleware, userController.desbloquearPermanentemente);

module.exports = router;
