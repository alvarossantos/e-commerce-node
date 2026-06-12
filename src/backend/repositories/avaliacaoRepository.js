const pool = require("../config/database");

class AvaliacaoRepository {
  async criarAvaliacao(produtoId, usuarioId, nota, comentario) {
    const query = `
      INSERT INTO avaliacoes (produto_id, usuario_id, nota, comentario)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [
      produtoId,
      usuarioId,
      nota,
      comentario,
    ]);
    return rows[0];
  }

  async buscarPorProduto(produtoId) {
    const query = `
      SELECT a.id, a.nota, a.comentario, u.nome, u.url_foto
      FROM avaliacoes a
      JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.produto_id = $1
      ORDER BY a.id DESC
    `;
    const { rows } = await pool.query(query, [produtoId]);
    return rows;
  }

  async buscarEstatisticasPorProduto(produtoId) {
    const query = `
      SELECT
        ROUND(AVG(nota), 1) as media,
        COUNT(id) as total
      FROM avaliacoes
      WHERE produto_id = $1
    `;
    const { rows } = await pool.query(query, [produtoId]);
    return {
      media: rows[0].media ? parseFloat(rows[0].media) : 0,
      total: parseInt(rows[0].total || 0),
    };
  }

  async atualizarAvaliacao(id, nota, comentario) {
    const query = `
      UPDATE avaliacoes
      SET nota = $1, comentario = $2
      WHERE id = $3
      RETURNING *
    `;
    const { rows } = await pool.query(query, [nota, comentario, id]);
    return rows[0];
  }

  async deletarAvaliacao(id) {
    const query = `DELETE FROM avaliacoes WHERE id = $1`;
    await pool.query(query, [id]);
  }
}

module.exports = new AvaliacaoRepository();
