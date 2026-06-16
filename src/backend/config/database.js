require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS || process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 20,                          // Máximo de conexões simultâneas no pool
    idleTimeoutMillis: 30000,         // Fecha conexão ociosa após 30s
    connectionTimeoutMillis: 2000,    // Timeout de conexão: 2s
});

// Testar conexão assim que for carregado
pool.on('connect', () => {
    console.log('Conectado ao banco de dados PostgreSQL com sucesso!');
});

pool.on('error', (err) => {
    console.error('Erro inesperado no cliente PostgreSQL', err);
    process.exit(-1);
});

module.exports = pool;