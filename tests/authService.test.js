/**
 * tests/authService.test.js
 *
 * Testes unitários dedicados ao AuthService:
 * - validarCredenciais
 * - gerarToken
 * - cookieOptions
 * - migrarCarrinhoVisitante
 * - cadastrarUsuario
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../src/backend/config/database', () => ({
  query: jest.fn(),
}));

const db = require('../src/backend/config/database');

// Importa o service diretamente (após o mock do database)
const {
  SECRET,
  validarCredenciais,
  gerarToken,
  cookieOptions,
  migrarCarrinhoVisitante,
  cadastrarUsuario,
} = require('../src/backend/services/authService');

// Repositórios que o AuthService usa internamente
const UsuarioRepository = require('../src/backend/repositories/usuarioRepository');
const CarrinhoRepository = require('../src/backend/repositories/carrinhoRepository');

// ─── Helpers ─────────────────────────────────────────────────────────────────
const hashSenha = async (senha) => bcrypt.hash(senha, 10);

const usuarioValido = {
  id: 1,
  nome: 'João Teste',
  email: 'joao@teste.com',
  senha: 'Senha@123',
  cpf: '12345678901',
  data_nascimento: '2000-01-01',
};

const usuarioNoBanco = {
  ...usuarioValido,
  senha_hash: null, // será preenchido nos testes
  is_admin: false,
  ativo: true,
  url_foto: '/img/usuarios/default.png',
};

// ─── Suite: SECRET ───────────────────────────────────────────────────────────
describe('AuthService — Constante SECRET', () => {
  test('SECRET deve estar definido e ser uma string', () => {
    expect(typeof SECRET).toBe('string');
    expect(SECRET.length).toBeGreaterThan(0);
  });
});

// ─── Suite: validarCredenciais ──────────────────────────────────────────────
describe('validarCredenciais — Validação de login', () => {
  beforeEach(() => jest.clearAllMocks());

  test('deve retornar o usuário quando credenciais são válidas', async () => {
    const senhaHash = await hashSenha('Senha@123');
    const user = { ...usuarioNoBanco, senha_hash: senhaHash };

    // Mock: buscarPorEmail retorna o usuário
    db.query.mockResolvedValueOnce({ rows: [user] });

    const resultado = await validarCredenciais('joao@teste.com', 'Senha@123');

    expect(resultado).toBeDefined();
    expect(resultado.email).toBe('joao@teste.com');
    expect(resultado.senha_hash).toBe(senhaHash);
  });

  test('deve lançar CREDENCIAIS_INVALIDAS quando email não existe', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    await expect(
      validarCredenciais('inexistente@teste.com', 'qualquer')
    ).rejects.toMatchObject({ tipo: 'CREDENCIAIS_INVALIDAS' });
  });

  test('deve lançar CREDENCIAIS_INVALIDAS quando senha está incorreta', async () => {
    const senhaHash = await hashSenha('SenhaCerta');
    const user = { ...usuarioNoBanco, senha_hash: senhaHash };

    db.query.mockResolvedValueOnce({ rows: [user] });

    await expect(
      validarCredenciais('joao@teste.com', 'SenhaErrada')
    ).rejects.toMatchObject({ tipo: 'CREDENCIAIS_INVALIDAS' });
  });

  test('deve lançar CONTA_INATIVA quando usuário está desativado', async () => {
    const senhaHash = await hashSenha('Senha@123');
    const user = { ...usuarioNoBanco, senha_hash: senhaHash, ativo: false };

    db.query.mockResolvedValueOnce({ rows: [user] });

    await expect(
      validarCredenciais('joao@teste.com', 'Senha@123')
    ).rejects.toMatchObject({ tipo: 'CONTA_INATIVA' });
  });
});

// ─── Suite: gerarToken ──────────────────────────────────────────────────────
describe('gerarToken — Geração de JWT', () => {
  test('deve retornar uma string JWT válida', () => {
    const token = gerarToken(usuarioNoBanco);

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // header.payload.signature
  });

  test('token decodificado deve conter os dados do usuário', () => {
    const token = gerarToken(usuarioNoBanco);
    const decodificado = jwt.verify(token, SECRET);

    expect(decodificado.id).toBe(usuarioNoBanco.id);
    expect(decodificado.nome).toBe(usuarioNoBanco.nome);
    expect(decodificado.is_admin).toBe(usuarioNoBanco.is_admin);
    expect(decodificado.url_foto).toBe(usuarioNoBanco.url_foto);
  });

  test('token deve expirar em 24 horas', () => {
    const token = gerarToken(usuarioNoBanco);
    const decodificado = jwt.verify(token, SECRET);

    const agora = Math.floor(Date.now() / 1000);
    const diferenca = decodificado.exp - agora;

    // Dentro de 23h59m e 24h01m (margem de 2 min)
    expect(diferenca).toBeGreaterThanOrEqual(23 * 60 * 60);
    expect(diferenca).toBeLessThanOrEqual(24 * 60 * 60 + 120);
  });

  test('deve gerar tokens diferentes para usuários diferentes', () => {
    const usuario2 = { ...usuarioNoBanco, id: 99, nome: 'Outro' };
    const token1 = gerarToken(usuarioNoBanco);
    const token2 = gerarToken(usuario2);

    expect(token1).not.toBe(token2);
  });
});

// ─── Suite: cookieOptions ────────────────────────────────────────────────────
describe('cookieOptions — Opções do cookie', () => {
  test('deve retornar objeto com httpOnly=true', () => {
    const opts = cookieOptions();
    expect(opts.httpOnly).toBe(true);
  });

  test('deve retornar sameSite lax', () => {
    const opts = cookieOptions();
    expect(opts.sameSite).toBe('lax');
  });

  test('secure deve ser false em ambiente não-production', () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    const opts = cookieOptions();
    expect(opts.secure).toBe(false);

    process.env.NODE_ENV = original;
  });

  test('secure deve ser true em ambiente production', () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const opts = cookieOptions();
    expect(opts.secure).toBe(true);

    process.env.NODE_ENV = original;
  });
});

// ─── Suite: migrarCarrinhoVisitante ──────────────────────────────────────────
describe('migrarCarrinhoVisitante — Merge cookie → banco', () => {
  beforeEach(() => jest.clearAllMocks());

  test('não deve fazer nada quando não existe cookie carrinho_visitante', async () => {
    const clearCookie = jest.fn();
    await migrarCarrinhoVisitante(1, {}, clearCookie);

    expect(clearCookie).not.toHaveBeenCalled();
  });

  test('deve limpar cookie quando carrinho_visitante é JSON inválido', async () => {
    const clearCookie = jest.fn();
    await migrarCarrinhoVisitante(1, { carrinho_visitante: 'lixo{json' }, clearCookie);

    expect(clearCookie).toHaveBeenCalledWith('carrinho_visitante');
  });

  test('deve limpar cookie quando carrinho_visitante não é array', async () => {
    const clearCookie = jest.fn();
    await migrarCarrinhoVisitante(
      1,
      { carrinho_visitante: JSON.stringify({ chave: 'valor' }) },
      clearCookie
    );

    expect(clearCookie).toHaveBeenCalledWith('carrinho_visitante');
  });

  test('deve inserir itens no banco e limpar cookie', async () => {
    const carrinhoItens = [
      { produto_id: 1, quantidade: 2 },
      { produto_id: 3, quantidade: 1 },
    ];

    // Mock do adicionarItem
    db.query.mockResolvedValue({ rows: [{ id: 1 }] });

    const clearCookie = jest.fn();
    await migrarCarrinhoVisitante(
      42,
      { carrinho_visitante: JSON.stringify(carrinhoItens) },
      clearCookie
    );

    // Deve ter chamado o insert 2 vezes (um por item)
    const inserts = db.query.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].includes('INSERT')
    );
    expect(inserts.length).toBe(2);
    expect(clearCookie).toHaveBeenCalledWith('carrinho_visitante');
  });
});

// ─── Suite: cadastrarUsuario ─────────────────────────────────────────────────
describe('cadastrarUsuario — Registro de novo usuário', () => {
  beforeEach(() => jest.clearAllMocks());

  const dadosValidos = {
    nome: 'Maria Teste',
    email: 'maria@teste.com',
    senha: 'Senha@456',
    cpf: '98765432100',
    data_nascimento: '1995-05-15',
  };

  test('deve criar usuário com dados válidos', async () => {
    // Mock: email livre
    db.query.mockResolvedValueOnce({ rows: [] });
    // Mock: insert retornando o usuário criado
    const usuarioCriado = {
      id: 10,
      ...dadosValidos,
      senha_hash: 'hashqualquer',
      url_foto: '/img/usuarios/default.png',
      ativo: true,
      is_admin: false,
    };
    db.query.mockResolvedValueOnce({ rows: [usuarioCriado] });

    const resultado = await cadastrarUsuario(dadosValidos);

    expect(resultado).toBeDefined();
    expect(resultado.id).toBe(10);
    expect(resultado.email).toBe('maria@teste.com');
  });

  test('deve lançar EMAIL_INVALIDO quando email não tem @', async () => {
    await expect(
      cadastrarUsuario({ ...dadosValidos, email: 'sem_arroba' })
    ).rejects.toMatchObject({ tipo: 'EMAIL_INVALIDO' });
  });

  test('deve lançar EMAIL_INVALIDO quando email é vazio', async () => {
    await expect(
      cadastrarUsuario({ ...dadosValidos, email: '' })
    ).rejects.toMatchObject({ tipo: 'EMAIL_INVALIDO' });
  });

  test('deve lançar CPF_INVALIDO quando CPF tem menos de 11 dígitos', async () => {
    await expect(
      cadastrarUsuario({ ...dadosValidos, cpf: '123' })
    ).rejects.toMatchObject({ tipo: 'CPF_INVALIDO' });
  });

  test('deve lançar CPF_INVALIDO quando CPF não é informado', async () => {
    await expect(
      cadastrarUsuario({ ...dadosValidos, cpf: null })
    ).rejects.toMatchObject({ tipo: 'CPF_INVALIDO' });
  });

  test('deve lançar EMAIL_DUPLICADO quando email já existe no banco', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // email já existe

    await expect(cadastrarUsuario(dadosValidos)).rejects.toMatchObject({
      tipo: 'EMAIL_DUPLICADO',
    });
  });

  test('deve criptografar a senha antes de salvar', async () => {
    // Email livre
    db.query.mockResolvedValueOnce({ rows: [] });
    // Insert
    db.query.mockResolvedValueOnce({ rows: [{ id: 10 }] });

    await cadastrarUsuario(dadosValidos);

    // Verifica a chamada de INSERT (segunda chamada ao db.query)
    const insertCall = db.query.mock.calls[1];
    const sqlInsert = insertCall[0];
    const paramsInsert = insertCall[1];

    expect(sqlInsert).toContain('INSERT INTO usuarios');
    // A senha_hash não deve ser a senha em texto plano
    expect(paramsInsert[2]).not.toBe(dadosValidos.senha);
    // Deve ser um hash bcrypt válido
    expect(paramsInsert[2]).toMatch(/^\$2[aby]?\$/);
  });

  test('deve limpar caracteres não numéricos do CPF', async () => {
    // Email livre
    db.query.mockResolvedValueOnce({ rows: [] });
    // Insert
    db.query.mockResolvedValueOnce({ rows: [{ id: 10 }] });

    await cadastrarUsuario({
      ...dadosValidos,
      cpf: '987.654.321-00',
    });

    const insertCall = db.query.mock.calls[1];
    const paramsInsert = insertCall[1];

    // CPF deve estar limpo (só dígitos)
    expect(paramsInsert[3]).toBe('98765432100');
  });
});
