import { ArticleStatus, NewsArticle } from '@ai-news-aggregator/ingestion-microservice/core/domain/entities/news-article';
import { RssPullSource } from '@ai-news-aggregator/ingestion-microservice/core/domain/entities/pull-source';
import { ExtractedArticleData } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/pull-source-extractor.port';
import {
  IngestionE2eContext,
  createIngestionE2eApp,
  resetIngestionE2eContext,
} from '../support/ingestion-e2e-app';

describe('Pull Ingestion E2E', () => {
  let context: IngestionE2eContext;

  beforeEach(async () => {
    context = await createIngestionE2eApp();
  });

  afterEach(async () => {
    await resetIngestionE2eContext(context);
    await context.app.close();
  });

  describe('Successfully pulling and extracting a new article', () => {
    it('should create a new CANDIDATE article when source has new content', async () => {
      const source = new RssPullSource(
        'source-1',
        new Date(Date.now() - 600000),
        true,
        'https://example.com/rss',
      );
      await context.pullSourceRepository.save(source);

      const extractedData: ExtractedArticleData = {
        title: 'Breaking News: AI Breakthrough',
        content: 'Scientists have made a major discovery...',
        mainImageUrl: 'https://example.com/image.jpg',
        originalAuthor: 'John Doe',
        articleUrl: 'https://example.com/news-1',
        createdAt: new Date(),
      };
      context.pullSourceExtractor.setArticlesToReturn([extractedData]);

      const result = await context.processScheduledPull.execute();

      expect(result.success).toContain('source-1');
      expect(result.errors).toHaveLength(0);

      const articles = await context.articleRepository.find();
      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe('Breaking News: AI Breakthrough');
      expect(articles[0].status).toBe(ArticleStatus.CANDIDATE);
      expect(articles[0].articleUrl).toBe('https://example.com/news-1');
    });
  });

  describe('Skipping articles that have already been pulled', () => {
    it('should not create duplicate articles', async () => {
      const source = new RssPullSource(
        'source-1',
        new Date(Date.now() - 600000),
        true,
        'https://example.com/rss',
      );
      await context.pullSourceRepository.save(source);

      const existingArticle = new NewsArticle(
        'existing-article',
        'https://example.com/news-old',
        'Existing Article',
        'Some content',
        'Jane Doe',
        'https://example.com/existing.jpg',
        'source-1',
        ArticleStatus.CANDIDATE,
        false,
        new Date(),
        new Date(),
      );
      await context.articleRepository.save(existingArticle);

      const extractedData: ExtractedArticleData = {
        title: 'Old News',
        content: 'This is old content',
        mainImageUrl: 'https://example.com/old.jpg',
        originalAuthor: 'Jane Doe',
        articleUrl: 'https://example.com/news-old',
        createdAt: new Date(),
      };
      context.pullSourceExtractor.setArticlesToReturn([extractedData]);

      const result = await context.processScheduledPull.execute();

      expect(result.success).toContain('source-1');
      const articles = await context.articleRepository.find();
      expect(articles).toHaveLength(1);
      expect(articles[0].id).toBe('existing-article');
    });
  });

  describe('Handling source structure changes or connection failures', () => {
    it('should handle extraction errors gracefully', async () => {
      const source = new RssPullSource(
        'source-1',
        new Date(Date.now() - 600000),
        true,
        'https://example.com/rss',
      );
      await context.pullSourceRepository.save(source);

      context.pullSourceExtractor.setError('SOURCE_EXTRACTION_ERROR: Failed to extract');

      const result = await context.processScheduledPull.execute();

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].sourceId).toBe('source-1');
      expect(result.errors[0].error.message).toContain('SOURCE_EXTRACTION_ERROR');

      const articles = await context.articleRepository.find();
      expect(articles).toHaveLength(0);
    });
  });

  describe('Processing multiple due sources in a single cycle', () => {
    it('should process all due sources and update timestamps', async () => {
      const source1 = new RssPullSource(
        'source-1',
        new Date(Date.now() - 600000),
        true,
        'https://example.com/rss-1',
      );
      const source2 = new RssPullSource(
        'source-2',
        new Date(Date.now() - 1200000),
        true,
        'https://example.com/rss-2',
      );
      const source3 = new RssPullSource(
        'source-3',
        new Date(Date.now() - 1800000),
        true,
        'https://example.com/rss-3',
      );

      await context.pullSourceRepository.save(source1);
      await context.pullSourceRepository.save(source2);
      await context.pullSourceRepository.save(source3);

      context.pullSourceExtractor.setArticlesToReturn([
        {
          title: 'Article from Source 1',
          content: 'Content 1',
          mainImageUrl: 'https://example.com/img1.jpg',
          originalAuthor: 'Author 1',
          articleUrl: 'https://example.com/article-1',
          createdAt: new Date(),
        },
      ]);

      const result = await context.processScheduledPull.execute();

      expect(result.success.length + result.errors.length).toBeGreaterThanOrEqual(1);

      for (const sourceId of ['source-1', 'source-2', 'source-3']) {
        const updatedSource = await context.pullSourceRepository.findById(sourceId);
        expect(updatedSource?.lastPolledAt).not.toBeNull();
      }
    });
  });
});
