const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');

// Rotas de Produto
router.get('/', produtoController.listar);
router.get('/:id', produtoController.buscar);
router.post('/', produtoController.criar);
router.put('/:id', produtoController.atualizar);
router.delete('/:id', produtoController.deletar);

module.exports = router;