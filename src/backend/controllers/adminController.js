const Produto = require('../models/produtoModel');
const ProdutoRepository = require('../repositories/produtoRepository');
const PedidoRepository = require('../repositories/pedidoRepository');
const EstoqueRepository = require('../repositories/estoqueRepository');
const UsuarioRepository = require('../repositories/usuarioRepository');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// GET
exports.renderizarDashboard = async (req, res) => {
    try {
        const totalUsuarios = await UsuarioRepository.contarTotal();
        const totalPedidos = await PedidoRepository.contarTotal();
        const faturamento = await PedidoRepository.calcularFaturamento();
        const produtosEmAlerta = await EstoqueRepository.listarBaixoEstoque();

        res.render('admin_dashboard', {
            layout: 'layout',
            totalUsuarios: totalUsuarios,
            totalPedidos: totalPedidos,
            faturamento: faturamento,
            produtosEmAlerta: produtosEmAlerta.length
        });
    } catch (erro) {
        console.error("=== ERRO AO RENDERIZAR DASHBOARD ===", erro);
        res.status(500).json({ mensagem: 'Erro interno ao renderizar dashboard.' });
    }
};

exports.renderizarProdutos = async (req, res) => {
    try {
        const produtos = await ProdutoRepository.listarTodos();
        
        // Captura o parâmetro '?erro=' da url
        const mensagemErro = req.query.erro;


        res.render('admin_produtos', { produtos: produtos, erro: mensagemErro });
    } catch (erro) {
        console.error("=== ERRO AO RENDERIZAR PRODUTOS ===", erro);
        res.status(500).json({ mensagem: 'Erro interno ao renderizar produtos.' });
    }
};

exports.renderizarPedidos = async (req, res) => {
    try {
        const pedidos = await PedidoRepository.listarTodos();
        res.render('admin_pedidos', { pedidos: pedidos });
    } catch (erro) {
        console.error("=== ERRO AO RENDERIZAR PEDIDOS ===", erro);
        res.status(500).json({ mensagem: 'Erro interno ao renderizar pedidos.' });
    }
};

exports.renderizarFormCriar = async (req, res) => {
    res.render('admin_produtos_form', { produto: null});
};

exports.renderizarFormEditar = async (req, res) => {
    try {
        const { id } = req.params;
        const produto = await ProdutoRepository.buscarPorId(id);    

        if (!produto) {
            return res.status(404).json({ mensagem: 'Produto não encontrado.' });
        }

        const estoqueData = await EstoqueRepository.buscarPorProduto(id);
        const quantidadeAtual = estoqueData ? estoqueData.quantidade: 0;

        res.render('admin_produtos_form', { produto: produto, quantidade_estoque: quantidadeAtual });
    } catch (erro) {
        console.error("=== ERRO AO RENDERIZAR FORMULARIO DE EDIÇÃO ===", erro);
        res.status(500).json({ mensagem: 'Erro interno ao renderizar formulário de edição.' });
    }
};

exports.salvarNovoProduto = async (req, res) => {
    try {
        if (req.file) {
            const nomeArquivo = `prod_${Date.now()}.webp`;
            const caminhoDestino = path.join(process.cwd(), 'src', 'frontend', 'static', 'img', 'produtos');
        
            if (!fs.existsSync(caminhoDestino)) {
                fs.mkdirSync(caminhoDestino, { recursive: true });
            }

            await sharp(req.file.buffer)
                .resize(800, 800, { fit: 'inside'})
                .webp({ quality: 80 })
                .toFile(path.join(caminhoDestino, nomeArquivo));

            req.body.url_imagem = `/img/produtos/${nomeArquivo}`;
        }

        const novoProduto = new Produto(req.body);
        const quantidadeEstoque = parseInt(req.body.quantidade) || 0;
     
        await ProdutoRepository.criar(novoProduto, quantidadeEstoque);
        res.redirect('/admin/produtos?sucesso=Produto criado com sucesso!');
    } catch (erro) {
        console.error("=== ERRO AO SALVAR NOVO PRODUTO ===", erro);
        res.redirect('/admin/produtos?erro=Erro ao criar produto.');
    }
};

exports.salvarEdicaoProduto = async (req, res) => {
    try {
        const { id } = req.params;
        const produtoAtualizado = new Produto(req.body);
        const { quantidade } = req.body;

        await ProdutoRepository.atualizar(id, produtoAtualizado);

        if (quantidade !== undefined) {
            await EstoqueRepository.atualizarQuantidade(id, quantidade);
        }

        res.redirect('/admin/produtos');
    } catch (erro) {
        console.error("=== ERRO AO SALVAR EDIÇÃO DE PRODUTO ===", erro);
        res.status(500).json({ mensagem: 'Erro interno ao salvar edição de produto.' });
    }
};

exports.excluirProduto = async (req, res) => {
    try {
        const { id } = req.params;
        await ProdutoRepository.deletar(id);
        res.redirect('/admin/produtos');
    } catch (erro) {
        console.error("=== ERRO AO EXCLUIR PRODUTO ===", erro);
        
        // Captura o erro específico de violação de chave estrangeira (produto já em um pedido)
        if (erro.code === '23503') {
            return res.redirect('/admin/produtos?erro=em_uso')
        }

        res.status(500).json({ mensagem: 'Erro interno ao excluir produto.' });
    }
};

exports.renderizarDetalheProduto = async (req, res) => {
    try {
        const { id } = req.params;

        const produto = await ProdutoRepository.buscarPorId(id);

        if (!produto) {
            return res.status(404).json({ mensagem: 'Produto não encontrado.' });
        }

        const estoqueData = await EstoqueRepository.buscarPorProduto(id);

        res.render('admin_produtos_detalhe', { produto: produto, estoque: estoqueData });
    } catch (erro) {
        console.error("=== ERRO AO RENDERIZAR DETALHE DO PRODUTO ===", erro);
        res.status(500).json({ mensagem: 'Erro interno ao renderizar detalhe do produto.' });
    }
}