const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/autMiddleware');
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', authMiddleware, adminMiddleware, dashboardController.obtenerEstadisticas);

module.exports = router;


