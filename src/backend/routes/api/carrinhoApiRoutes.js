/**
 * API REST — Carrinho de Compras
 * Suporta usuários logados (banco) e visitantes (cookie)
 */
const express = require('express');
const router = express.Router();
const CarrinhoRepository = require('../../repositories/carrinhoRepository');
const ProdutoRepository = require('../../repositories/produtoRepository');
const { verificarLogadoOpcional } = require('../../middlewares/authMiddleware');

router.use(verificarLogadoOpcional);

// GET /api/carrinho — Listar itens do carrinho
router.get('/', async (req, res) => {
    try {
        let itensCarrinho = [];
        let valorTotal = 0;

        if (req.cookies.token && req.usuarioLogado) {
            itensCarrinho = await CarrinhoRepository.listarItens(req.usuarioLogado.id);
            valorTotal = itensCarrinho.reduce((acc, item) => acc + (parseFloat(item.preco) * item.quantidade), 0);
        } else if (req.cookies.carrinho_visitante) {
            let itensCookie = [];
            try {
                itensCookie = JSON.parse(req.cookies.carrinho_visitante);
                if (!Array.isArray(itensCookie)) itensCookie = [];
            } catch (e) {
                itensCookie = [];
            }

            for (let item of itensCookie) {
                const produtoBD = await ProdutoRepository.buscarPorId(item.produtoId);
                if (produtoBD) {
                    itensCarrinho.push({
                        produto_id: produtoBD.id,
                        nome: produtoBD.nome,
                        preco: produtoBD.preco,
                        url_imagem: produtoBD.url_imagem,
                        quantidade: item.quantidade
                    });
                    valorTotal += (parseFloat(produtoBD.preco) * item.quantidade);
                }
            }
        }

        const totalItens = itensCarrinho.reduce((acc, item) => acc + item.quantidade, 0);

        res.json({
            sucesso: true,
            itens: itensCarrinho,
            valorTotal: parseFloat(valorTotal.toFixed(2)),
            totalItens
        });
    } catch (erro) {
        console.error('=== API ERRO AO LISTAR CARRINHO ===', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao listar carrinho.' });
    }
});

// POST /api/carrinho/adicionar — Adicionar item ao carrinho
router.post('/adicionar', async (req, res) => {
    try {
        const produtoId = req.body.produto_id || req.body.produtoId;
        const quantidade = Math.max(1, parseInt(req.body.quantidade) || 1);

        if (!produtoId) {
            return res.status(400).json({ sucesso: false, mensagem: 'produto_id é obrigatório.' });
        }

        // Verificar se o produto existe
        const produto = await ProdutoRepository.buscarPorId(produtoId);
        if (!produto) {
            return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
        }

        if (req.usuarioLogado) {
            await CarrinhoRepository.adicionarItem(req.usuarioLogado.id, produtoId, quantidade);
        } else {
            let carrinho = [];
            if (req.cookies.carrinho_visitante) {
                try {
                    carrinho = JSON.parse(req.cookies.carrinho_visitante);
                    if (!Array.isArray(carrinho)) carrinho = [];
                } catch (e) {
                    carrinho = [];
                }
            }

            const index = carrinho.findIndex(item => item.produtoId == produtoId);
            if (index > -1) {
                carrinho[index].quantidade += quantidade;
            } else {
                carrinho.push({ produtoId, quantidade });
            }

            res.cookie('carrinho_visitante', JSON.stringify(carrinho), {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                path: '/'
            });
        }

        // Retorna o total atualizado do carrinho
        let totalItens = 0;
        if (req.usuarioLogado) {
            const itens = await CarrinhoRepository.listarItens(req.usuarioLogado.id);
            totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0);
        } else {
            let carrinho = [];
            try {
                carrinho = JSON.parse(req.cookies.carrinho_visitante || '[]');
                if (!Array.isArray(carrinho)) carrinho = [];
            } catch (e) { carrinho = []; }
            totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
        }

        res.json({
            sucesso: true,
            mensagem: `${produto.nome} adicionado ao carrinho!`,
            totalItens
        });
    } catch (erro) {
        console.error('=== API ERRO AO ADICIONAR ITEM ===', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao adicionar item ao carrinho.' });
    }
});

// POST /api/carrinho/remover/:produtoId — Remover item do carrinho
router.post('/remover/:produtoId', async (req, res) => {
    try {
        const { produtoId } = req.params;

        if (req.usuarioLogado) {
            await CarrinhoRepository.removerItem(req.usuarioLogado.id, produtoId);
        } else if (req.cookies.carrinho_visitante) {
            let carrinho = [];
            try {
                carrinho = JSON.parse(req.cookies.carrinho_visitante);
                if (!Array.isArray(carrinho)) carrinho = [];
            } catch (e) { carrinho = []; }

            carrinho = carrinho.filter(item => item.produtoId != produtoId);

            res.cookie('carrinho_visitante', JSON.stringify(carrinho), {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                path: '/'
            });
        }

        // Retorna estado atualizado
        let itensCarrinho = [];
        let valorTotal = 0;

        if (req.usuarioLogado) {
            itensCarrinho = await CarrinhoRepository.listarItens(req.usuarioLogado.id);
            valorTotal = itensCarrinho.reduce((acc, item) => acc + (parseFloat(item.preco) * item.quantidade), 0);
        }

        const totalItens = itensCarrinho.reduce((acc, item) => acc + item.quantidade, 0);

        res.json({
            sucesso: true,
            mensagem: 'Item removido do carrinho.',
            itens: itensCarrinho,
            valorTotal: parseFloat(valorTotal.toFixed(2)),
            totalItens
        });
    } catch (erro) {
        console.error('=== API ERRO AO REMOVER ITEM ===', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao remover item.' });
    }
});

// POST /api/carrinho/limpar — Limpar carrinho
router.post('/limpar', async (req, res) => {
    try {
        if (req.usuarioLogado) {
            await CarrinhoRepository.limparCarrinho(req.usuarioLogado.id);
        } else if (req.cookies.carrinho_visitante) {
            res.clearCookie('carrinho_visitante');
        }

        res.json({ sucesso: true, mensagem: 'Carrinho esvaziado.', itens: [], valorTotal: 0, totalItens: 0 });
    } catch (erro) {
        console.error('=== API ERRO AO LIMPAR CARRINHO ===', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao limpar carrinho.' });
    }
});

module.exports = router;
