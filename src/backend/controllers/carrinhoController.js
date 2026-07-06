const CarrinhoRepository = require('../repositories/carrinhoRepository');
const ProdutoRepository = require('../repositories/produtoRepository');

exports.adicionarItem = async (req, res) => {
    try {
        const produtoId = req.body.produto_id || req.body.produtoId;
        const quantidade = Math.max(1, parseInt(req.body.quantidade) || 1);

        if (!produtoId) {
            return res.redirect('/?erro=Erro ao identificar o produto. Tente novamente.');
        }

        // Usuário Logado (salva direto no banco de dados)
        if (req.usuarioLogado) {
            // O authMiddleware já terá injetado o req.usuarioLogado se o token for válido
            await CarrinhoRepository.adicionarItem(req.usuarioLogado.id, produtoId, quantidade);
        }
        // Se não: Visitante anônimo (salva cookie do navegador)
        else {
            // Lê o cookie ou cria um array vazio
            let carrinho = [];
            if (req.cookies.carrinho_visitante) {
                try {
                    carrinho = JSON.parse(req.cookies.carrinho_visitante);
                    if (!Array.isArray(carrinho)) carrinho = [];
                } catch (e) {
                    carrinho = [];
                }
            }

            // Verifica se o produto já está no carrinho
            // Soma se já existir, se não adiciona
            const index = carrinho.findIndex(item => item.produtoId == produtoId);
            if (index > -1) {
                carrinho[index].quantidade += quantidade;
            } else {
                carrinho.push({ produtoId, quantidade });
            }

            res.cookie('carrinho_visitante', JSON.stringify(carrinho), { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, path: '/' });
        }

        res.redirect('/carrinho');
    } catch (erro) {
        console.error("=== ERRO AO ADICIONAR ITEM AO CARRINHO ===", erro);
        res.redirect('/produtos?erro=Não foi possível adicionar o item ao carrinho.')
    }
};

exports.renderizarCarrinho = async (req, res) => {
    try {
        let itensCarrinho = [];
        let valorTotal = 0;

        // Se estiver logado, busca os dados direto do banco
        if (req.cookies.token && req.usuarioLogado) {
            itensCarrinho = await CarrinhoRepository.listarItens(req.usuarioLogado.id);

            valorTotal = itensCarrinho.reduce((acc, item) => acc + (parseFloat(item.preco) * item.quantidade), 0);
        }
        // Se for anônimo, tem que buscar os produtos no banco usando os IDs que estão no Cookie
        else if (req.cookies.carrinho_visitante) {
            let itensCookie = [];
            try {
                itensCookie = JSON.parse(req.cookies.carrinho_visitante);
                if (!Array.isArray(itensCookie)) itensCookie = [];
            } catch (e) {
                itensCookie = [];
            }
            
            // Loop para buscar nome e preço de cada ID salvo no cookie
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
        res.render('carrinho', { layout: 'layout_cliente', itens: itensCarrinho, total: valorTotal, erro: req.query.erro || null });
    } catch (erro) {
        console.error("=== ERRO AO RENDERIZAR CARRINHO ===", erro);
        res.status(500).json({ mensagem: 'Erro interno ao renderizar carrinho.' });
    }
};

exports.removerItem = async (req, res) => {
    try {
        const produtoId = req.params.produtoId;

        if (req.usuarioLogado) {
            // Remove do Banco de Dados
            await CarrinhoRepository.removerItem(req.usuarioLogado.id, produtoId);
        } else {
            // Remove do Cookie
            if (req.cookies.carrinho_visitante) {
                let carrinho = [];
                try {
                    carrinho = JSON.parse(req.cookies.carrinho_visitante);
                    if (!Array.isArray(carrinho)) carrinho = [];
                } catch (e) {
                    carrinho = [];
                }
                // Filtra o array, mantendo apenas os itens com ID diferente do que queremos remover
                carrinho = carrinho.filter(item => item.produtoId != produtoId);
                
                res.cookie('carrinho_visitante', JSON.stringify(carrinho), { 
                    maxAge: 30 * 24 * 60 * 60 * 1000, 
                    httpOnly: true, 
                    path: '/' 
                });
            }
        }
        res.redirect('/carrinho');
    } catch (erro) {
        console.error("=== ERRO AO REMOVER ITEM DO CARRINHO ===", erro);
        res.redirect('/carrinho?erro=Não foi possível remover o item.');
    }
};

exports.limparCarrinho = async (req, res) => {
    try {
        if (req.usuarioLogado) {
            await CarrinhoRepository.limparCarrinho(req.usuarioLogado.id);
        } else if (req.cookies.carrinho_visitante) {
            res.clearCookie('carrinho_visitante');
        }
        res.redirect('/carrinho');
    } catch (erro) {
        console.error("=== ERRO AO LIMPAR CARRINHO ===", erro);
        res.redirect('/carrinho?erro=Não foi possível limpar o carrinho.');
    }
};