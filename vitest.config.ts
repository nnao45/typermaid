import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 120000, // 2 minutes for large e2e tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.test.ts', '**/*.spec.ts'],
    },
  },
  resolve: {
    alias: {
      '@typermaid/core': path.resolve(__dirname, 'packages/core/src'),
      '@typermaid/parser': path.resolve(__dirname, 'packages/parser/dist'),
      '@typermaid/codegen': path.resolve(__dirname, 'packages/codegen/dist'),
      '@typermaid/renderer': path.resolve(__dirname, 'packages/renderer/src'),
      '@typermaid/cli': path.resolve(__dirname, 'packages/cli/src'),
    },
  },
});
