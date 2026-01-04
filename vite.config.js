import { defineConfig } from 'vite';

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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['main.js', 'plans-data.js', 'ga4-tracking.js'],
      exclude: [
        'node_modules/**',
        'tests/**',
        '*.config.js',
        'coverage/**'
      ],
      all: true,
      lines: 99,     // 99% due to untestable crypto.subtle check for old browsers
      functions: 100,
      branches: 99,  // 99% due to untestable crypto.subtle check
      statements: 99, // 99% due to untestable crypto.subtle check for old browsers
      thresholds: {
        lines: 99,
        functions: 100,
        branches: 99,
        statements: 99
      }
    }
  }
});
