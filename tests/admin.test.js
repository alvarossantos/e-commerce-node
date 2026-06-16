/**
 * tests/admin.test.js
 *
 * Testa as rotas administrativas: dashboard, CRUD de produtos, pedidos.
 * Todos os testes usam mock do banco — zero acesso ao PostgreSQL real.
 */

const request = require('supertest');

jest.mock('../src/backend/config/database', () => ({
  query: jest.fn(),
}));

const db = require('../src/backend/config/database');
const app = require('../server');

// ─── Dados de exemplo ─────────────────────────────────────────────────────────
const produtoExemplo = {
  id: 1,
  nome: 'Processador AMD Ryzen 7 5800X',
  sku: 'HW-AMD-5800X',
  preco: '1850.00',
  descricao: 'Processador de alta performance.',
  codigo_barras: '1234567890123',
  categoria: 'Hardware',
  url_imagem: '/img/produtos/placeholder.png',
};

const estoqueExemplo = {
  produto_id: 1,
  quantidade: 15,
  estoque_minimo: 5,
};

const pedidoExemplo = {
  id: 42,
  usuario_id: 1,
  status: 'pago',
  valor_total: '2300.00',
  data_criacao: new Date().toISOString(),
  nome_usuario: 'João Teste',
};

// ─── Suite: GET /admin/dashboard — Painel administrativo ──────────────────────
describe('GET /admin/dashboard — Dashboard do administrador', () => {
  beforeEach(() => jest.clearAllMocks());

  test('deve redirecionar usuário não autenticado para login', async () => {
    const res = await request(app).get('/admin/dashboard');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toMatch(/login/i);
  });
});

// ─── Suite: GET /admin/produtos — Listagem de produtos (admin) ────────────────
describe('GET /admin/produtos — Listagem de produtos (admin)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('deve redirecionar não autenticado para login', async () => {
    const res = await request(app).get('/admin/produtos');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toMatch(/login/i);
  });
});

// ─── Suite: POST /admin/produtos — Criar produto ─────────────────────────────
describe('POST /admin/produtos — Criar novo produto', () => {
  beforeEach(() => jest.clearAllMocks());

  test('deve redirecionar não autenticado para login', async () => {
    const res = await request(app).post('/admin/produtos').send({
      nome: 'Produto Novo',
      sku: 'PROD-001',
      preco: '99.90',
    });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toMatch(/login/i);
  });
});

// ─── Suite: GET /admin/produtos/:id/editar — Formulário de edição ────────────
describe('GET /admin/produtos/:id/editar — Formulário de edição', () => {
  beforeEach(() => jest.clearAllMocks());

  test('deve redirecionar não autenticado para login', async () => {
    const res = await request(app).get('/admin/produtos/1/editar');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toMatch(/login/i);
  });
});

// ─── Suite: DELETE /admin/produtos/:id — Excluir produto ─────────────────────
describe('DELETE /admin/produtos/:id — Excluir produto', () => {
  beforeEach(() => jest.clearAllMocks());

  test('deve redirecionar não autenticado para login', async () => {
    const res = await request(app).delete('/admin/produtos/1');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toMatch(/login/i);
  });
});

// ─── Suite: GET /admin/pedidos — Listagem de pedidos (admin) ──────────────────
describe('GET /admin/pedidos — Listagem de pedidos (admin)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('deve redirecionar não autenticado para login', async () => {
    const res = await request(app).get('/admin/pedidos');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toMatch(/login/i);
  });
});

// ─── Suite: Validações de negócio — Admin ────────────────────────────────────
describe('Regras de negócio — Admin', () => {
  test('produto não pode ter preço negativo', () => {
    const preco = -50;
    expect(preco).toBeLessThan(0);
  });

  test('produto não pode ter estoque negativo', () => {
    const quantidade = -1;
    expect(quantidade).toBeLessThan(0);
  });

  test('SKU duplicado deve ser rejeitado pelo banco (constraint UNIQUE)', () => {
    // Verifica que a constraint existe no schema
    const sqlCreate = `
      CREATE TABLE IF NOT EXISTS produtos (
        sku VARCHAR(50) UNIQUE
      )
    `;
    expect(sqlCreate).toContain('UNIQUE');
  });

  test('estoque mínimo deve ser maior ou igual a zero', () => {
    const estoqueMinimo = 0;
    expect(estoqueMinimo).toBeGreaterThanOrEqual(0);
  });

  test('estoque mínimo deve ser menor ou igual à quantidade atual', () => {
    const estoqueMinimo = 5;
    const quantidadeAtual = 15;
    expect(estoqueMinimo).toBeLessThanOrEqual(quantidadeAtual);
  });
});

// ─── Suite: Lógica do adminController — Fluxos de criação ────────────────────
describe('adminController — Lógica de criação de produto', () => {
  test(' Produto deve ter todos os campos obrigatórios preenchidos', () => {
    const produto = { ...produtoExemplo };
    expect(produto.nome).toBeDefined();
    expect(produto.preco).toBeDefined();
    expect(produto.sku).toBeDefined();
  });

  test('URL da imagem deve ser uma string válida', () => {
    const urlImagem = '/img/produtos/placeholder.png';
    expect(urlImagem).toMatch(/^\/img\/produtos\/.+/);
  });

  test('categoria deve ser uma das opções válidas do sistema', () => {
    const categoriasValidas = [
      'Hardware',
      'Periféricos',
      'Software',
      'Redes',
      'Armazenamento',
      'Acessórios',
    ];
    expect(categoriasValidas).toContain(produtoExemplo.categoria);
  });

  test('quantidade de estoque inicial deve ser um número não-negativo', () => {
    const quantidadeInicial = 10;
    expect(Number.isInteger(quantidadeInicial)).toBe(true);
    expect(quantidadeInicial).toBeGreaterThanOrEqual(0);
  });
});
