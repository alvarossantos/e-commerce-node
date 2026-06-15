/**
 * API REST — Produtos (CRUD admin + leitura pública)
 */
const express = require('express');
const router = express.Router();
const Produto = require('../../models/produtoModel');
const ProdutoRepository = require('../../repositories/produtoRepository');
const { verificarAdmin } = require('../../middlewares/authMiddleware');

// GET /api/produtos — Listar todos os produtos (público)
router.get('/', async (req, res) => {
    try {
        const produtos = await ProdutoRepository.listarTodos();
        res.json({ sucesso: true, produtos });
    } catch (erro) {
        console.error('=== API ERRO AO LISTAR PRODUTOS ===', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao listar produtos.' });
    }
});

// GET /api/produtos/:id — Buscar produto por ID (público)
router.get('/:id', async (req, res) => {
    try {
        const produto = await ProdutoRepository.buscarPorId(req.params.id);
        if (!produto) {
            return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
        }
        res.json({ sucesso: true, produto });
    } catch (erro) {
        console.error('=== API ERRO AO BUSCAR PRODUTO ===', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao buscar produto.' });
    }
});

// POST /api/produtos — Criar produto (admin)
router.post('/', verificarAdmin, async (req, res) => {
    try {
        const novoProduto = new Produto(req.body);
        const produtoCriado = await ProdutoRepository.criar(novoProduto);
        res.status(201).json({ sucesso: true, mensagem: 'Produto criado com sucesso!', produto: produtoCriado });
    } catch (erro) {
        console.error('=== API ERRO AO CRIAR PRODUTO ===', erro);
        if (erro.code === '23505') {
            return res.status(400).json({ sucesso: false, mensagem: 'SKU ou Código de Barras já está cadastrado.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao criar produto.' });
    }
});

// PUT /api/produtos/:id — Atualizar produto (admin)
router.put('/:id', verificarAdmin, async (req, res) => {
    try {
        const produtoExistente = await ProdutoRepository.buscarPorId(req.params.id);
        if (!produtoExistente) {
            return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
        }
        const dadosAtualizados = new Produto({ ...produtoExistente, ...req.body });
        const produtoAtualizado = await ProdutoRepository.atualizar(req.params.id, dadosAtualizados);
        res.json({ sucesso: true, mensagem: 'Produto atualizado com sucesso!', produto: produtoAtualizado });
    } catch (erro) {
        console.error('=== API ERRO AO ATUALIZAR PRODUTO ===', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao atualizar produto.' });
    }
});

// DELETE /api/produtos/:id — Deletar produto (admin)
router.delete('/:id', verificarAdmin, async (req, res) => {
    try {
        const produto = await ProdutoRepository.buscarPorId(req.params.id);
        if (!produto) {
            return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
        }

        const vinculos = await ProdutoRepository.verificarPossuiVinculos(req.params.id);

        if (vinculos.possuiVendas) {
            return res.status(409).json({ sucesso: false, mensagem: 'Produto não pode ser excluído pois possui vendas registradas.' });
        }
        if (vinculos.possuiEstoque) {
            return res.status(409).json({ sucesso: false, mensagem: 'Produto não pode ser excluído pois possui estoque disponível.' });
        }
        if (vinculos.possuiCarrinho) {
            return res.status(409).json({ sucesso: false, mensagem: 'Produto não pode ser excluído pois está no carrinho de usuários.' });
        }

        await ProdutoRepository.deletar(req.params.id);
        res.json({ sucesso: true, mensagem: 'Produto deletado com sucesso!' });
    } catch (erro) {
        console.error('=== API ERRO AO DELETAR PRODUTO ===', erro);
        if (erro.code === '23503') {
            return res.status(409).json({ sucesso: false, mensagem: 'Produto não pode ser excluído pois possui dependências no sistema.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao deletar produto.' });
    }
});

module.exports = router;
