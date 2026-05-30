const pool = require('../config/database');

class PedidoRepository {
    async criarPedido(usuarioId, enderecoId, itens) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Calcula o valor total do pedido com base no itens
            let valorTotal = 0;
            for (const item of itens) {
                valorTotal += (item.quantidade * item.preco_unitario);
            }

            const sqlPedido = `
                INSERT INTO pedidos (usuario_id, endereco_id, valor_total, status)
                VALUES ($1, $2, $3, 'pendente')
                RETURNING id, valor_total, status, data_criacao;
            `;

            const { rows: rowsPedido } = await client.query(sqlPedido, [usuarioId, enderecoId || null, valorTotal]);
            const pedidoId = rowsPedido[0];

            const sqlItens = `
                INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
                VALUES ($1, $2, $3, $4)
                RETURNING id, produto_id, quantidade, preco_unitario;
            `;

            const itensInseridos = [];
            for (const item of itens) {
                const { rows: rowsItem } = await client.query(sqlItens, [
                    pedidoId.id,
                    item.produto_id,
                    item.quantidade,
                    item.preco_unitario
                ]);
                itensInseridos.push(rowsItem[0]);
            }

            await client.query('COMMIT');

            // Retorna o pedido completo
            return { ...novoPedido, itens: itensInseridos };
        } catch (error) {
            // Se algo falhou, reverte tudo
            await client.query('ROLLBACK');
            throw error;
        } finally {
            // Libera a ligação para o pool para não sobrecarregar o servidor
            client.release();
        }
    }

    async listarTodos() {
        const sql = `
            SELECT p.id, p.data_criacao, p.status, p.valor_total, u.nome AS nome_usuario
            FROM pedidos p
            JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.data_criacao DESC
        `;
        const { rows } = await pool.query(sql);
        return rows;
    }

    async listarPorUsuario(usuarioId) {
        const sql = `
            SELECT id, valor_total, status, data_criacao
            FROM pedidos
            WHERE usuario_id = $1
            ORDER BY data_criacao DESC;
        `;
        const { rows } = await pool.query(sql, [usuarioId]);
        return rows;
    }

    async atualizarStatus(pedidoId, novoStatus) {
        const sql = `
            UPDATE pedidos
            SET status = $1
            WHERE id = $2
            RETURNING id, valor_total, status, data_criacao;
        `;
        const { rows } = await pool.query(sql, [novoStatus, pedidoId]);
        return rows[0] || null;
    }

    async contarTotal() {
        const { rows } = await pool.query('SELECT COUNT(*) AS total FROM pedidos');
        return rows[0].total;
    }

    async calcularFaturamento() {
        const { rows } = await pool.query(`
            SELECT COALESCE(SUM(valor_total), 0) AS total
            FROM pedidos
            WHERE status = 'pago';
        `);
        return parseFloat(rows[0].total);
    }
}

module.exports = new PedidoRepository();