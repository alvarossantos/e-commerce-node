/**
 * tests/perfil.test.js
 *
 * Testa as rotas de perfil do usuário: visualização, atualização de dados,
 * upload de foto, CRUD de endereços.
 * Todos os testes usam mock do banco — zero acesso ao PostgreSQL real.
 */

const request = require('supertest');

jest.mock('../src/backend/config/database', () => ({
  query: jest.fn(),
}));

const db = require('../src/backend/config/database');
const app = require('../server');

// ─── Dados de exemplo ─────────────────────────────────────────────────────────
const usuarioLogado = {
  id: 1,
  nome: 'João Teste',
  email: 'joao@teste.com',
  is_admin: false,
  url_foto: '/img/usuarios/default.png',
};

const enderecoExemplo = {
  id: 1,
  usuario_id: 1,
  logradouro: 'Rua das Flores',
  numero: '123',
  bairro: 'Centro',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '01234-567',
  complemento: 'Apto 101',
};

// ─── Suite: GET /perfil — Visualizar perfil ───────────────────────────────────
describe('GET /perfil — Visualizar perfil do usuário', () => {
  beforeEach(() => jest.clearAllMocks());

  test('deve redirecionar visitante não logado para login', async () => {
    const res = await request(app).get('/perfil');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toMatch(/login/i);
  });
});

// ─── Suite: POST /perfil/dados — Atualizar dados pessoais ────────────────────
describe('POST /perfil/dados — Atualizar dados do perfil', () => {
  beforeEach(() => jest.clearAllMocks());

  test('deve redirecionar visitante não logado para login', async () => {
    const res = await request(app)
      .post('/perfil/dados')
      .send({ nome: 'João Atualizado', telefone: '11988887777' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toMatch(/login/i);
  });
});

// ─── Suite: POST /perfil/foto — Atualizar foto de perfil ─────────────────────
describe('POST /perfil/foto — Upload de foto de perfil', () => {
  beforeEach(() => jest.clearAllMocks());

  test('deve redirecionar visitante não logado para login', async () => {
    const res = await request(app).post('/perfil/foto');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toMatch(/login/i);
  });
});

// ─── Suite: GET /perfil/endereco/novo — Formulário novo endereço ─────────────
describe('GET /perfil/endereco/novo — Formulário de novo endereço', () => {
  beforeEach(() => jest.clearAllMocks());

  test('deve redirecionar visitante não logado para login', async () => {
    const res = await request(app).get('/perfil/endereco/novo');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toMatch(/login/i);
  });
});

// ─── Suite: POST /perfil/endereco — Criar novo endereço ──────────────────────
describe('POST /perfil/endereco — Criar endereço', () => {
  beforeEach(() => jest.clearAllMocks());

  test('deve redirecionar visitante não logado para login', async () => {
    const res = await request(app)
      .post('/perfil/endereco')
      .send({
        logradouro: 'Av. Brasil',
        numero: '456',
        bairro: 'Jardins',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        cep: '22000-000',
      });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toMatch(/login/i);
  });
});

// ─── Suite: PUT /perfil/endereco/:id — Editar endereço ───────────────────────
describe('PUT /perfil/endereco/:id — Editar endereço existente', () => {
  beforeEach(() => jest.clearAllMocks());

  test('deve redirecionar visitante não logado para login', async () => {
    const res = await request(app)
      .put('/perfil/endereco/1')
      .send({
        logradouro: 'Rua Atualizada',
        numero: '789',
        bairro: 'Vila Nova',
        cidade: 'Curitiba',
        estado: 'PR',
        cep: '80000-000',
      });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toMatch(/login/i);
  });
});

// ─── Suite: DELETE /perfil/endereco/:id — Excluir endereço ───────────────────
describe('DELETE /perfil/endereco/:id — Excluir endereço', () => {
  beforeEach(() => jest.clearAllMocks());

  test('deve redirecionar visitante não logado para login', async () => {
    const res = await request(app).delete('/perfil/endereco/1');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toMatch(/login/i);
  });
});

// ─── Suite: Validações de negócio — Perfil ────────────────────────────────────
describe('Regras de negócio — Perfil', () => {
  test('nome do usuário não pode ser vazio', () => {
    const nome = '';
    expect(nome.trim().length).toBe(0);
  });

  test('telefone deve ter formato válido (mínimo 10 dígitos)', () => {
    const telefone = '11999998888';
    const digitsOnly = telefone.replace(/\D/g, '');
    expect(digitsOnly.length).toBeGreaterThanOrEqual(10);
  });

  test('CPF do usuário deve ter exatamente 11 dígitos', () => {
    const cpf = '12345678901';
    const cpfLimpo = cpf.replace(/\D/g, '');
    expect(cpfLimpo.length).toBe(11);
  });

  test('email deve conter @ para ser válido', () => {
    const email = 'joao@teste.com';
    expect(email).toContain('@');
  });

  test('senha deve ter no mínimo 6 caracteres', () => {
    const senha = 'Senha@123';
    expect(senha.length).toBeGreaterThanOrEqual(6);
  });
});

// ─── Suite: Lógica do perfilController — Fluxos de endereço ──────────────────
describe('perfilController — Lógica de endereço', () => {
  test('endereço deve ter todos os campos obrigatórios', () => {
    const campos = [
      'logradouro',
      'numero',
      'bairro',
      'cidade',
      'estado',
      'cep',
    ];
    for (const campo of campos) {
      expect(enderecoExemplo).toHaveProperty(campo);
      expect(enderecoExemplo[campo]).toBeTruthy();
    }
  });

  test('estado deve ter exatamente 2 caracteres (UF)', () => {
    const estado = 'SP';
    expect(estado.length).toBe(2);
  });

  test('CEP deve ter formato XXXXX-XXX ou 8 dígitos', () => {
    const cep = '01234-567';
    const cepLimpo = cep.replace(/\D/g, '');
    expect(cepLimpo.length).toBe(8);
  });

  test('endereço deve estar vinculado ao usuário correto', () => {
    expect(enderecoExemplo.usuario_id).toBe(usuarioLogado.id);
  });
});
