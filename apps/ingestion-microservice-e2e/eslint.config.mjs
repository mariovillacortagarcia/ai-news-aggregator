import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['src/**/*.spec.ts', 'src/support/ingestion-e2e-app.ts'],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },
];
