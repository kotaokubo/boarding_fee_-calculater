import { defineConfig } from 'vitest/config';

export default defineConfig({
  // GitHub Pages deployment settings
  base: '/boarding_fee_-calculater/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['main.js', 'plans-data.js'],
      exclude: [
        'node_modules/**',
        'tests/**',
        '*.config.js',
        'coverage/**',
        'ga4-tracking.js'
      ],
      all: true,
      thresholds: {
        lines: 96,
        functions: 100,
        branches: 90,
        statements: 96
      }
    }
  }
});
