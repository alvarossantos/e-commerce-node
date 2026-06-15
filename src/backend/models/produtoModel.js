class Produto {
    constructor({ id, nome, sku, preco, descricao, codigo_barras, categoria, url_imagem}) {
        this.id = id;
        this.nome = nome;
        this.sku = sku;
        this.preco = preco;
        this.descricao = descricao;
        this.codigo_barras = codigo_barras;
        this.categoria = categoria;
        this.url_imagem = url_imagem || '/img/produtos/placeholder.png';
    }
}

module.exports = Produto;