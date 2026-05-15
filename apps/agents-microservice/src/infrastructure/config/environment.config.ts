import Joi from 'joi';

export interface AgentsEnvironmentConfig {
  port: number;
}

interface ValidatedEnvironment {
  PORT: number;
}

const environmentSchema = Joi.object<ValidatedEnvironment>({
  PORT: Joi.number().integer().min(1).max(65535).default(3001),
}).unknown(true);

export function getEnvironmentConfig(): AgentsEnvironmentConfig {
  const { error, value } = environmentSchema.validate(process.env, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    const details = error.details.map((detail) => detail.message).join('; ');
    throw new Error(`Invalid agents environment configuration: ${details}`);
  }

  const env = value as ValidatedEnvironment;

  return {
    port: env.PORT,
  };
}
