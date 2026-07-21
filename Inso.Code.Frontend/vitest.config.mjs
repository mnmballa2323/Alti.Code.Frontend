import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/store': path.resolve(__dirname, './test-mocks/store.js'),
      '@': path.resolve(__dirname, './'),
      '@asamuzakjp/css-color': path.resolve(__dirname, './test-mocks/css-color.js'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
});
