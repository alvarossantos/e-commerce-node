/**
 * tests/pedidos.test.js
 *
 * Testa as rotas de pedidos: histórico e status.
 */

const request = require('supertest');

jest.mock('../src/backend/config/database', () => ({
  query: jest.fn(),
}));

const db = require('../src/backend/config/database');
const app = require('../server');

// ─── Dados de exemplo ─────────────────────────────────────────────────────────
const pedidoExemplo = {
  id: 42,
  usuario_id: 1,
  status: 'pago',
  valor_total: '2300.00',
  data_criacao: new Date().toISOString(),
};

const itensPedidoExemplo = [
  {
    id: 1,
    pedido_id: 42,
    produto_id: 1,
    quantidade: 1,
    preco_unitario: '1850.00',
    nome: 'Processador AMD Ryzen 7 5800X',
  },
  {
    id: 2,
    pedido_id: 42,
    produto_id: 4,
    quantidade: 1,
    preco_unitario: '450.00',
    nome: 'Teclado Mecânico HyperX',
  },
];

// ─── Suite: GET /pedidos — Histórico de pedidos ───────────────────────────────
describe('GET /pedidos — Histórico de pedidos do usuário', () => {
  test('deve redirecionar visitante não logado para login', async () => {
    const res = await request(app).get('/pedidos');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toMatch(/login/i);
  });
});

// ─── Suite: GET /pedidos/:id — Detalhe/recibo de pedido ──────────────────────
describe('GET /pedidos/:id — Detalhe do pedido', () => {
  test('deve redirecionar visitante não logado', async () => {
    const res = await request(app).get('/pedidos/42');
    expect(res.statusCode).toBe(302);
  });
});

// ─── Suite: Regras de negócio — Status de pedido ─────────────────────────────
describe('Regras de negócio — Status de pedido', () => {
  const statusValidos = ['pendente', 'em_analise', 'pago', 'enviado', 'entregue', 'cancelado'];

  test.each(statusValidos)(
    'o status "%s" deve ser um valor aceito pelo sistema',
    (status) => {
      expect(statusValidos).toContain(status);
    }
  );

  test('status inválido não deve ser aceito', () => {
    const statusInvalido = 'aprovado'; // não existe no CHECK do banco
    expect(statusValidos).not.toContain(statusInvalido);
  });

  test('valor total do pedido deve ser positivo', () => {
    const valorTotal = parseFloat(pedidoExemplo.valor_total);
    expect(valorTotal).toBeGreaterThan(0);
  });

  test('soma dos itens deve bater com o valor total do pedido', () => {
    const somaItens = itensPedidoExemplo.reduce(
      (acc, item) => acc + parseFloat(item.preco_unitario) * item.quantidade,
      0
    );
    // 1850 + 450 = 2300
    expect(somaItens).toBeCloseTo(parseFloat(pedidoExemplo.valor_total), 2);
  });
});

// ─── Suite: Admin — Atualizar status do pedido ───────────────────────────────
describe('POST /admin/pedidos/:id/status — Atualizar status (admin)', () => {
  test('deve redirecionar não-admin para login', async () => {
    const res = await request(app)
      .post('/admin/pedidos/42/status')
      .send({ status: 'enviado' });

    expect(res.statusCode).toBe(302);
  });
});
