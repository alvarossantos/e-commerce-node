const express = require('express');
const router = express.Router();
const estoqueController = require('../controllers/estoqueController');
const { verificarAdmin } = require('../middlewares/authMiddleware');

// Rota de Relatorio de Estoque (somente admin)
router.get('/relatorios/baixo-estoque', verificarAdmin, estoqueController.relatorioBaixoEstoque);

// Rota de Estoque (somente admin para escrita)
router.get('/:produto_id/', estoqueController.consultar);
router.put('/:produto_id/', verificarAdmin, estoqueController.atualizar);

module.exports = router;