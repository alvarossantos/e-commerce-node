/**
 * API REST — Usuários
 * Dados do perfil, endereços
 */
const express = require('express');
const router = express.Router();
const UsuarioRepository = require('../../repositories/usuarioRepository');
const EnderecoRepository = require('../../repositories/enderecoRepository');
const { verificarLogado } = require('../../middlewares/authMiddleware');

router.use(verificarLogado);

// GET /api/usuarios/me — Dados completos do perfil
router.get('/me', async (req, res) => {
    try {
        const usuario = await UsuarioRepository.buscarPorId(req.usuarioLogado.id);
        if (!usuario) {
            return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
        }
        // Remove dados sensíveis
        delete usuario.senha_hash;
        res.json({ sucesso: true, usuario });
    } catch (erro) {
        console.error('=== API ERRO AO BUSCAR PERFIL ===', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao buscar perfil.' });
    }
});

// GET /api/usuarios/me/enderecos — Listar endereços do usuário
router.get('/me/enderecos', async (req, res) => {
    try {
        const enderecos = await EnderecoRepository.listarPorUsuario(req.usuarioLogado.id);
        res.json({ sucesso: true, enderecos });
    } catch (erro) {
        console.error('=== API ERRO AO LISTAR ENDERECOS ===', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao listar endereços.' });
    }
});

module.exports = router;
