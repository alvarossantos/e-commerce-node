/**
 * AuthService — Lógica de negócio de autenticação centralizada.
 * Usada tanto pelo authController (EJS) quanto pelas rotas da API REST.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioRepository = require('../repositories/usuarioRepository');
const CarrinhoRepository = require('../repositories/carrinhoRepository');

if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET não configurado. Defina a variável de ambiente JWT_SECRET.');
    }
    console.warn('⚠️  JWT_SECRET não configurado. Usando fallback para desenvolvimento.');
}
const SECRET = process.env.JWT_SECRET || 'chave_super_secreta';

// ──────────────────────────────────────────────
//  Login
// ──────────────────────────────────────────────

/**
 * Valida credenciais e retorna o usuário autenticado.
 * Lança erros com { tipo, mensagem } para o chamador decidir a resposta HTTP.
 *
 * @param {string} email
 * @param {string} senha
 * @returns {Promise<object>} usuário do banco
 */
async function validarCredenciais(email, senha) {
    const usuario = await UsuarioRepository.buscarPorEmail(email);

    if (!usuario || !usuario.senha_hash) {
        throw { tipo: 'CREDENCIAIS_INVALIDAS', mensagem: 'E-mail ou senha incorretos.' };
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
        throw { tipo: 'CREDENCIAIS_INVALIDAS', mensagem: 'E-mail ou senha incorretos.' };
    }

    if (usuario.ativo === false) {
        throw { tipo: 'CONTA_INATIVA', mensagem: 'Conta desativada. Entre em contato com o suporte.' };
    }

    return usuario;
}

/**
 * Gera um token JWT válido por 24h com os dados do usuário.
 */
function gerarToken(usuario) {
    return jwt.sign(
        {
            id: usuario.id,
            nome: usuario.nome,
            is_admin: usuario.is_admin,
            url_foto: usuario.url_foto,
        },
        SECRET,
        { expiresIn: '24h' }
    );
}

/**
 * Opções padrão do cookie do token.
 */
function cookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    };
}

// ──────────────────────────────────────────────
//  Carrinho visitante → banco
// ──────────────────────────────────────────────

/**
 * Lê o cookie `carrinho_visitante`, parseia e insere cada item no banco.
 * Limpa o cookie ao final.
 *
 * @param {number} usuarioId
 * @param {object} cookies — req.cookies
 * @param {function} clearCookie — res.clearCookie
 */
async function migrarCarrinhoVisitante(usuarioId, cookies, clearCookie) {
    if (!cookies.carrinho_visitante) return;

    let itens = [];
    try {
        itens = JSON.parse(cookies.carrinho_visitante);
        if (!Array.isArray(itens)) itens = [];
    } catch {
        itens = [];
    }

    for (const item of itens) {
        await CarrinhoRepository.adicionarItem(usuarioId, item.produtoId, item.quantidade);
    }

    clearCookie('carrinho_visitante');
}

// ──────────────────────────────────────────────
//  Cadastro
// ──────────────────────────────────────────────

/**
 * Valida dados, cria usuário no banco e retorna o registro criado.
 * Lança erros com { tipo, mensagem } quando a validação falha.
 *
 * @param {object} dados — { nome, email, senha, cpf, data_nascimento }
 * @returns {Promise<object>} usuário criado
 */
async function cadastrarUsuario({ nome, email, senha, cpf, data_nascimento }) {
    // Validação do e-mail
    if (!email || !email.includes('@')) {
        throw { tipo: 'EMAIL_INVALIDO', mensagem: 'Por favor, insira um e-mail válido.' };
    }

    // Validação e limpeza do CPF
    const cpfLimpo = cpf ? cpf.replace(/\D/g, '') : '';
    if (cpfLimpo.length !== 11) {
        throw { tipo: 'CPF_INVALIDO', mensagem: 'O CPF deve conter exatamente 11 números.' };
    }

    // Verifica duplicidade
    const existente = await UsuarioRepository.buscarPorEmail(email);
    if (existente) {
        throw { tipo: 'EMAIL_DUPLICADO', mensagem: 'Este e-mail já está em uso.' };
    }

    // Criptografa senha
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
        is_admin: false,
    };

    return UsuarioRepository.criar(novoUsuario);
}

module.exports = {
    SECRET,
    validarCredenciais,
    gerarToken,
    cookieOptions,
    migrarCarrinhoVisitante,
    cadastrarUsuario,
};
