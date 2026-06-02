require('dotenv').config();
const express = require('express');
const pool = require('./src/backend/config/database');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Config para jsond
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

// Habilitar suporte a PUT, PATCH e DELETE via formulários EJS/HTML
app.use(methodOverride('_method'));

// Midlleware que injeta o usuário no EJS 
app.use(injetarUsuarioNoEJS);

// Midlleware da contagem do carrinho
app.use(carrinhoMiddleware);

// Rotas
app.use('/', lojaRoutes);
app.use('/', authRoutes);

app.use('/usuarios', usuarioRoutes);
app.use('/enderecos', enderecoRoutes);
app.use('/perfil', perfilRoutes);
app.use('/estoque', estoqueRoutes);
app.use('/produtos', produtoRoutes);
app.use('/pedidos', pedidoRoutes);
app.use('/carrinho', carrinhoRoutes);
app.use('/checkout', checkoutRoutes);

app.use('/admin', verificarAdmin, adminRoutes);

// Rota de Teste
app.get('/', async(req, res) => {
    try {
        const result = await pool.query('SELECT NOW() AS hora_atual');
        res.send(`A API esta funcionando! Hora na base de dados: ${result.rows[0].hora_atual}`);
    } catch (error) {
        res.status(500).send(`Erro na base de dados: ${error.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Rodando em http://localhost:${PORT}`);
});