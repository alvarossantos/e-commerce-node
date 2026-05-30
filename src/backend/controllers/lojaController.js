const ProdutoRepository = require('../repositories/produtoRepository');
const EstoqueRepository = require('../repositories/estoqueRepository');

exports.renderizarHome = async (req, res) => {
    try {
        const { busca, categoria } = req.query;

        const produtos = await ProdutoRepository.buscarVitrine(busca, categoria);
        
        res.render('index', { 
            layout: 'layout_cliente',
            produtos: produtos ,
            termoBusca: busca || '',
            categoriaAtiva: categoria || ''
        });
    } catch (erro) {
        console.error("=== ERRO AO RENDERIZAR HOME ===", erro);
        res.status(500).json({ mensagem: 'Erro interno ao renderizar home.' });    }
};

exports.renderizarDetalheProduto = async (req, res) => {
    try {
        const { id } = req.params;

        const produto = await ProdutoRepository.buscarPorId(id);

        if (!produto) {
            return res.status(404).json({ mensagem: 'Produto não encontrado.' });
        }

        const estoque = await EstoqueRepository.buscarPorProduto(id);

        res.render('produto_detalhe', { 
            layout: 'layout_cliente',
            produto: produto, 
            estoque: estoque,
            termoBusca: '',
            categoriaAtiva: ''
        });
    } catch (erro) {
        console.error("=== ERRO AO RENDERIZAR DETALHE DO PRODUTO ===", erro);
        res.status(500).json({ mensagem: 'Erro interno ao renderizar detalhe do produto.' });
    }
}