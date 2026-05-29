const Produto = require('../models/produtoModel');
const ProdutoRepository = require('../repositories/produtoRepository');

exports.criar = async (req, res) => {
    try {
        const novoProduto = new Produto(req.body);
        
        const produtoCriado = await ProdutoRepository.criar(novoProduto);
        res.status(201).json({
            mensagem: 'Produto criado com sucesso!',
            produto: produtoCriado
        });
    } catch (erro) {
        console.error(erro);

        if (erro.code === '23505') {
            return res.status(400).json({ mensagem: 'SKU ou Código de Barras já está cadastrado.' });
        }
        res.status(500).json({ mensagem: 'Erro interno ao criar produto.' });
    }
};

exports.listar = async (req, res) => {
    try {
        const produtos = await ProdutoRepository.listarTodos();
        res.status(200).json(produtos);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro interno ao listar produtos.' });
    }
};

exports.buscar = async (req, res) => {
    try {
        const { id } = req.params;
        const produto = await ProdutoRepository.buscarPorId(id);

        if (!produto) {
            return res.status(404).json({ mensagem: 'Produto não encontrado.' });
        }
        res.status(200).json(produto);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro interno ao buscar produto.' });
    }
};

exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const produtoExistente = await ProdutoRepository.buscarPorId(id);

        if (!produtoExistente) {
            return res.status(404).json({ mensagem: 'Produto não encontrado.' });
        }

        // Combina os dados antigos com os novos que vieram na requisição
        const dadosAtualizados = new Produto({
            ...produtoExistente,
            ...req.body
        });

        const produtoAtualizado = await ProdutoRepository.atualizar(id, dadosAtualizados);
        res.status(200).json({
            mensagem: 'Produto atualizado com sucesso!',
            produto: produtoAtualizado
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro interno ao atualizar produto.' });
    }
};

exports.deletar = async (req, res) => {
    try {
        const { id } = req.params;
        const produtoDeletado = await ProdutoRepository.deletar(id);

        if (!produtoDeletado) {
            return res.status(404).json({ mensagem: 'Produto não encontrado.' });
        }
        res.status(200).json({ mensagem: 'Produto deletado com sucesso!' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: 'Erro interno ao deletar produto.' });
    }
};