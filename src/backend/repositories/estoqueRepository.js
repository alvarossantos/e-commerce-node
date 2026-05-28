const pool = require('../config/database');

class EstoqueRepository {
    async buscarPorProduto(produtoId) {
        const sql = `
            SELECT e.*, p.nome AS nome_produto
            FROM estoque e
            JOIN produtos p ON e.produto_id = p.id
            WHERE e.produto_id = $1;
        `;
        const { rows } = await pool.query(sql, [produtoId]);
        return rows[0];
    }

    async atualizarQuantidade(produtoId, novaQuantidade) {
        const sql = `
            UPDATE estoque
            SET quantidade = $1
            WHERE produto_id = $2
            RETURNING *;
        `;
        const { rows } = await pool.query(sql, [novaQuantidade, produtoId]);
        return rows[0];
    }

    async listarBaixoEstoque() {
        const sql = `
            SELECT e.produto_id, p.nome, e.quantidade, e.estoque_minimo
            FROM estoque e
            JOIN produtos p ON e.produto_id = p.id
            WHERE e.quantidade <= e.estoque_minimo
            ORDER BY e.quantidade ASC;
        `;
        const { rows } = await pool.query(sql);
        return rows;
    }
}

module.exports = new EstoqueRepository();