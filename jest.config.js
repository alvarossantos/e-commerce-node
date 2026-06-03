/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  // Evita conflitos com o banco de dados real
  testTimeout: 10000,
};

module.exports = config;
