/**
 * E2E tests boot the whole Nest app over HTTP (supertest).
 * DB_DRIVER=memory (default here) uses the in-memory users adapter, so no MongoDB is needed.
 * CI runs the same suite a second time with DB_DRIVER=mongo against a real MongoDB service.
 */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.e2e-spec.ts$',
  transform: { '^.+\\.ts$': 'ts-jest' },
  testEnvironment: 'node',
};
