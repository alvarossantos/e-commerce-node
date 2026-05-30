const pool = require('../config/database');

class ProdutoRepository {
    async criar(produto, quantidadeInicial = 0) {
        const client = await pool.connect();
        try {
            const sqlProduto = `
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
            const { rows: rowsProduto } = await client.query(sqlProduto, params);
            const novoProduto = rowsProduto[0];
        
            const sqlEstoque = `
                INSERT INTO estoque (produto_id, quantidade, estoque_minimo)
                VALUES ($1, $2, 5)
                RETURNING *;
            `;
            await client.query(sqlEstoque, [novoProduto.id, quantidadeInicial]);

            await client.query('COMMIT');
            return novoProduto;
        } catch (erro) {
            await client.query('ROLLBACK');
            throw erro;
        } finally {
            client.release();
        }
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

    async buscarVitrine(busca = null, categoria = null) {
        let sql = `SELECT * FROM produtos WHERE 1=1`;
        const params = [];
        let contador = 1;

        if (categoria) {
            sql += ` AND categoria = $${contador}`;
            params.push(categoria);
            contador++;
        }

        if (busca) {
            sql += ` AND (nome ILIKE $${contador} OR descricao ILIKE $${contador})`;
            params.push(`%${busca}%`);
            contador++;
        }

        sql += ` ORDER BY id DESC`;

        const { rows } = await pool.query(sql, params);
        return rows;
    }
}

module.exports = new ProdutoRepository();