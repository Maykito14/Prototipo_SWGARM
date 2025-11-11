const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/autMiddleware');
const profileController = require('../controllers/profileController');

router.get('/', authMiddleware, profileController.obtenerMiPerfil);
router.put('/', authMiddleware, profileController.actualizarMiPerfil);
router.put('/password', authMiddleware, profileController.cambiarPassword);

module.exports = router;


