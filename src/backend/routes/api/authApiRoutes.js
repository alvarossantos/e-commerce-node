/**
 * API REST — Autenticação
 * Login, Cadastro, Logout, Dados do Usuário Logado
 */
const express = require('express');
const router = express.Router();
const AuthService = require('../../services/authService');
const { verificarLogadoOpcional } = require('../../middlewares/authMiddleware');

// POST /api/auth/login — Fazer login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ sucesso: false, mensagem: 'E-mail e senha são obrigatórios.' });
        }

        const usuario = await AuthService.validarCredenciais(email, senha);
        const token = AuthService.gerarToken(usuario);

        res.cookie('token', token, AuthService.cookieOptions());

        await AuthService.migrarCarrinhoVisitante(usuario.id, req.cookies, (c) => res.clearCookie(c));

        res.json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso!',
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                is_admin: usuario.is_admin,
                url_foto: usuario.url_foto,
            },
        });
    } catch (erro) {
        console.error('=== API ERRO AO FAZER LOGIN ===', erro);

        const mapaStatus = {
            CREDENCIAIS_INVALIDAS: 401,
            CONTA_INATIVA: 403,
        };
        const status = mapaStatus[erro.tipo] || 500;
        const mensagem = erro.mensagem || 'Erro interno ao fazer login.';

        res.status(status).json({ sucesso: false, mensagem });
    }
});

// POST /api/auth/cadastro — Cadastrar novo usuário
router.post('/cadastro', async (req, res) => {
    try {
        const { nome, email, senha, cpf, data_nascimento } = req.body;

        await AuthService.cadastrarUsuario({ nome, email, senha, cpf, data_nascimento });

        res.status(201).json({ sucesso: true, mensagem: 'Cadastro realizado com sucesso!' });
    } catch (erro) {
        console.error('=== API ERRO AO FAZER CADASTRO ===', erro);

        if (erro.tipo === 'EMAIL_DUPLICADO') {
            return res.status(400).json({ sucesso: false, mensagem: erro.mensagem });
        }

        const mapaStatus = {
            EMAIL_INVALIDO: 400,
            CPF_INVALIDO: 400,
        };
        const status = mapaStatus[erro.tipo] || 500;
        const mensagem = erro.mensagem || 'Erro interno ao fazer cadastro.';

        res.status(status).json({ sucesso: false, mensagem });
    }
});

// POST /api/auth/logout — Fazer logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ sucesso: true, mensagem: 'Logout realizado com sucesso!' });
});

// GET /api/auth/me — Dados do usuário logado
router.get('/me', verificarLogadoOpcional, (req, res) => {
    if (!req.usuarioLogado) {
        return res.status(401).json({ sucesso: false, autenticado: false, mensagem: 'Não autenticado.' });
    }
    res.json({
        sucesso: true,
        autenticado: true,
        usuario: {
            id: req.usuarioLogado.id,
            nome: req.usuarioLogado.nome,
            is_admin: req.usuarioLogado.is_admin,
            url_foto: req.usuarioLogado.url_foto,
        },
    });
});

module.exports = router;
