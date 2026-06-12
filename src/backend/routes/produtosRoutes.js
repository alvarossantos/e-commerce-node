const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const { verificarAdmin } = require('../middlewares/authMiddleware');

// Rotas de Produto (leitura pública, escrita somente admin)
router.get('/', produtoController.listar);
router.get('/:id', produtoController.buscar);
router.post('/', verificarAdmin, produtoController.criar);
router.put('/:id', verificarAdmin, produtoController.atualizar);
router.delete('/:id', verificarAdmin, produtoController.deletar);

module.exports = router;