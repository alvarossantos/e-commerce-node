const pool = require('../config/database');

class PedidoRepository {
    async criarPedido(usuarioId, enderecoId, valorTotal, itensComprados) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN'); // 🚀 INICIA A TRANSAÇÃO SEGURA

            // 1. Cria o Pedido (Já entra como 'pago' para a nossa simulação)
            const sqlPedido = `
                INSERT INTO pedidos (usuario_id, endereco_id, valor_total, status)
                VALUES ($1, $2, $3, 'pago') RETURNING id;
            `;
            const { rows: resPedido } = await client.query(sqlPedido, [usuarioId, enderecoId, valorTotal]);
            const pedidoId = resPedido[0].id;

            // 2. Insere os itens e remove do carrinho
            const sqlItem = `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4);`;
            const sqlLimparCarrinho = `DELETE FROM carrinho_itens WHERE carrinho_id = (SELECT id FROM carrinhos WHERE usuario_id = $1) AND produto_id = $2;`;

            for (let item of itensComprados) {
                // Insere no histórico de compras
                await client.query(sqlItem, [pedidoId, item.produto_id, item.quantidade, item.preco]);
                // Remove aquele item específico do carrinho
                await client.query(sqlLimparCarrinho, [usuarioId, item.produto_id]);
            }

            await client.query('COMMIT'); // 🚀 GUARDA TUDO NO BANCO
            
            // 💡 CORREÇÃO: O Controller está à espera que retorne APENAS o ID do pedido!
            return pedidoId; 
        } catch (erro) {
            await client.query('ROLLBACK'); // 🚨 SE FALHAR ALGO, DESFAZ A COMPRA
            throw erro;
        } finally {
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
        return parseInt(rows[0].total, 10);
    }

    async calcularFaturamento() {
        const { rows } = await pool.query(`
            SELECT COALESCE(SUM(valor_total), 0) AS total
            FROM pedidos
            WHERE status = 'pago';
        `);
        return parseFloat(rows[0].total);
    }

    async buscarRecibo(pedidoId, usuarioId) {
        // Busca os dados mestre do pedido e do endereço associado
        const sqlPedido = `
            SELECT p.*, e.logradouro, e.numero, e.bairro, e.cidade, e.estado, e.cep, e.complemento
            FROM pedidos p JOIN enderecos e ON p.endereco_id = e.id
            WHERE p.id = $1 AND p.usuario_id = $2;
        `;
        const resPedido = await pool.query(sqlPedido, [pedidoId, usuarioId]);
        if (resPedido.rows.length === 0) return null;

        // Busca os produtos deste pedido
        const sqlItens = `
            SELECT ip.quantidade, ip.preco_unitario, prod.nome, prod.url_imagem as imagem
            FROM itens_pedido ip JOIN produtos prod ON ip.produto_id = prod.id
            WHERE ip.pedido_id = $1;
        `;
        const resItens = await pool.query(sqlItens, [pedidoId]);

        return { pedido: resPedido.rows[0], itens: resItens.rows };
    }
}

module.exports = new PedidoRepository();