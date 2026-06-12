const PedidoRepository = require('../repositories/pedidoRepository');
const CarrinhoRepository = require('../repositories/carrinhoRepository');

exports.processarPagamento = async (req, res) => {
    try {
        const usuarioId = req.usuarioLogado.id;
        const { endereco_id, metodo_pagamento } = req.body;
        let produtosSelecionados = req.body.produtos;

        if (!produtosSelecionados || !endereco_id) {
            return res.redirect('/checkout?erro=Dados incompletos para finalizar a compra.');
        }

        if (!Array.isArray(produtosSelecionados)) produtosSelecionados = [produtosSelecionados];

        // Busca dados reais e seguros do carrinho
        const todosItensCarrinho = await CarrinhoRepository.listarItens(usuarioId);
        const itensParaComprar = todosItensCarrinho.filter(item => produtosSelecionados.includes(item.produto_id.toString()));

        // Calcula o total oficial no servidor
        const valorTotal = itensParaComprar.reduce((acc, item) => acc + (parseFloat(item.preco) * item.quantidade), 0);

        // Dispara a Transação (Cria o pedido)
        const pedidoId = await PedidoRepository.criarPedido(usuarioId, endereco_id, valorTotal, itensParaComprar);

        res.clearCookie('checkout_itens');
        
        res.redirect(`/pedidos/sucesso/${pedidoId}?metodo=${metodo_pagamento}`);

    } catch (erro) {
        console.error("=== ERRO AO PROCESSAR PAGAMENTO ===", erro);
        if (erro.code === '23514') { // Código de erro do PostgreSQL para CONSTRAINT (estoque negativo)
            return res.redirect('/carrinho?erro=Um dos produtos esgotou no momento do pagamento!');
        }
        res.redirect('/checkout?erro=Falha ao processar o pagamento.');
    }
};

exports.renderizarRecibo = async (req, res) => {
    try {
        const { id } = req.params;
        const { metodo } = req.query;
        const recibo = await PedidoRepository.buscarRecibo(id, req.usuarioLogado.id);

        if (!recibo) return res.redirect('/?erro=Pedido não encontrado.');

        res.render('pedido_sucesso', { layout: 'layout_cliente', pedido: recibo.pedido, itens: recibo.itens, metodoPagamento: metodo });
    } catch (erro) {
        res.status(500).send("Erro interno ao gerar comprovante.");
    }
};

exports.meusPedidos = async (req, res) => {
    try {
        const usuarioId = req.usuarioLogado.id;
        const pedidos = await PedidoRepository.listarPorUsuario(usuarioId);
        res.render('meus_pedidos', { layout: 'layout_cliente', pedidos });
    } catch (erro) {
        console.error("=== ERRO AO LISTAR PEDIDOS ===", erro);
        res.redirect('/?erro=Erro ao carregar o seu histórico de pedidos.');
    }
};

exports.listarTodos = async (req, res) => {
    try {
        const pedidos = await PedidoRepository.listarTodos();
        res.render('admin_pedidos', { layout: 'layout', pedidos });
    } catch (erro) {
        console.error("=== ERRO AO LISTAR TODOS OS PEDIDOS ===", erro);
        res.status(500).send('Erro interno ao listar pedidos.');
    }
};

exports.atualizarStatusPagamento = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await PedidoRepository.atualizarStatus(id, status);

        res.redirect('/admin/pedidos?sucesso=Status do pedido atualizado com sucesso!');
    } catch (erro) {
        console.error("=== ERRO AO ATUALIZAR STATUS DO PEDIDO ===", erro);
        res.redirect('/admin/pedidos?erro=Erro ao atualizar status do pedido.');
    }
};