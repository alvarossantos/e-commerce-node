const ProdutoRepository = require("../repositories/produtoRepository");
const EstoqueRepository = require("../repositories/estoqueRepository");
const AvaliacaoRepository = require("../repositories/avaliacaoRepository");

exports.renderizarHome = async (req, res) => {
  try {
    const { busca, categoria } = req.query;
    const produtos = await ProdutoRepository.buscarVitrine(busca, categoria);

    res.render("index", {
      layout: "layout_cliente",
      produtos: produtos,
      termoBusca: busca || "",
      categoriaAtiva: categoria || "",
    });
  } catch (erro) {
    console.error("=== ERRO AO RENDERIZAR HOME ===", erro);
    res.status(500).json({ mensagem: "Erro interno ao renderizar home." });
  }
};

exports.renderizarDetalheProduto = async (req, res) => {
  try {
    const { id } = req.params;

    const produto = await ProdutoRepository.buscarPorId(id);
    if (!produto) {
      return res.status(404).json({ mensagem: "Produto não encontrado." });
    }

    const estoque = await EstoqueRepository.buscarPorProduto(id);
    const avaliacoes = await AvaliacaoRepository.buscarPorProduto(id);
    const estatisticas =
      await AvaliacaoRepository.buscarEstatisticasPorProduto(id);

    res.render("produto_detalhe", {
      layout: "layout_cliente",
      produto: produto,
      estoque: estoque,
      avaliacoes: avaliacoes,
      estatisticas: estatisticas,
      termoBusca: "",
      categoriaAtiva: "",
    });
  } catch (erro) {
    console.error("=== ERRO AO RENDERIZAR DETALHE DO PRODUTO ===", erro);
    res
      .status(500)
      .json({ mensagem: "Erro interno ao renderizar detalhe do produto." });
  }
};

exports.adicionarAvaliacao = async (req, res) => {
  try {
    const produtoId = req.params.id;
    const { nota, comentario } = req.body;

    const usuarioAuth = res.locals.usuarioLogado || req.usuario || req.user;

    if (!usuarioAuth) {
      return res.redirect(
        `/produtos/${produtoId}?erro=Você precisa estar logado para adicionar uma avaliação.`,
      );
    }
    const usuarioId = usuarioAuth.id;

    await AvaliacaoRepository.criarAvaliacao(
      produtoId,
      usuarioId,
      nota,
      comentario,
    );

    res.redirect(`/produtos/${produtoId}`);
  } catch (erro) {
    console.error("=== ERRO AO ADICIONAR AVALIAÇÃO ===", erro);
    res.redirect(
      `/produtos/${req.params.id}?erro=Não foi possível enviar a avaliação.`,
    );
  }
};
