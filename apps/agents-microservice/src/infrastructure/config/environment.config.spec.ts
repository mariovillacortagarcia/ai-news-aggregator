import { getEnvironmentConfig } from './environment.config';

describe('agents environment config validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {};
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should provide defaults for agents configuration', () => {
    const config = getEnvironmentConfig();

    expect(config).toEqual({
      port: 3001,
    });
  });

  it('should coerce numeric environment values', () => {
    process.env = {
      PORT: '3200',
    };

    const config = getEnvironmentConfig();

    expect(config.port).toBe(3200);
  });

  it('should reject invalid environment values', () => {
    process.env = {
      PORT: 'not-a-port',
    };

    expect(() => getEnvironmentConfig()).toThrow(
      /Invalid agents environment configuration/,
    );
  });
});
