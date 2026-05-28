const express = require('express');
const router = express.Router();
const estoqueController = require('../controllers/estoqueController');

// Rota de Relatorio de Estoque
router.get('/relatorios/baixo-estoque', estoqueController.relatorioBaixoEstoque);

// Rota de Estoque
router.get('/:produto_id/', estoqueController.consultar);
router.put('/:produto_id/', estoqueController.atualizar);

module.exports = router;