const EstoqueRepository = require('../repositories/estoqueRepository');

exports.consultar = async (req, res) => {
    try {
        const { produto_id } = req.params;
        const estoque = await EstoqueRepository.buscarPorProduto(produto_id);
        
        if (!estoque) {
            return res.status(404).json({ mensagem: 'Estoque não encontrado para este produto.' });
        }
        res.status(200).json(estoque);
    } catch (erro) {
        console.error("Erro ao consultar estoque:", erro)
        res.status(500).json({ mensagem: 'Erro interno ao consultar estoque.' });
    }
};

exports.atualizar = async (req, res) => {
    try {
        const { produto_id } = req.params;
        const { quantidade } = req.body;

        if (quantidade === undefined || quantidade < 0) {
            return res.status(400).json({ mensagem: 'Quantidade inválida.' });
        }

        const estoqueAtualizado = await EstoqueRepository.atualizarQuantidade(produto_id, quantidade);
    
        if (!estoqueAtualizado) {
            return res.status(404).json({ mensagem: 'Estoque não encontrado para este produto.' });
        }
    
        res.status(200).json({
            mensagem: 'Estoque atualizado com sucesso!',
            estoque: estoqueAtualizado
        });
    } catch (erro) {
        console.error("Erro ao atualizar estoque:", erro)
        res.status(500).json({ mensagem: 'Erro interno ao atualizar estoque.' });
    }
};

exports.relatorioBaixoEstoque = async (req, res) => {
    try {
        const produtosEmAlerta = await EstoqueRepository.listarBaixoEstoque();
        res.status(200).json(produtosEmAlerta);
    } catch (erro) {
        console.error("Erro ao listar produtos em alerta:", erro)
        res.status(500).json({ mensagem: 'Erro interno ao listar produtos em alerta.' });
    }
};