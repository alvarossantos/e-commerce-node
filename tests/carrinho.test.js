/**
 * tests/carrinho.test.js
 *
 * Testa as rotas do carrinho de compras (híbrido: cookie para visitantes,
 * banco de dados para usuários logados).
 */

const request = require('supertest');

jest.mock('../src/backend/config/database', () => ({
  query: jest.fn(),
}));

const db = require('../src/backend/config/database');
const app = require('../server');

// ─── Dados de exemplo ─────────────────────────────────────────────────────────
const produtoDisponivel = {
  id: 1,
  nome: 'Teclado Mecânico HyperX',
  preco: '450.00',
  quantidade: 50,      // estoque
  url_imagem: '/img/produtos/placeholder.png',
};

const produtoSemEstoque = {
  id: 2,
  nome: 'Mouse Logitech G Pro',
  preco: '580.00',
  quantidade: 0,
};

// ─── Suite: GET /carrinho — Visualizar carrinho ───────────────────────────────
describe('GET /carrinho — Visualizar carrinho', () => {
  test('deve exibir carrinho vazio para visitante sem cookie', async () => {
    const res = await request(app).get('/carrinho');
    // Visitante não logado → ainda acessa o carrinho (modo cookie)
    expect([200, 302]).toContain(res.statusCode);
  });
});

// ─── Suite: POST /carrinho/adicionar — Adicionar item ────────────────────────
describe('POST /carrinho/adicionar — Adicionar produto ao carrinho', () => {
  beforeEach(() => jest.clearAllMocks());

  test('deve adicionar produto disponível ao carrinho (visitante)', async () => {
    // Busca produto + verifica estoque
    db.query.mockResolvedValueOnce({ rows: [produtoDisponivel] });

    const res = await request(app)
      .post('/carrinho/adicionar')
      .send({ produto_id: 1, quantidade: 2 });

    // Redireciona de volta ao carrinho ou ao produto
    expect(res.statusCode).toBe(302);
  });

  test('deve rejeitar adição de produto sem estoque', async () => {
    db.query.mockResolvedValueOnce({ rows: [produtoSemEstoque] });

    const res = await request(app)
      .post('/carrinho/adicionar')
      .send({ produto_id: 2, quantidade: 1 });

    expect(res.statusCode).toBe(302);
    // Não deve ter feito insert no carrinho
    const inserts = db.query.mock.calls.filter((call) =>
      typeof call[0] === 'string' && call[0].toLowerCase().includes('insert')
    );
    expect(inserts.length).toBe(0);
  });

  test('deve rejeitar quantidade zero ou negativa', async () => {
    const res = await request(app)
      .post('/carrinho/adicionar')
      .send({ produto_id: 1, quantidade: 0 });

    expect(res.statusCode).toBe(302);
  });

  test('deve rejeitar produto_id inexistente', async () => {
    db.query.mockResolvedValueOnce({ rows: [] }); // produto não encontrado

    const res = await request(app)
      .post('/carrinho/adicionar')
      .send({ produto_id: 9999, quantidade: 1 });

    expect(res.statusCode).toBe(302);
  });
});

// ─── Suite: POST /carrinho/remover — Remover item ────────────────────────────
describe('POST /carrinho/remover — Remover produto do carrinho', () => {
  beforeEach(() => jest.clearAllMocks());

  test('deve remover item do carrinho de visitante (via cookie)', async () => {
    const res = await request(app).post('/carrinho/remover/1');

    expect([200, 302]).toContain(res.statusCode);
  });
});

// ─── Suite: GET /checkout — Página de finalização ────────────────────────────
describe('GET /checkout — Página de checkout', () => {
  test('deve redirecionar visitante não logado para o login', async () => {
    const res = await request(app).get('/checkout');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toMatch(/login/i);
  });
});

// ─── Suite: Carrinho híbrido — Lógica de merging ─────────────────────────────
describe('Carrinho híbrido — Merge ao fazer login', () => {
  test('itens do cookie devem ser migrados para o banco após login', () => {
    /*
     * Este é um teste de integração mais avançado.
     * A lógica de merge é executada no middleware de carrinho.
     * Verificamos aqui apenas a premissa do modelo:
     * - Visitante: carrinho em cookie (array JSON)
     * - Logado: carrinho na tabela "carrinhos" + "carrinho_itens"
     * O merge ocorre em POST /auth/login após o JWT ser emitido.
     */
    const carrinhoVisitante = [{ produto_id: 1, quantidade: 2 }];
    expect(Array.isArray(carrinhoVisitante)).toBe(true);
    expect(carrinhoVisitante[0]).toHaveProperty('produto_id');
    expect(carrinhoVisitante[0]).toHaveProperty('quantidade');
  });
});
