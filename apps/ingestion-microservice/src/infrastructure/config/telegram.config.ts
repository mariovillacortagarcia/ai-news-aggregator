import { getEnvironmentConfig } from './environment.config';

export interface TelegramConfig {
  botToken: string;
  adminChatId: string;
  adminUserIds: string[];
  pollingIntervalMs: number;
  pollingEnabled: boolean;
}

export function getTelegramConfig(): TelegramConfig {
  const config = getEnvironmentConfig();
  
  return {
    botToken: config.telegramBotToken,
    adminChatId: config.telegramAdminChatId,
    adminUserIds: config.telegramAdminUserIds,
    pollingIntervalMs: config.telegramPollingIntervalMs,
    pollingEnabled: config.telegramPollingEnabled,
  };
}
