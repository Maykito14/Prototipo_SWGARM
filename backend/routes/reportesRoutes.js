const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/autMiddleware');
const reportesController = require('../controllers/reportesController');

router.get('/adopciones', authMiddleware, adminMiddleware, reportesController.reporteAdopciones);
router.get('/animales', authMiddleware, adminMiddleware, reportesController.reporteAltasAnimales);

module.exports = router;


