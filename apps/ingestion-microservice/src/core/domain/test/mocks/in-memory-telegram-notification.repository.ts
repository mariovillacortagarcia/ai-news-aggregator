import { TelegramNotificationPort, ArticleNotificationData } from '../../ports/telegram-notification.port';

export class InMemoryTelegramNotificationRepository implements TelegramNotificationPort {
  private sentNotifications: ArticleNotificationData[][] = [];

  async sendBatchNotification(articles: ArticleNotificationData[]): Promise<void> {
    this.sentNotifications.push(articles);
  }

  getSentNotifications(): ArticleNotificationData[][] {
    return this.sentNotifications;
  }

  getLastNotification(): ArticleNotificationData[] | null {
    if (this.sentNotifications.length === 0) {
      return null;
    }
    return this.sentNotifications[this.sentNotifications.length - 1];
  }

  clear(): void {
    this.sentNotifications = [];
  }
}
