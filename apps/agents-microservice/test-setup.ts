import { Logger } from '@nestjs/common';

beforeAll(() => {
  Logger.overrideLogger(['error']);
});

afterAll(() => {
  Logger.overrideLogger(['error', 'warn', 'log', 'debug']);
});
