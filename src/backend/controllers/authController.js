const AuthService = require('../services/authService');

exports.renderizarLogin = (req, res) => res.render('login', { layout: 'layout_cliente', erro: req.query.erro });
exports.renderizarCadastro = (req, res) => res.render('cadastro', { layout: 'layout_cliente' });

// Processa o Login
exports.fazerLogin = async (req, res) => {
    try {
        const { email, senha } = req.body;

        const usuario = await AuthService.validarCredenciais(email, senha);
        const token = AuthService.gerarToken(usuario);

        res.cookie('token', token, AuthService.cookieOptions());

        await AuthService.migrarCarrinhoVisitante(usuario.id, req.cookies, (c) => res.clearCookie(c));

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

        await AuthService.cadastrarUsuario({ nome, email, senha, cpf, data_nascimento });

        res.render('login', { layout: 'layout_cliente', sucesso: 'Cadastro realizado com sucesso!' });
    } catch (erro) {
        console.error("=== ERRO AO FAZER CADASTRO ===", erro);

        // Erros de validação do service → mensagem amigável
        const mensagem = erro.mensagem || 'Erro interno ao fazer cadastro.';
        res.render('cadastro', { layout: 'layout_cliente', erro: mensagem });
    }
};
