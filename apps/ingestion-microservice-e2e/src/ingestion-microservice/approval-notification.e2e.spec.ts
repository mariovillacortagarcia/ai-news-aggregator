import { ArticleStatus, NewsArticle } from '@ai-news-aggregator/news-article';
import {
  IngestionE2eContext,
  createIngestionE2eApp,
  resetIngestionE2eContext,
} from '../support/ingestion-e2e-app';

describe('Approval Notification E2E', () => {
  let context: IngestionE2eContext;

  beforeEach(async () => {
    context = await createIngestionE2eApp();
  });

  afterEach(async () => {
    await resetIngestionE2eContext(context);
    await context.app.close();
  });

  describe('Sending a batch notification for pending candidates', () => {
    it('should send notification for unnotified CANDIDATE articles', async () => {
      const articles: NewsArticle[] = [];

      for (let i = 0; i < 5; i++) {
        const article = new NewsArticle(
          `article-${i}`,
          `https://example.com/article-${i}`,
          `Article ${i + 1}`,
          `Content ${i + 1}`,
          `Author ${i + 1}`,
          `https://example.com/image${i}.jpg`,
          'source-1',
          ArticleStatus.CANDIDATE,
          false,
          new Date('2024-01-01T00:00:00Z'),
          new Date('2024-01-01T00:00:00Z'),
        );
        articles.push(article);
        await context.articleRepository.save(article);
      }

      for (let i = 0; i < 2; i++) {
        articles[i].notify();
        await context.articleRepository.update(articles[i]);
      }

      await context.sendBatchNotification.execute();

      const lastNotification =
        context.telegramNotification.getLastNotification();
      expect(lastNotification).not.toBeNull();
      expect(lastNotification?.length).toBe(3);

      const allArticles = await context.articleRepository.find();
      const notifiedArticles = allArticles.filter((a) => a.notified);
      expect(notifiedArticles.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('No notification sent when all candidates are already notified', () => {
    it('should skip notification when all articles are notified', async () => {
      for (let i = 0; i < 2; i++) {
        const article = new NewsArticle(
          `article-${i}`,
          `https://example.com/article-${i}`,
          `Article ${i + 1}`,
          `Content ${i + 1}`,
          `Author ${i + 1}`,
          `https://example.com/image${i}.jpg`,
          'source-1',
          ArticleStatus.CANDIDATE,
          true,
          new Date('2024-01-01T00:00:00Z'),
          new Date('2024-01-01T00:00:00Z'),
        );
        await context.articleRepository.save(article);
      }

      await context.sendBatchNotification.execute();

      const lastNotification =
        context.telegramNotification.getLastNotification();
      expect(lastNotification).toBeNull();
    });
  });

  describe('No notification sent when there are no candidate articles', () => {
    it('should skip notification when no CANDIDATE articles exist', async () => {
      const approvedArticle = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Approved Article',
        'Content',
        'Author',
        'https://example.com/image.jpg',
        'source-1',
        ArticleStatus.APPROVED,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );
      await context.articleRepository.save(approvedArticle);

      const rejectedArticle = new NewsArticle(
        'article-2',
        'https://example.com/article-2',
        'Rejected Article',
        'Content',
        'Author',
        'https://example.com/image2.jpg',
        'source-1',
        ArticleStatus.REJECTED,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );
      await context.articleRepository.save(rejectedArticle);

      await context.sendBatchNotification.execute();

      const lastNotification =
        context.telegramNotification.getLastNotification();
      expect(lastNotification).toBeNull();
    });
  });
});
