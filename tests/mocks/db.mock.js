/**
 * tests/mocks/db.mock.js
 *
 * Mock do pool de conexão do PostgreSQL.
 * Os testes NÃO tocam o banco real — usamos respostas simuladas.
 */

const mockQuery = jest.fn();

const mockPool = {
  query: mockQuery,
  connect: jest.fn().mockResolvedValue({
    query: mockQuery,
    release: jest.fn(),
  }),
};

// Substitui o módulo real pelo mock antes de qualquer import
jest.mock('../../src/backend/config/database', () => mockPool);

module.exports = { mockPool, mockQuery };
