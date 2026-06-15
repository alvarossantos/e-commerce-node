/**
 * API REST — Pedidos
 * Histórico, detalhe e status de pedidos
 */
const express = require('express');
const router = express.Router();
const PedidoRepository = require('../../repositories/pedidoRepository');
const CarrinhoRepository = require('../../repositories/carrinhoRepository');
const { verificarLogado, verificarAdmin } = require('../../middlewares/authMiddleware');

// Todas as rotas de pedidos exigem autenticação
router.use(verificarLogado);

// GET /api/pedidos — Listar pedidos do usuário logado
router.get('/', async (req, res) => {
    try {
        const pedidos = await PedidoRepository.listarPorUsuario(req.usuarioLogado.id);
        res.json({ sucesso: true, pedidos });
    } catch (erro) {
        console.error('=== API ERRO AO LISTAR PEDIDOS ===', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao listar pedidos.' });
    }
});

// GET /api/pedidos/:id — Detalhe de um pedido específico
router.get('/:id', async (req, res) => {
    try {
        const recibo = await PedidoRepository.buscarRecibo(req.params.id, req.usuarioLogado.id);

        if (!recibo) {
            return res.status(404).json({ sucesso: false, mensagem: 'Pedido não encontrado.' });
        }

        res.json({ sucesso: true, pedido: recibo.pedido, itens: recibo.itens });
    } catch (erro) {
        console.error('=== API ERRO AO BUSCAR PEDIDO ===', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao buscar pedido.' });
    }
});

module.exports = router;
