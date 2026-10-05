import { defineConfig } from 'vitest/config';

/** Unit tests: colocated `src/**\/*.spec.ts`. Mirrors the official NestJS 12 ESM starter. */
export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    environment: 'node',
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/main.ts',
        'src/scripts/**',
        'src/**/*.module.ts',
        'src/**/*.dto.ts',
        'src/**/*.spec.ts',
      ],
      reportsDirectory: './coverage',
    },
  },
});
