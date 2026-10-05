import { defineConfig } from 'vitest/config';

/**
 * E2E: boots the whole Nest app over HTTP (supertest).
 * DB_DRIVER defaults to `memory` (no MongoDB needed); CI re-runs the suite with
 * DB_DRIVER=mongo against a real MongoDB service. Values already set in the shell win.
 */
export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    environment: 'node',
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      THROTTLE_LIMIT: '1000',
      DB_DRIVER: process.env.DB_DRIVER ?? 'memory',
      MONGODB_URI: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/easygenerator-auth-e2e',
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? 'e2e-access-secret-0123456789-abcdefghij',
      JWT_REFRESH_SECRET:
        process.env.JWT_REFRESH_SECRET ?? 'e2e-refresh-secret-0123456789-abcdefghij',
    },
  },
});
