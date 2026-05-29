require('dotenv').config();
const express = require('express');
const pool = require('./src/backend/config/database');

// Importanções
const usuarioRoutes = require('./src/backend/routes/usuarioRoutes');
const estoqueRoutes = require('./src/backend/routes/estoqueRoutes');
const produtoRoutes = require('./src/backend/routes/produtosRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use('/usuarios', usuarioRoutes);
app.use('/estoque', estoqueRoutes);
app.use('/produtos', produtoRoutes);

// Rota de Teste
app.get('/', async(req, res) => {
    try {
        const result = await pool.query('SELECT NOW() AS hora_atual');
        res.send(`A API esta funcionando! Hora na base de dados: ${result.rows[0].hora_atual}`);
    } catch (error) {
        res.status(500).send('Erro na base de dados: ${error.message}');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Rodando em http://localhost:${PORT}`);
});