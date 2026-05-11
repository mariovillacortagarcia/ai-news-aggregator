module.exports = {
  displayName: 'ingestion-microservice',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/ingestion-microservice',
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
};
