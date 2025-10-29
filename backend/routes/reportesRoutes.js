const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/autMiddleware');
const reportesController = require('../controllers/reportesController');

router.get('/adopciones', authMiddleware, adminMiddleware, reportesController.reporteAdopciones);

module.exports = router;


