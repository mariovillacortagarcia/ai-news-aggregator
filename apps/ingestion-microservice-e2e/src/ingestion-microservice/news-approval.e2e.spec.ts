import { ArticleStatus, NewsArticle } from '@ai-news-aggregator/ingestion-microservice/core/domain/entities/news-article';
import { ArgumentError } from '@ai-news-aggregator/ingestion-microservice/core/domain/errors/argument.error';
import {
  IngestionE2eContext,
  createIngestionE2eApp,
  resetIngestionE2eContext,
} from '../support/ingestion-e2e-app';

describe('News Approval E2E', () => {
  let context: IngestionE2eContext;

  beforeEach(async () => {
    context = await createIngestionE2eApp();
  });

  afterEach(async () => {
    await resetIngestionE2eContext(context);
    await context.app.close();
  });

  describe('Successfully approving a candidate article', () => {
    it('should change article status from CANDIDATE to APPROVED', async () => {
      const article = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Quantum Computing Breakthrough',
        'Test content for quantum computing article',
        'Test Author',
        'https://example.com/image.jpg',
        'source-1',
        ArticleStatus.CANDIDATE,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );
      await context.articleRepository.save(article);

      const originalUpdatedAt = article.updatedAt;

      await context.approveArticle.execute('article-1');

      const updatedArticle = await context.articleRepository.findById('article-1');
      expect(updatedArticle).not.toBeNull();
      expect(updatedArticle?.status).toBe(ArticleStatus.APPROVED);
      expect(updatedArticle?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should make article available for downstream polling', async () => {
      const article = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Quantum Computing Breakthrough',
        'Test content',
        'Test Author',
        'https://example.com/image.jpg',
        'source-1',
        ArticleStatus.CANDIDATE,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );
      await context.articleRepository.save(article);

      await context.approveArticle.execute('article-1');

      const updatedArticle = await context.articleRepository.findById('article-1');
      expect(updatedArticle?.status).toBe(ArticleStatus.APPROVED);
    });
  });

  describe('Rejecting an irrelevant article', () => {
    it('should change article status from CANDIDATE to REJECTED', async () => {
      const article = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Quantum Computing Breakthrough',
        'Test content',
        'Test Author',
        'https://example.com/image.jpg',
        'source-1',
        ArticleStatus.CANDIDATE,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );
      await context.articleRepository.save(article);

      const originalUpdatedAt = article.updatedAt;

      await context.rejectArticle.execute('article-1');

      const updatedArticle = await context.articleRepository.findById('article-1');
      expect(updatedArticle).not.toBeNull();
      expect(updatedArticle?.status).toBe(ArticleStatus.REJECTED);
      expect(updatedArticle?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should make article NOT available for downstream polling', async () => {
      const article = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Quantum Computing Breakthrough',
        'Test content',
        'Test Author',
        'https://example.com/image.jpg',
        'source-1',
        ArticleStatus.CANDIDATE,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );
      await context.articleRepository.save(article);

      await context.rejectArticle.execute('article-1');

      const updatedArticle = await context.articleRepository.findById('article-1');
      expect(updatedArticle?.status).toBe(ArticleStatus.REJECTED);
    });
  });

  describe('Preventing approval of an already rejected article', () => {
    it('should not allow approving a REJECTED article', async () => {
      const article = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Quantum Computing Breakthrough',
        'Test content',
        'Test Author',
        'https://example.com/image.jpg',
        'source-1',
        ArticleStatus.REJECTED,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );
      await context.articleRepository.save(article);

      await expect(context.approveArticle.execute('article-1')).rejects.toThrow(ArgumentError);
      await expect(context.approveArticle.execute('article-1')).rejects.toThrow(
        'Cannot approve an article with status REJECTED',
      );

      const updatedArticle = await context.articleRepository.findById('article-1');
      expect(updatedArticle?.status).toBe(ArticleStatus.REJECTED);
    });

    it('should record approval error', async () => {
      const article = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Quantum Computing Breakthrough',
        'Test content',
        'Test Author',
        'https://example.com/image.jpg',
        'source-1',
        ArticleStatus.REJECTED,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );
      await context.articleRepository.save(article);

      let error: Error | null = null;
      try {
        await context.approveArticle.execute('article-1');
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeInstanceOf(ArgumentError);
      expect(error?.message).toBe('Cannot approve an article with status REJECTED');
    });

    it('should keep article NOT available for downstream polling', async () => {
      const article = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Quantum Computing Breakthrough',
        'Test content',
        'Test Author',
        'https://example.com/image.jpg',
        'source-1',
        ArticleStatus.REJECTED,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );
      await context.articleRepository.save(article);

      try {
        await context.approveArticle.execute('article-1');
      } catch (e) {
        // Expected error
      }

      const updatedArticle = await context.articleRepository.findById('article-1');
      expect(updatedArticle?.status).toBe(ArticleStatus.REJECTED);
    });
  });
});
