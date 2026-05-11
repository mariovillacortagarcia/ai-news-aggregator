import { TelegramNotificationPort, ArticleNotificationData } from '../ports/telegram-notification.port';
import { InMemoryTelegramNotificationRepository } from './mocks/in-memory-telegram-notification.repository';

describe('TelegramNotificationPort', () => {
  let repository: TelegramNotificationPort;

  beforeEach(() => {
    repository = new InMemoryTelegramNotificationRepository();
  });

  describe('sendBatchNotification', () => {
    it('should send a batch notification with article data', async () => {
      const articles: ArticleNotificationData[] = [
        {
          articleId: 'article-1',
          title: 'Article 1',
          articleUrl: 'https://example.com/article-1',
          mainImageUrl: 'https://example.com/image1.jpg',
          originalAuthor: 'Author 1'
        },
        {
          articleId: 'article-2',
          title: 'Article 2',
          articleUrl: 'https://example.com/article-2',
          mainImageUrl: 'https://example.com/image2.jpg',
          originalAuthor: 'Author 2'
        }
      ];

      await repository.sendBatchNotification(articles);

      const lastNotification = (repository as InMemoryTelegramNotificationRepository).getLastNotification();
      expect(lastNotification).toEqual(articles);
    });

    it('should store multiple batch notifications', async () => {
      const batch1: ArticleNotificationData[] = [
        {
          articleId: 'article-1',
          title: 'Article 1',
          articleUrl: 'https://example.com/article-1',
          mainImageUrl: 'https://example.com/image1.jpg',
          originalAuthor: 'Author 1'
        }
      ];

      const batch2: ArticleNotificationData[] = [
        {
          articleId: 'article-2',
          title: 'Article 2',
          articleUrl: 'https://example.com/article-2',
          mainImageUrl: 'https://example.com/image2.jpg',
          originalAuthor: 'Author 2'
        }
      ];

      await repository.sendBatchNotification(batch1);
      await repository.sendBatchNotification(batch2);

      const allNotifications = (repository as InMemoryTelegramNotificationRepository).getSentNotifications();
      expect(allNotifications.length).toBe(2);
      expect(allNotifications[0]).toEqual(batch1);
      expect(allNotifications[1]).toEqual(batch2);
    });

    it('should handle empty article arrays', async () => {
      await repository.sendBatchNotification([]);

      const lastNotification = (repository as InMemoryTelegramNotificationRepository).getLastNotification();
      expect(lastNotification).toEqual([]);
    });

    it('should clear notifications when clear is called', async () => {
      const articles: ArticleNotificationData[] = [
        {
          articleId: 'article-1',
          title: 'Article 1',
          articleUrl: 'https://example.com/article-1',
          mainImageUrl: 'https://example.com/image1.jpg',
          originalAuthor: 'Author 1'
        }
      ];

      await repository.sendBatchNotification(articles);
      (repository as InMemoryTelegramNotificationRepository).clear();

      const lastNotification = (repository as InMemoryTelegramNotificationRepository).getLastNotification();
      expect(lastNotification).toBeNull();
    });

    it('should return null for getLastNotification when no notifications sent', async () => {
      const lastNotification = (repository as InMemoryTelegramNotificationRepository).getLastNotification();
      expect(lastNotification).toBeNull();
    });

    it('should return empty array for getSentNotifications when no notifications sent', async () => {
      const allNotifications = (repository as InMemoryTelegramNotificationRepository).getSentNotifications();
      expect(allNotifications).toEqual([]);
    });
  });
});
