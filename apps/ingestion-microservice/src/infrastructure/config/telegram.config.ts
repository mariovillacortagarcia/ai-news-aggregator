export interface TelegramConfig {
  botToken: string;
  adminChatId: string;
  adminUserIds: string[];
  pollingIntervalMs: number;
  pollingEnabled: boolean;
}

export function getTelegramConfig(): TelegramConfig {
  const adminUserIdsEnv = process.env.TELEGRAM_ADMIN_USER_IDS || '';
  
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || '',
    adminUserIds: adminUserIdsEnv.split(',').map(id => id.trim()).filter(id => id !== ''),
    pollingIntervalMs: parseInt(process.env.TELEGRAM_POLLING_INTERVAL_MS || '30000', 10),
    pollingEnabled: process.env.TELEGRAM_POLLING_ENABLED !== 'false',
  };
}
