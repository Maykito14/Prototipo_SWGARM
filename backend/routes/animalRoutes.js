const express = require('express');
const router = express.Router();
const animalController = require('../controllers/animalController');

// Endpoints REST
router.get('/', animalController.listarAnimales);
router.get('/:id', animalController.obtenerAnimal);
router.post('/', animalController.crearAnimal);
router.put('/:id', animalController.actualizarAnimal);
router.delete('/:id', animalController.eliminarAnimal);

module.exports = router;
