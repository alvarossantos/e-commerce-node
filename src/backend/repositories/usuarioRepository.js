const pool = require('../config/database');

class UsuarioRepository {
    async criar(usuario) {
        const sql = `
            INSERT INTO usuarios (nome, email, senha_hash, cpf, data_nascimento, telefone, url_foto, ativo, is_admin)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, nome, email, cpf, data_nascimento, telefone, url_foto, criado_em, ativo, is_admin;
        `;
        const params = [
            usuario.nome,
            usuario.email,
            usuario.senha_hash,
            usuario.cpf,
            usuario.data_nascimento,
            usuario.telefone,
            usuario.url_foto,
            usuario.ativo,
            usuario.is_admin
        ];
        const { rows } = await pool.query(sql, params);
        return rows[0];
    }

    async listarTodos() {
        const sql = `
            SELECT id, nome, email, cpf, data_nascimento, telefone, criado_em, ativo, is_admin
            FROM usuarios ORDER BY id ASC;
        `;
        const { rows } = await pool.query(sql);
        return rows;
    }

    async buscarPorId(id) {
        const sql = `
            SELECT id, nome, email, cpf, data_nascimento, telefone, criado_em, ativo, is_admin
            FROM usuarios WHERE id = $1;
        `;
        const { rows } = await pool.query(sql, [id]);
        return rows[0];    
    }

    async buscarPorId(id) {
        const sql = `SELECT id, nome, email, senha_hash, cpf, data_nascimento, telefone, url_foto, is_admin FROM usuarios WHERE id = $1;`;
        const { rows } = await pool.query(sql, [id]);
        return rows[0];
    }

    async atualizarPerfil(id, usuario) {
        const sql = `
            UPDATE usuarios 
            SET nome = $1, telefone = $2, senha_hash = $3
            WHERE id = $4 RETURNING *;
        `;
        const params = [usuario.nome, usuario.telefone, usuario.senha_hash, id];
        const { rows } = await pool.query(sql, params);
        return rows[0];
    }

    async atualizarFoto(id, url_foto) {
        const sql = `
            UPDATE usuarios 
            SET url_foto = $1 
            WHERE id = $2
            RETURNING *;
        `;
        const params = [
            url_foto,
            id
        ];
        const { rows } = await pool.query(sql, params);
        return rows[0];
    }

    async inativarConta(id) {
        const sql = `
            UPDATE usuarios 
            SET ativo = false 
            WHERE id = $1
            RETURNING id, nome, email, ativo;
        `;
        const { rows } = await pool.query(sql, [id]);
        return rows[0] || null;
    }

    async contarTotal() {
        const { rows } = await pool.query('SELECT COUNT(*) AS total FROM usuarios');
        return rows[0].total;
    }
}

module.exports = new UsuarioRepository();