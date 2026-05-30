const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Rota principal do painel (http://localhost:PORT/admin)
router.get('/', adminController.renderizarDashboard);
router.get('/dashboard', adminController.renderizarDashboard);
router.get('/pedidos', adminController.renderizarPedidos);

router.get('/produtos', adminController.renderizarProdutos);
router.get('/produtos/novo', adminController.renderizarFormCriar);
router.get('/produtos/:id', adminController.renderizarDetalheProduto);
router.get('/produtos/:id/editar', adminController.renderizarFormEditar);

router.post('/produtos', adminController.salvarNovoProduto);
router.put('/produtos/:id', adminController.salvarEdicaoProduto);
router.delete('/produtos/:id', adminController.excluirProduto);


module.exports = router;