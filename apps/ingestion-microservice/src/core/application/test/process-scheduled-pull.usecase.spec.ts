import { RssPullSource } from "../../domain/entities/pull-source";
import { InMemoryPullSourceRepository } from "../../domain/test/mocks/in-memory-pull-source.repository";
import { InMemoryNewsArticleRepository } from '@ai-news-aggregator/news-article';
import { InMemoryPullSourceExtractor } from "../../domain/test/mocks/in-memory-pull-source.extractor";
import { ProcessScheduledPullUseCase } from "../use-cases/process-scheduled-pull.use-case";

describe('ProcessScheduledPullUseCase', () => {
  let useCase: ProcessScheduledPullUseCase;
  let pullSourceRepository: InMemoryPullSourceRepository;
  let newsArticleRepository: InMemoryNewsArticleRepository;
  let extractor: InMemoryPullSourceExtractor;

  beforeEach(() => {
    pullSourceRepository = new InMemoryPullSourceRepository();
    newsArticleRepository = new InMemoryNewsArticleRepository();
    extractor = new InMemoryPullSourceExtractor();
    useCase = new ProcessScheduledPullUseCase(pullSourceRepository, newsArticleRepository, extractor);
  });

  describe('execute', () => {
    it('should process all due sources and return success list', async () => {
      const source = new RssPullSource(
        'source-1',
        new Date('2024-01-01T00:00:00Z'),
        true,
        'https://example.com/rss'
      );

      await pullSourceRepository.save(source);

      extractor.setArticlesToReturn([
        {
          title: 'New Article',
          content: 'Content',
          mainImageUrl: 'https://example.com/image.jpg',
          originalAuthor: 'Author',
          articleUrl: 'https://example.com/article',
          createdAt: new Date('2024-01-01T00:30:00Z')
        }
      ]);

      const now = new Date('2024-01-01T01:00:00Z');
      const result = await useCase.execute();

      expect(result.success).toContain('source-1');
      expect(result.errors).toEqual([]);
    });

    it('should skip articles that already exist by URL', async () => {
      const source = new RssPullSource(
        'source-1',
        new Date('2024-01-01T00:00:00Z'),
        true,
        'https://example.com/rss'
      );

      await pullSourceRepository.save(source);

      extractor.setArticlesToReturn([
        {
          title: 'Existing Article',
          content: 'Content',
          mainImageUrl: 'https://example.com/image.jpg',
          originalAuthor: 'Author',
          articleUrl: 'https://example.com/existing',
          createdAt: new Date('2024-01-01T00:30:00Z')
        }
      ]);

      const result = await useCase.execute();

      expect(result.success).toContain('source-1');
      expect(result.errors).toEqual([]);
    });

    it('should continue processing other sources when one fails', async () => {
      const source1 = new RssPullSource(
        'source-1',
        new Date('2024-01-01T00:00:00Z'),
        true,
        'https://example.com/rss-1'
      );

      const source2 = new RssPullSource(
        'source-2',
        new Date('2024-01-01T00:00:00Z'),
        true,
        'https://example.com/rss-2'
      );

      await pullSourceRepository.save(source1);
      await pullSourceRepository.save(source2);

      extractor.setError('SOURCE_EXTRACTION_ERROR: Failed');

      const result = await useCase.execute();

      expect(result.errors.length).toBe(2);
      expect(result.errors.map(e => e.sourceId)).toContain('source-1');
      expect(result.errors.map(e => e.sourceId)).toContain('source-2');
    });

    it('should update lastPolledAt for all processed sources', async () => {
      const source = new RssPullSource(
        'source-1',
        new Date('2024-01-01T00:00:00Z'),
        true,
        'https://example.com/rss'
      );

      await pullSourceRepository.save(source);

      await useCase.execute();

      const updated = await pullSourceRepository.findById('source-1');
      expect(updated?.lastPolledAt).toBeDefined();
    });

  });
});
