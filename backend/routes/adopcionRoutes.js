const express = require('express');
const router = express.Router();
const adopcionController = require('../controllers/adopcionController');
const { authMiddleware, adminMiddleware } = require('../middlewares/autMiddleware');

// Rutas públicas (solo lectura)
router.get('/adoptantes', adopcionController.listarAdoptantes);
router.get('/adoptantes/:id', adopcionController.obtenerAdoptante);
router.get('/solicitudes', adopcionController.listarSolicitudes);
router.get('/solicitudes/:id', adopcionController.obtenerSolicitud);
router.get('/solicitudes/adoptante/:adoptanteId', adopcionController.obtenerSolicitudesPorAdoptante);
router.get('/solicitudes/animal/:animalId', adopcionController.obtenerSolicitudesPorAnimal);

// Rutas públicas para formulario de adopción
router.post('/solicitar', adopcionController.crearSolicitudAdopcion);

// Rutas protegidas para administradores
router.post('/adoptantes', authMiddleware, adminMiddleware, adopcionController.crearAdoptante);
router.put('/solicitudes/:id', authMiddleware, adminMiddleware, adopcionController.actualizarSolicitud);
router.delete('/solicitudes/:id', authMiddleware, adminMiddleware, adopcionController.eliminarSolicitud);

// Adopciones formalizadas
router.get('/adopciones', authMiddleware, adminMiddleware, adopcionController.listarAdopciones);
router.get('/adopciones/:id', authMiddleware, adminMiddleware, adopcionController.obtenerAdopcion);
router.post('/formalizar', authMiddleware, adminMiddleware, adopcionController.formalizarAdopcion);

// Perfil de adoptante autenticado
router.get('/mi-perfil', authMiddleware, adopcionController.obtenerMiPerfil);
router.put('/mi-perfil', authMiddleware, adopcionController.actualizarMiPerfil);

module.exports = router;
