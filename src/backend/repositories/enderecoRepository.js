const pool = require('../config/database');

class EnderecoRepository {
    async listarPorUsuario(usuarioId) {
        const sql = `SELECT * FROM enderecos WHERE usuario_id = $1 ORDER BY id DESC;`;
        const { rows } = await pool.query(sql, [usuarioId]);
        return rows;
    }

    async buscarPorId(id, usuarioId) {
        const sql = `SELECT * FROM enderecos WHERE id = $1 AND usuario_id = $2;`;
        const { rows } = await pool.query(sql, [id, usuarioId]);
        return rows[0];
    }

    async criar(endereco) {
        const sql = `
            INSERT INTO enderecos (usuario_id, logradouro, numero, bairro, cidade, estado, cep, complemento)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
        `;
        const params = [
            endereco.usuario_id,
            endereco.logradouro,
            endereco.numero,
            endereco.bairro,
            endereco.cidade,
            endereco.estado,
            endereco.cep,
            endereco.complemento
        ];
        const { rows } = await pool.query(sql, params);
        return rows[0];
    }

    async atualizar(id, usuarioId, endereco) {
        const sql = `
            UPDATE enderecos
            SET logradouro = $1, numero = $2, bairro = $3, cidade = $4, estado = $5, cep = $6, complemento = $7
            WHERE id = $8 AND usuario_id = $9 RETURNING *;
        `;
        const params = [
            endereco.logradouro,
            endereco.numero,
            endereco.bairro,
            endereco.cidade,
            endereco.estado,
            endereco.cep,
            endereco.complemento,
            id,
            usuarioId
        ];
        const { rows } = await pool.query(sql, params);
        return rows[0];
    }

    async deletar(id, usuarioId) {
        const sql = `DELETE FROM enderecos WHERE id = $1 AND usuario_id = $2 RETURNING *;`;
        const { rows } = await pool.query(sql, [id, usuarioId]);
        return rows[0];
    }
}

module.exports = new EnderecoRepository();