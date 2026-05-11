process.env.TS_NODE_PROJECT = 'tsconfig.cucumber.json';

module.exports = {
  default: {
    require: [
      'test/cucumber.ts',
      'test/step-definitions/*.steps.ts'
    ],
    paths: ['test/features/**/*.feature'],
    requireModule: ['ts-node/register'],
    format: ['progress'],
    publishQuiet: true,
    strict: true,
    failZero: true,
  },
};
