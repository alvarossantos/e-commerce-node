const CarrinhoRepository = require('../repositories/carrinhoRepository');

module.exports = async (req, res, next) => {
    try {
        let total = 0;

        // Verifica se o usuário está logado
        const usuarioId = (req.usuarioLogado && req.usuarioLogado.id) || 
                          (res.locals.usuarioLogado && res.locals.usuarioLogado.id);

        if (usuarioId) {
            // Usuário Logado: busca no banco para contar os produtos
            const itens = await CarrinhoRepository.listarItens(usuarioId);
            total = itens.reduce((acc, item) => acc + Number(item.quantidade), 0);
        }
        else if (req.cookies.carrinho_visitante) {
            // Usuário Anônimo: lê os cookies
            const carrinho = JSON.parse(req.cookies.carrinho_visitante);
            total = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
        }

        res.locals.totalItensCarrinho = total;
        next();
    } catch (erro) {
        console.error("=== ERRO AO CONTAR ITENS NO CARRINHO ===", erro);
        res.locals.totalItensCarrinho = 0;
        next();
    }
}