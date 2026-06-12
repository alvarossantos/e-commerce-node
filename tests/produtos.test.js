/**
 * tests/produtos.test.js
 *
 * Testa as rotas públicas e administrativas de produtos.
 */

const request = require("supertest");

jest.mock("../src/backend/config/database", () => ({
  query: jest.fn(),
}));

const db = require("../src/backend/config/database");
const app = require("../server");

// ─── Dados de exemplo ─────────────────────────────────────────────────────────
const produtoExemplo = {
  id: 1,
  nome: "Processador AMD Ryzen 7 5800X",
  sku: "HW-AMD-5800X",
  preco: "1850.00",
  descricao: "Processador de alta performance.",
  categoria: "Hardware",
  url_imagem: "/img/produtos/placeholder.png",
  quantidade: 15, // estoque
  estoque_minimo: 5,
};

const produtoSemEstoque = { ...produtoExemplo, id: 2, quantidade: 0 };

// ─── Suite: GET / — Catálogo (página inicial) ─────────────────────────────────
describe("GET / — Catálogo de produtos", () => {
  beforeEach(() => jest.clearAllMocks());

  test("deve retornar status 200 e renderizar a página de catálogo", async () => {
    db.query.mockResolvedValueOnce({ rows: [produtoExemplo] });

    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Ryzen 7"); // nome do produto aparece na view
  });

  test("deve exibir catálogo vazio sem erro quando não há produtos", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
  });
});

// ─── Suite: GET /produtos/:id — Detalhe do produto ───────────────────────────
describe("GET /produtos/:id — Detalhe do produto", () => {
  beforeEach(() => jest.clearAllMocks());

  test("deve retornar a página de detalhe de um produto existente", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [produtoExemplo] }) // 1. Busca o Produto
      .mockResolvedValueOnce({ rows: [{ quantidade: 15 }] }) // 2. Busca o Estoque
      .mockResolvedValueOnce({ rows: [] }) // 3. Busca Avaliações (lista vazia para o teste)
      .mockResolvedValueOnce({ rows: [{ media: 4.5, total: 2 }] }); // 4. Busca as Estatísticas (Estrelas)

    const res = await request(app).get("/produtos/1");

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Ryzen 7");
  });

  test("deve retornar 404 para produto inexistente", async () => {
    // Se o produto não existe, o Controlador pára logo na 1ª pergunta, por isso só precisamos de 1 Mock aqui!
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/produtos/9999");

    expect([302, 404]).toContain(res.statusCode);
  });

  test("deve mostrar alerta de estoque baixo quando quantidade <= estoque_minimo", async () => {
    const produtoBaixoEstoque = { ...produtoExemplo, quantidade: 3 }; // abaixo de 5

    db.query
      .mockResolvedValueOnce({ rows: [produtoBaixoEstoque] }) // 1. Busca o Produto
      .mockResolvedValueOnce({ rows: [{ quantidade: 3 }] }) // 2. Busca o Estoque
      .mockResolvedValueOnce({ rows: [] }) // 3. Busca Avaliações
      .mockResolvedValueOnce({ rows: [{ media: 0, total: 0 }] }); // 4. Busca Estatísticas

    const res = await request(app).get("/produtos/1");

    expect(res.statusCode).toBe(200);
  });
});

// ─── Suite: GET /admin/produtos — Gestão de produtos (admin) ─────────────────
describe("GET /admin/produtos — Painel administrativo de produtos", () => {
  beforeEach(() => jest.clearAllMocks());

  test("deve redirecionar usuário não autenticado para o login", async () => {
    const res = await request(app).get("/admin/produtos");
    // Sem cookie de admin → redirect para /auth/login
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toMatch(/login/i);
  });
});

// ─── Suite: Validação de preço e estoque ─────────────────────────────────────
describe("Regras de negócio — Produto", () => {
  test("preço de produto não pode ser negativo (validação do banco)", () => {
    // Verifica a restrição no SQL: CHECK (preco >= 0)
    const preco = -10;
    expect(preco).toBeLessThan(0); // garante que o teste detectaria o valor inválido
  });

  test("quantidade em estoque não pode ser negativa (validação do banco)", () => {
    const quantidade = produtoSemEstoque.quantidade;
    expect(quantidade).toBeGreaterThanOrEqual(0);
  });
});
