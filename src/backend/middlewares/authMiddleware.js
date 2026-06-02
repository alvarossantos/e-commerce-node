const jwt = require('jsonwebtoken');
const SECRET = 'chave_super_secreta';

exports.verificarAdmin = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login?erro=Acesso Negado! Faça login primeiro.');
    }

    try {
        const decodificado = jwt.verify(token, SECRET);
        if (!decodificado.is_admin) {
            return res.status(403).send('Acesso bloqueado. Área restrita para administradores.');
        }
        
        req.usuarioLogado = decodificado;
        next();
    } catch (erro) {
        res.clearCookie('token');
        return res.redirect('/login?erro=Sessão inválida ou expirada! Faça login novamente.');
    }
};

exports.injetarUsuarioNoEJS = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            // Se estiver logado, a variável 'usuarioLogado' fica disponível em todos os arq's EJS
            res.locals.usuarioLogado = jwt.verify(token, SECRET);
        } catch (erro) {
            res.locals.usuarioLogado = null;
        }
    } else {
        res.locals.usuarioLogado = null;
    }
    next();
};

exports.verificarLogado = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login?erro=Faça login para acessar o seu perfil.');
    }
    try {
        req.usuarioLogado = jwt.verify(token, SECRET);
        next();
    } catch (erro) {
        res.clearCookie('token');
        return res.redirect('/login?erro=Sessão expirada. Faça login novamente.');
    }
}

exports.verificarLogadoOpcional = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            // Se tem token válido, injeato os dados
            req.usuarioLogado = jwt.verify(token, SECRET);
        } catch (erro) {
            // Se for velho ou inválido, limpa
            res.clearCookie('token');
        }
    }
    next();
};