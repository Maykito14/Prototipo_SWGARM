const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middlewares/autMiddleware');

// Rutas públicas
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rutas protegidas para administradores
router.get('/usuarios', authMiddleware, adminMiddleware, userController.listarUsuarios);
router.put('/usuarios/:id/rol', authMiddleware, adminMiddleware, userController.actualizarRol);

module.exports = router;
