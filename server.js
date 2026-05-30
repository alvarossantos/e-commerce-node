require('dotenv').config();
const express = require('express');
const pool = require('./src/backend/config/database');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');

// Importanções
const usuarioRoutes = require('./src/backend/routes/usuarioRoutes');
const estoqueRoutes = require('./src/backend/routes/estoqueRoutes');
const produtoRoutes = require('./src/backend/routes/produtosRoutes');
const pedidoRoutes = require('./src/backend/routes/pedidoRoutes');
const adminRoutes = require('./src/backend/routes/adminRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

// Config para paginas HTML
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/frontend/views/templates'));
app.use('/static', express.static(path.join(__dirname, 'src/frontend/public')));

// Config para jsond
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Habilitar suporte a PUT, PATCH e DELETE via formulários EJS/HTML
app.use(methodOverride('_method'));

app.use('/usuarios', usuarioRoutes);
app.use('/estoque', estoqueRoutes);
app.use('/produtos', produtoRoutes);
app.use('/pedidos', pedidoRoutes);
app.use('/admin', adminRoutes);

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