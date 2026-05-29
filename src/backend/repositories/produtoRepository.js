const pool = require('../config/database');

class ProdutoRepository {
    async criar(produto) {
        const sql = `
            INSERT INTO produtos (nome, sku, preco, descricao, codigo_barras, categoria, url_imagem)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const params = [
            produto.nome,
            produto.sku,
            produto.preco,
            produto.descricao,
            produto.codigo_barras,
            produto.categoria,
            produto.url_imagem
        ];
        const { rows } = await pool.query(sql, params);
        return rows[0];
    }

    async listarTodos() {
        const sql = `SELECT * FROM produtos ORDER BY id ASC`;
        const { rows } = await pool.query(sql);
        return rows;
    }

    async buscarPorId(id) {
        const sql = `SELECT * FROM produtos WHERE id = $1`;
        const { rows } = await pool.query(sql, [id]);
        return rows[0];
    }

    async atualizar(id, produto) {
        const sql = `
            UPDATE produtos
            SET nome = $1, sku = $2, preco = $3, descricao = $4, codigo_barras = $5, categoria = $6, url_imagem = $7
            WHERE id = $8
            RETURNING *;
        `;
        const params = [
            produto.nome,
            produto.sku,
            produto.preco,
            produto.descricao,
            produto.codigo_barras,
            produto.categoria,
            produto.url_imagem,
            id
        ];
        const { rows } = await pool.query(sql, params);
        return rows[0];
    }

    async deletar(id) {
        const sql = `DELETE FROM produtos WHERE id = $1 RETURNING *`;
        const { rows } = await pool.query(sql, [id]);
        return rows[0];
    }
}

module.exports = new ProdutoRepository();