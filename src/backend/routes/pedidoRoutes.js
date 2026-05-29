const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

// Listar todos os pedidos do sistema (Admin)
router.get('/', pedidoController.listarTodos);

// Finalizar compra (Checkout)
router.post('/checkout', pedidoController.checkout);

// Meus Pedidos
router.get('/usuario/:usuario_id', pedidoController.meusPedidos);

// Atualizar Status do Pagamento
router.patch('/:id/status', pedidoController.atualizarStatusPagamento);

module.exports = router;