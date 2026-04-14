const express = require('express');
const router = express.Router();
const DesastresController = require('../controllers/desastresController');

router.get('/estados', DesastresController.getEstados);
router.get('/estado/:id', DesastresController.getEstado);
router.get('/tipos', DesastresController.getTiposDesastre);
router.get('/alertas', DesastresController.getAlertas);
router.get('/historial', DesastresController.getHistorial);
router.get('/estadisticas', DesastresController.getEstadisticas);

module.exports = router;
