import Joi from 'joi';

export interface IngestionEnvironmentConfig {
  port: number;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  supabaseNewsArticlesTable: string;
  supabasePullSourcesTable: string;
  telegramBotToken: string;
  telegramAdminChatId: string;
  telegramAdminUserIds: string[];
  telegramPollingEnabled: boolean;
  pullSourcesPollIntervalMs: number;
  pullSourcesSchedulerEnabled: boolean;
  approvalNotificationSchedulerEnabled: boolean;
}

interface ValidatedEnvironment {
  PORT: number;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_NEWS_ARTICLES_TABLE: string;
  SUPABASE_PULL_SOURCES_TABLE: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_ADMIN_CHAT_ID: string;
  TELEGRAM_ADMIN_USER_IDS: string;
  TELEGRAM_POLLING_ENABLED: boolean;
  PULL_SOURCES_POLL_INTERVAL_MS: number;
  PULL_SOURCES_SCHEDULER_ENABLED: boolean;
  APPROVAL_NOTIFICATION_SCHEDULER_ENABLED: boolean;
}

const booleanSchema = Joi.boolean()
  .truthy('true')
  .truthy('1')
  .truthy('yes')
  .falsy('false')
  .falsy('0')
  .falsy('no');

const environmentSchema = Joi.object<ValidatedEnvironment>({
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  SUPABASE_URL: Joi.string().uri().allow('').default(''),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().allow('').default(''),
  SUPABASE_NEWS_ARTICLES_TABLE: Joi.string()
    .pattern(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
    .default('news_articles'),
  SUPABASE_PULL_SOURCES_TABLE: Joi.string()
    .pattern(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
    .default('pull_sources'),
  TELEGRAM_BOT_TOKEN: Joi.string().allow('').default(''),
  TELEGRAM_ADMIN_CHAT_ID: Joi.string().allow('').default(''),
  TELEGRAM_ADMIN_USER_IDS: Joi.string()
    .pattern(/^\s*$|^\d+(?:\s*,\s*\d+)*$/)
    .allow('')
    .default(''),
  TELEGRAM_POLLING_ENABLED: booleanSchema.default(true),
  PULL_SOURCES_POLL_INTERVAL_MS: Joi.number().integer().min(1).default(300000),
  PULL_SOURCES_SCHEDULER_ENABLED: booleanSchema.default(true),
  APPROVAL_NOTIFICATION_SCHEDULER_ENABLED: booleanSchema.default(true),
}).unknown(true);

export function getEnvironmentConfig(): IngestionEnvironmentConfig {
  const { error, value } = environmentSchema.validate(process.env, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    const details = error.details.map((detail) => detail.message).join('; ');
    throw new Error(`Invalid ingestion environment configuration: ${details}`);
  }

  const env = value as ValidatedEnvironment;

  return {
    port: env.PORT,
    supabaseUrl: env.SUPABASE_URL,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseNewsArticlesTable: env.SUPABASE_NEWS_ARTICLES_TABLE,
    supabasePullSourcesTable: env.SUPABASE_PULL_SOURCES_TABLE,
    telegramBotToken: env.TELEGRAM_BOT_TOKEN,
    telegramAdminChatId: env.TELEGRAM_ADMIN_CHAT_ID,
    telegramAdminUserIds: env.TELEGRAM_ADMIN_USER_IDS.split(',')
      .map((id) => id.trim())
      .filter((id) => id !== ''),
    telegramPollingEnabled: env.TELEGRAM_POLLING_ENABLED,
    pullSourcesPollIntervalMs: env.PULL_SOURCES_POLL_INTERVAL_MS,
    pullSourcesSchedulerEnabled: env.PULL_SOURCES_SCHEDULER_ENABLED,
    approvalNotificationSchedulerEnabled: env.APPROVAL_NOTIFICATION_SCHEDULER_ENABLED,
  };
}

export function resetEnvironmentConfigForTest(): void {
  // Kept as a stable test helper for modules that reset config state.
}
