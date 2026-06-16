require('dotenv').config();
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Segurança ───────────────────────────────────────────────
// Headers HTTP seguros (X-Content-Type-Options, X-Frame-Options, CSP, etc.)
app.use(helmet({
    contentSecurityPolicy: false, // Desabilitado para evitar quebras com EJS/estáticos
}));

// Rate-limit global: máximo 100 requisições por IP a cada 15 minutos
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { mensagem: 'Muitas requisições. Tente novamente mais tarde.' },
});
app.use(globalLimiter);

// Rate-limit específico para login/cadastro: 10 tentativas a cada 15 minutos
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Muitas tentativas de autenticação. Aguarde 15 minutos.',
});

// Config para json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Habilita leitura de cookies
app.use(cookieParser());

// Config para paginas HTML
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/frontend/views/templates'));
app.use(express.static(path.join(__dirname, 'src/frontend/static')));

// Importanções
const usuarioRoutes = require('./src/backend/routes/usuarioRoutes');
const enderecoRoutes = require('./src/backend/routes/enderecoRoutes');
const estoqueRoutes = require('./src/backend/routes/estoqueRoutes');
const produtoRoutes = require('./src/backend/routes/produtosRoutes');
const pedidoRoutes = require('./src/backend/routes/pedidoRoutes');
const lojaRoutes = require('./src/backend/routes/lojaRoutes');
const adminRoutes = require('./src/backend/routes/adminRoutes');
const authRoutes = require('./src/backend/routes/authRoutes');
const perfilRoutes = require('./src/backend/routes/perfilRoutes');
const { verificarAdmin, injetarUsuarioNoEJS } = require('./src/backend/middlewares/authMiddleware');
const carrinhoRoutes = require('./src/backend/routes/carrinhoRoutes');
const checkoutRoutes = require('./src/backend/routes/checkoutRoutes');
const carrinhoMiddleware = require('./src/backend/middlewares/carrinhoMiddleware');
const { csrfGenerate, csrfValidate } = require('./src/backend/middlewares/csrfMiddleware');

// Habilitar suporte a PUT, PATCH e DELETE via formulários EJS/HTML
app.use(methodOverride('_method'));

// Middleware que injeta o usuário no EJS 
app.use(injetarUsuarioNoEJS);

// Middleware da contagem do carrinho
app.use(carrinhoMiddleware);

// Gera token CSRF para todos os templates
app.use(csrfGenerate);

// Valida CSRF apenas em produção
if (process.env.NODE_ENV !== 'test') {
    app.use(csrfValidate);
}

// ── Rotas EJS (Server-Side Rendering) ──────────────────────
app.use('/', lojaRoutes);
app.use('/', authLimiter, authRoutes);

app.use('/usuarios', usuarioRoutes);
app.use('/enderecos', enderecoRoutes);
app.use('/perfil', perfilRoutes);
app.use('/estoque', estoqueRoutes);
app.use('/produtos', produtoRoutes);
app.use('/pedidos', pedidoRoutes);
app.use('/carrinho', carrinhoRoutes);
app.use('/checkout', checkoutRoutes);

app.use('/admin', verificarAdmin, adminRoutes);

// ── API REST (JSON) ────────────────────────────────────────
const apiLojaRoutes = require('./src/backend/routes/api/lojaApiRoutes');
const apiProdutosRoutes = require('./src/backend/routes/api/produtosApiRoutes');
const apiCarrinhoRoutes = require('./src/backend/routes/api/carrinhoApiRoutes');
const apiAuthRoutes = require('./src/backend/routes/api/authApiRoutes');
const apiPedidosRoutes = require('./src/backend/routes/api/pedidosApiRoutes');
const apiUsuariosRoutes = require('./src/backend/routes/api/usuariosApiRoutes');

app.use('/api/loja', apiLojaRoutes);
app.use('/api/produtos', apiProdutosRoutes);
app.use('/api/carrinho', apiCarrinhoRoutes);
app.use('/api/auth', authLimiter, apiAuthRoutes);
app.use('/api/pedidos', apiPedidosRoutes);
app.use('/api/usuarios', apiUsuariosRoutes);

// ── Error Handler Global (Express 5 captura erros assíncronos automaticamente) ──
app.use((err, req, res, next) => {
    console.error('=== ERRO NÃO TRATADO ===', err);

    // Erro de payload excedido (express.json)
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ mensagem: 'Payload excede o tamanho máximo permitido.' });
    }

    // Erro de sintaxe JSON
    if (err.type === 'parse.failed') {
        return res.status(400).json({ mensagem: 'JSON malformado.' });
    }

    // Erro genérico
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        mensagem: process.env.NODE_ENV === 'production'
            ? 'Erro interno do servidor.'
            : err.message || 'Erro interno do servidor.',
    });
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`Rodando em http://localhost:${PORT}`);
    });
}

module.exports = app;