/**
 * API REST — Autenticação
 * Login, Cadastro, Logout, Dados do Usuário Logado
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioRepository = require('../../repositories/usuarioRepository');
const CarrinhoRepository = require('../../repositories/carrinhoRepository');
const { verificarLogadoOpcional } = require('../../middlewares/authMiddleware');

const SECRET = process.env.JWT_SECRET || 'chave_super_secreta';

// POST /api/auth/login — Fazer login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ sucesso: false, mensagem: 'E-mail e senha são obrigatórios.' });
        }

        const usuario = await UsuarioRepository.buscarPorEmail(email);

        if (!usuario || !usuario.senha_hash) {
            return res.status(401).json({ sucesso: false, mensagem: 'E-mail ou senha incorretos.' });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ sucesso: false, mensagem: 'E-mail ou senha incorretos.' });
        }

        const token = jwt.sign({
            id: usuario.id,
            nome: usuario.nome,
            is_admin: usuario.is_admin,
            url_foto: usuario.url_foto
        }, SECRET, { expiresIn: '24h' });

        res.cookie('token', token, { httpOnly: true, secure: false });

        // Migrar carrinho do visitante para o banco
        if (req.cookies.carrinho_visitante) {
            let carrinhoVisitante = [];
            try {
                carrinhoVisitante = JSON.parse(req.cookies.carrinho_visitante);
                if (!Array.isArray(carrinhoVisitante)) carrinhoVisitante = [];
            } catch (e) { carrinhoVisitante = []; }

            for (let item of carrinhoVisitante) {
                await CarrinhoRepository.adicionarItem(usuario.id, item.produtoId, item.quantidade);
            }
            res.clearCookie('carrinho_visitante');
        }

        res.json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso!',
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                is_admin: usuario.is_admin,
                url_foto: usuario.url_foto
            }
        });
    } catch (erro) {
        console.error('=== API ERRO AO FAZER LOGIN ===', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao fazer login.' });
    }
});

// POST /api/auth/cadastro — Cadastrar novo usuário
router.post('/cadastro', async (req, res) => {
    try {
        const { nome, email, senha, cpf, data_nascimento } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ sucesso: false, mensagem: 'Por favor, insira um e-mail válido.' });
        }

        const cpfLimpo = cpf ? cpf.replace(/\D/g, '') : '';
        if (cpfLimpo.length !== 11) {
            return res.status(400).json({ sucesso: false, mensagem: 'O CPF deve conter exatamente 11 números.' });
        }

        const usuarioExistente = await UsuarioRepository.buscarPorEmail(email);
        if (usuarioExistente) {
            return res.status(400).json({ sucesso: false, mensagem: 'Este e-mail já está em uso.' });
        }

        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        const novoUsuario = {
            nome,
            email,
            senha_hash: senhaCriptografada,
            cpf: cpfLimpo,
            data_nascimento,
            telefone: null,
            url_foto: '/img/usuarios/default.png',
            ativo: true,
            is_admin: false
        };

        await UsuarioRepository.criar(novoUsuario);

        res.status(201).json({ sucesso: true, mensagem: 'Cadastro realizado com sucesso!' });
    } catch (erro) {
        console.error('=== API ERRO AO FAZER CADASTRO ===', erro);
        if (erro.code === '23505') {
            return res.status(400).json({ sucesso: false, mensagem: 'E-mail ou CPF já cadastrados.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao fazer cadastro.' });
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
            url_foto: req.usuarioLogado.url_foto
        }
    });
});

module.exports = router;
