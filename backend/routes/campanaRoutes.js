const express = require('express');
const router = express.Router();
const campanaController = require('../controllers/campanaController');
const { authMiddleware, adminMiddleware } = require('../middlewares/autMiddleware');
const uploadCampanas = require('../middlewares/uploadCampaignMiddleware');

// Rutas públicas
router.get('/publicas', campanaController.listarCampanasPublicas);
router.get('/publicas/:id', campanaController.obtenerCampanaPublica);

// Rutas protegidas para administradores
router.get('/', authMiddleware, adminMiddleware, campanaController.listarCampanas);
router.get('/:id', authMiddleware, adminMiddleware, campanaController.obtenerCampana);
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  uploadCampanas.array('fotos', 10),
  campanaController.crearCampana
);
router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  uploadCampanas.array('fotos', 10),
  campanaController.actualizarCampana
);
router.patch(
  '/:id/visibilidad',
  authMiddleware,
  adminMiddleware,
  campanaController.actualizarVisibilidad
);
router.delete(
  '/:id/fotos/:idFoto',
  authMiddleware,
  adminMiddleware,
  campanaController.eliminarFoto
);
router.put(
  '/:id/foto-principal',
  authMiddleware,
  adminMiddleware,
  campanaController.establecerFotoPrincipal
);
router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  campanaController.eliminarCampana
);

module.exports = router;

