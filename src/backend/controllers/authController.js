const AuthService = require('../services/authService');

exports.renderizarLogin = (req, res) => res.render('login', {
    layout: 'layout_cliente',
    erro: req.query.erro,
    sucesso: req.query.sucesso,
});
exports.renderizarCadastro = (req, res) => res.render('cadastro', {
    layout: 'layout_cliente',
    erro: req.query.erro,
});

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
        // Erros esperados do service → redireciona com mensagem amigável
        if (erro.tipo) {
            return res.redirect(`/login?erro=${encodeURIComponent(erro.mensagem)}`);
        }
        console.error("=== ERRO AO FAZER LOGIN ===", erro);
        res.redirect('/login?erro=Erro interno ao fazer login.');
    }
};

// Logout
exports.fazerLogout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
};

// Cadastro (usa Post/Redirect/Get para evitar reenvio ao F5)
exports.fazerCadastro = async (req, res) => {
    try {
        const { nome, email, senha, cpf, data_nascimento } = req.body;

        await AuthService.cadastrarUsuario({ nome, email, senha, cpf, data_nascimento });

        res.redirect('/login?sucesso=' + encodeURIComponent('Cadastro realizado com sucesso!'));
    } catch (erro) {
        // Erros esperados do service → mantém na página de cadastro com mensagem
        if (erro.tipo) {
            return res.redirect('/cadastro?erro=' + encodeURIComponent(erro.mensagem));
        }
        console.error("=== ERRO AO FAZER CADASTRO ===", erro);
        res.redirect('/cadastro?erro=' + encodeURIComponent('Erro interno ao fazer cadastro.'));
    }
};
