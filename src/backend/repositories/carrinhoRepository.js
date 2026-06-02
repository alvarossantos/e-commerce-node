const pool = require('../config/database');

class CarrinhoRepository {

    // Procura o carrinho do utilizador (cria se não existir)
    async obterOuCriarCarrinho(usuarioId) {
        let sql = `SELECT id FROM carrinhos WHERE usuario_id = $1;`;
        let resultado = await pool.query(sql, [usuarioId]);

        if (resultado.rows.length === 0) {
            // Se não existir, cria carrinho
            sql = `INSERT INTO carrinhos (usuario_id) VALUES ($1) RETURNING id;`;
            resultado = await pool.query(sql, [usuarioId]);
        }
        // Retorna apenas o ID do carrinho
        return resultado.rows[0].id;
    }

    // Lista todos os itens dentro do carrinho
    async listarItens(usuarioId) {
        const carrinhoId = await this.obterOuCriarCarrinho(usuarioId);

        const sql = `
            SELECT ci.id as item_id, ci.quantidade, p.id as produto_id, p.nome, p.preco, p.url_imagem
            FROM carrinho_itens ci
            JOIN produtos p ON ci.produto_id = p.id
            WHERE ci.carrinho_id = $1
            ORDER BY ci.adicionado_em DESC;
        `;
        const { rows } = await pool.query(sql, [carrinhoId]);
        return rows;
    }

    // Adiciona um produto ou aumenta a quantidade
    async adicionarItem(usuarioId, produtoId, novaQuantidade = 1) {
        const carrinhoId = await this.obterOuCriarCarrinho(usuarioId);
        
        // Retorna a lógica de "Upsert" (Insere ou Atualiza)
        const sql = `
            INSERT INTO carrinho_itens (carrinho_id, produto_id, quantidade)
            VALUES ($1, $2, $3)
            ON CONFLICT (carrinho_id, produto_id) 
            DO UPDATE SET quantidade = carrinho_itens.quantidade + EXCLUDED.quantidade
            RETURNING *;
        `;
        const { rows } = await pool.query(sql, [carrinhoId, produtoId, novaQuantidade]);
        return rows[0];
    }

    async limparCarrinho(usuarioId) {
        const carrinhoId = await this.obterOuCriarCarrinho(usuarioId);
        const sql = `DELETE FROM carrinho_itens WHERE carrinho_id = $1;`;
        await pool.query(sql, [carrinhoId]);
    }

    async removerItem(usuarioId, produtoId) {
        const carrinhoId = await this.obterOuCriarCarrinho(usuarioId);
        const sql = `DELETE FROM carrinho_itens WHERE carrinho_id = $1 AND produto_id = $2;`;
        await pool.query(sql, [carrinhoId, produtoId]);
    }
}

module.exports = new CarrinhoRepository();