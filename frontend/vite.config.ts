/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      // Same-origin in dev: the SPA calls /api and Vite forwards it, so the SameSite=Strict
      // refresh cookie just works and there is no CORS to configure. Production does the same
      // with nginx (see nginx.conf).
      proxy: {
        '/api': { target: env.VITE_API_PROXY_TARGET || 'http://localhost:3000', changeOrigin: true },
      },
    },
    build: {
      rolldownOptions: {
        output: {
          // Long-term-cacheable vendor chunks: app deploys don't bust the framework download.
          codeSplitting: {
            groups: [
              { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/ },
              { name: 'vendor', test: /node_modules/ },
            ],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      restoreMocks: true,
    },
  };
});
