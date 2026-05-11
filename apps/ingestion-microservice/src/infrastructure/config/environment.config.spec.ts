import { getEnvironmentConfig } from './environment.config';

describe('environment config validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {};
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should provide defaults for optional ingestion configuration', () => {
    const config = getEnvironmentConfig();

    expect(config).toMatchObject({
      port: 3000,
      supabaseUrl: '',
      supabaseServiceRoleKey: '',
      supabaseNewsArticlesTable: 'news_articles',
      supabasePullSourcesTable: 'pull_sources',
      telegramBotToken: '',
      telegramAdminChatId: '',
      telegramAdminUserIds: [],
      telegramPollingIntervalMs: 30000,
      telegramPollingEnabled: true,
      pullSourcesPollIntervalMs: 300000,
      pullSourcesSchedulerEnabled: true,
      approvalNotificationSchedulerEnabled: true,
    });
  });

  it('should coerce numeric and boolean environment values', () => {
    process.env = {
      PORT: '3100',
      TELEGRAM_ADMIN_USER_IDS: '123, 987',
      TELEGRAM_POLLING_INTERVAL_MS: '1000',
      TELEGRAM_POLLING_ENABLED: 'false',
      PULL_SOURCES_POLL_INTERVAL_MS: '2000',
      PULL_SOURCES_SCHEDULER_ENABLED: '0',
      APPROVAL_NOTIFICATION_SCHEDULER_ENABLED: 'yes',
    };

    const config = getEnvironmentConfig();

    expect(config.port).toBe(3100);
    expect(config.telegramAdminUserIds).toEqual(['123', '987']);
    expect(config.telegramPollingIntervalMs).toBe(1000);
    expect(config.telegramPollingEnabled).toBe(false);
    expect(config.pullSourcesPollIntervalMs).toBe(2000);
    expect(config.pullSourcesSchedulerEnabled).toBe(false);
    expect(config.approvalNotificationSchedulerEnabled).toBe(true);
  });

  it('should reject invalid environment values', () => {
    process.env = {
      PORT: 'not-a-port',
      SUPABASE_URL: 'not-a-url',
      TELEGRAM_ADMIN_USER_IDS: '123,not-a-number',
    };

    expect(() => getEnvironmentConfig()).toThrow(
      /Invalid ingestion environment configuration/,
    );
  });
});
