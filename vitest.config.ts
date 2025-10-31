import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.test.ts', '**/*.spec.ts'],
    },
  },
  resolve: {
    alias: {
      '@lyric-js/core': path.resolve(__dirname, 'packages/core/src'),
      '@lyric-js/parser': path.resolve(__dirname, 'packages/parser/src'),
      '@lyric-js/renderer': path.resolve(__dirname, 'packages/renderer/src'),
      '@lyric-js/cli': path.resolve(__dirname, 'packages/cli/src'),
    },
  },
});
