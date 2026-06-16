const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioRepository = require('../repositories/usuarioRepository');

const SECRET = process.env.JWT_SECRET || 'chave_super_secreta';

exports.renderizarLogin = (req, res) => res.render('login', { layout: 'layout_cliente', erro: req.query.erro });
exports.renderizarCadastro = (req, res) => res.render('cadastro', { layout: 'layout_cliente' });

// Processa o Login
exports.fazerLogin = async (req, res) => {
    try {
        const { email, senha } = req.body;
        const usuario = await UsuarioRepository.buscarPorEmail(email);

        if (!usuario || !usuario.senha_hash) {
            return res.redirect('/login?erro=E-mail ou senha incorretos.');
        }

        // Compara senha digitada com a criptografada no banco de dados
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            return res.redirect('/login?erro=E-mail ou senha incorretos.');
        }

        // Verifica se a conta está ativa
        if (usuario.ativo === false) {
            return res.redirect('/login?erro=Conta desativada. Entre em contato com o suporte.');
        }

        // Cria um crachá JWT de 24 horas
        const token = jwt.sign({ id: usuario.id, 
            nome: usuario.nome, 
            is_admin: usuario.is_admin,
            url_foto: usuario.url_foto
        }, SECRET, { expiresIn: '24h' });

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });

        if (req.cookies.carrinho_visitante) {
            const CarrinhoRepository = require('../repositories/carrinhoRepository');
            let carrinhoVisitante = [];
            try {
                carrinhoVisitante = JSON.parse(req.cookies.carrinho_visitante);
                if (!Array.isArray(carrinhoVisitante)) carrinhoVisitante = [];
            } catch (e) {
                carrinhoVisitante = [];
            }
        
            for (let item of carrinhoVisitante) {
                await CarrinhoRepository.adicionarItem(usuario.id, item.produtoId, item.quantidade);
            }
            res.clearCookie('carrinho_visitante');
        }

        if (usuario.is_admin) {
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/');
        }
    } catch (erro) {
        console.error("=== ERRO AO FAZER LOGIN ===", erro);
        res.redirect('/login?erro=Erro interno ao fazer login.');
    
    }
};

// Logout
exports.fazerLogout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
};

// Cadastro
exports.fazerCadastro = async (req, res) => {
    try {
        const { nome, email, senha, cpf, data_nascimento } = req.body;

        // Validação do E-mail (deve conter '@')
        if (!email || !email.includes('@')) {
            return res.render('cadastro', { layout: 'layout_cliente', erro: 'Por favor, insira um e-mail válido contendo @.', sucesso: null });
        }

        // Validação e Limpeza do CPF (deve ter exatamente 11 números)
        // O replace(/\D/g, '') remove qualquer coisa que não seja número (ex: pontos e traços)
        const cpfLimpo = cpf ? cpf.replace(/\D/g, '') : '';
        if (cpfLimpo.length !== 11) {
            return res.render('cadastro', { layout: 'layout_cliente', erro: 'O CPF deve conter exatamente 11 números.', sucesso: null });
        }

        // Verifica se o email já está em uso
        const usuarioExistente = await UsuarioRepository.buscarPorEmail(email);
        if (usuarioExistente) {
            return res.render('cadastro', { layout: 'layout_cliente', erro: 'Este e-mail já está em uso. '});
        }

        // Criptografa a senha antes de mandar para o banco
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        const novoUsuario = {
            nome: nome,
            email: email,
            senha_hash: senhaCriptografada,
            cpf: cpfLimpo,
            data_nascimento: data_nascimento,
            telefone: null,
            url_foto: '/img/usuarios/default.png',
            ativo: true,
            is_admin: false
        };

        await UsuarioRepository.criar(novoUsuario);

        res.render('login', { layout: 'layout_cliente', sucesso: 'Cadastro realizado com sucesso!'});
    } catch (erro) {
        console.error("=== ERRO AO FAZER CADASTRO ===", erro);
        res.render('cadastro', { layout: 'layout_cliente', erro: 'Erro interno ao fazer cadastro.'});
    }
};