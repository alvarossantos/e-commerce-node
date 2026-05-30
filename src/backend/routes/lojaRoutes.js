const express = require('express');
const router = express.Router();
const lojaController = require('../controllers/lojaController');

router.get('/', lojaController.renderizarHome);
router.get('/produtos/:id', lojaController.renderizarDetalheProduto);

module.exports = router;