/**
 * API REST — Loja / Catálogo
 * Endpoints públicos de navegação da loja
 */
const express = require('express');
const router = express.Router();
const ProdutoRepository = require('../../repositories/produtoRepository');
const EstoqueRepository = require('../../repositories/estoqueRepository');
const AvaliacaoRepository = require('../../repositories/avaliacaoRepository');

// GET /api/loja/vitrine — Produtos da vitrine (busca + categoria)
router.get('/vitrine', async (req, res) => {
    try {
        const { busca, categoria } = req.query;
        const produtos = await ProdutoRepository.buscarVitrine(busca, categoria);
        res.json({ sucesso: true, produtos });
    } catch (erro) {
        console.error('=== API ERRO AO LISTAR VITRINE ===', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao buscar vitrine.' });
    }
});

// GET /api/loja/produtos/:id — Detalhe do produto com estoque e avaliações
router.get('/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const produto = await ProdutoRepository.buscarPorId(id);

        if (!produto) {
            return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
        }

        const estoque = await EstoqueRepository.buscarPorProduto(id);
        const avaliacoes = await AvaliacaoRepository.buscarPorProduto(id);
        const estatisticas = await AvaliacaoRepository.buscarEstatisticasPorProduto(id);

        res.json({
            sucesso: true,
            produto,
            estoque,
            avaliacoes,
            estatisticas
        });
    } catch (erro) {
        console.error('=== API ERRO AO BUSCAR DETALHE ===', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao buscar produto.' });
    }
});

module.exports = router;
