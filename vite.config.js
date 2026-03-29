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
      lines: 96,     // Development environment code excluded from coverage
      functions: 100,
      branches: 97,  // Development environment code excluded from coverage
      statements: 96, // Development environment code excluded from coverage
      thresholds: {
        lines: 96,
        functions: 100,
        branches: 97,
        statements: 96
      }
    }
  }
});
