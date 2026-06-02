const CarrinhoRepository = require('../repositories/carrinhoRepository');
const EnderecoRepository = require('../repositories/enderecoRepository');

exports.iniciarCheckout = async (req, res) => {
    try {
        // 1. Recebe os IDs dos produtos que o cliente marcou nos checkboxes
        let selecionados = req.body.produtosSelecionados;

        if (!selecionados) {
            return res.redirect('/carrinho?erro=Selecione pelo menos um produto para comprar.');
        }

        // Se marcou só um, o EJS manda uma string. Se marcou vários, manda um array. Garantimos que é array:
        if (!Array.isArray(selecionados)) {
            selecionados = [selecionados];
        }

        // 2. Guarda os IDs num cookie temporário seguro para a próxima tela ler
        res.cookie('checkout_itens', JSON.stringify(selecionados), { httpOnly: true });
        
        // 3. Redireciona para a tela visual de checkout
        res.redirect('/checkout');
    } catch (erro) {
        console.error("=== ERRO AO INICIAR CHECKOUT ===", erro);
        res.redirect('/carrinho?erro=Erro ao processar os itens.');
    }
};

exports.renderizarCheckout = async (req, res) => {
    try {
        // Se tentou entrar direto sem selecionar nada, volta pro carrinho
        if (!req.cookies.checkout_itens) {
            return res.redirect('/carrinho');
        }

        const idsSelecionados = JSON.parse(req.cookies.checkout_itens);
        
        // Busca TUDO que está no carrinho do usuário
        const todosItensCarrinho = await CarrinhoRepository.listarItens(req.usuarioLogado.id);

        // Filtra para manter apenas os itens que ele selecionou para comprar agora
        const itensParaComprar = todosItensCarrinho.filter(item => 
            idsSelecionados.includes(item.produto_id.toString())
        );

        if (itensParaComprar.length === 0) {
            return res.redirect('/carrinho');
        }

        // Recalcula o subtotal apenas do que vai ser pago
        const valorTotal = itensParaComprar.reduce((acc, item) => acc + (parseFloat(item.preco) * item.quantidade), 0);

        // Busca os endereços cadastrados deste cliente
        const enderecos = await EnderecoRepository.listarPorUsuario(req.usuarioLogado.id);

        res.render('checkout', { 
            layout: 'layout_cliente', 
            itens: itensParaComprar, 
            total: valorTotal, 
            enderecos: enderecos 
        });

    } catch (erro) {
        console.error("=== ERRO AO RENDERIZAR CHECKOUT ===", erro);
        res.status(500).send("Erro interno ao carregar o checkout.");
    }
};