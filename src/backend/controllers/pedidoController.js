const PedidoRepository = require('../repositories/pedidoRepository');

exports.checkout = async (req, res) => {
    try {
        const { usuario_id, endereco_id, itens } = req.body;

        if (!usuario_id || !itens || itens.length === 0) {
            return res.status(400).json({
                mensagem: 'ID do usuário e itens do pedido são obrigatórios.'
            });
        }

        const pedidoCriado = await PedidoRepository.criarPedido(usuario_id, endereco_id, itens);

        res.status(201).json({
            mensagem: 'Pedido criado com sucesso!',
            pedido: pedidoCriado
        });
    } catch (erro) {
        console.error("=== ERRO NO CHECKOUT ===", erro);

        if (erro.constraint === 'estoque_quantidade_check') {
            return res.status(400).json({ mensagem: 'Estoque insuficiente para um ou mais produtos do seu carrinho.'});
        }
        res.status(500).json({ mensagem: 'Erro interno ao criar pedido.' });
    }
};

exports.meusPedidos = async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const pedidos = await PedidoRepository.listarPorUsuario(usuario_id);
        res.status(200).json(pedidos);
    } catch (erro) {
        console.error("=== ERRO AO LISTAR PEDIDOS ===", erro);
        res.status(500).json({ mensagem: 'Erro interno ao listar pedidos.' });
    }
};

exports.listarTodos = async (req, res) => {
    try {
        const pedidos = await PedidoRepository.listarTodos();
        res.status(200).json(pedidos);
    } catch (erro) {
        console.error("=== ERRO AO LISTAR TODOS OS PEDIDOS ===", erro);
        res.status(500).json({ mensagem: 'Erro interno ao listar pedidos.' });
    }
};

exports.atualizarStatusPagamento = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const pedidoAtualizado = await PedidoRepository.atualizarStatus(id, status);

        if (!pedidoAtualizado) {
            return res.status(404).json({ mensagem: 'Pedido não encontrado.' });
        }

        res.status(200).json({
            mensagem: `Status do pedido ID ${id} alterado para '${status}' com sucesso!`,
            pedido: pedidoAtualizado
        });
    } catch (erro) {
        console.error("=== ERRO AO ATUALIZAR STATUS DO PEDIDO ===", erro);
        res.status(500).json({ mensagem: 'Erro interno ao atualizar status do pedido.' });
    }
};