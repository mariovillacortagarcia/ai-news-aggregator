import { RssPullSource } from "../../domain/entities/pull-source";
import { NewsArticle } from "../../domain/entities/news-article";
import { InMemoryPullSourceRepository } from "../../domain/test/mocks/in-memory-pull-source.repository";
import { InMemoryNewsArticleRepository } from "../../domain/test/mocks/in-memory-news-article.repository";
import { InMemoryPullSourceExtractor } from "../../domain/test/mocks/in-memory-pull-source.extractor";
import { PullArticlesFromSourceUseCase } from "../use-cases/pull-articles-from-source.use-case";
import { ExtractedArticleData } from "../../domain/ports/pull-source-extractor.port";

describe('PullArticlesFromSourceUseCase', () => {
  let useCase: PullArticlesFromSourceUseCase;
  let pullSourceRepository: InMemoryPullSourceRepository;
  let newsArticleRepository: InMemoryNewsArticleRepository;
  let extractor: InMemoryPullSourceExtractor;

  beforeEach(() => {
    pullSourceRepository = new InMemoryPullSourceRepository();
    newsArticleRepository = new InMemoryNewsArticleRepository();
    extractor = new InMemoryPullSourceExtractor();
    useCase = new PullArticlesFromSourceUseCase(pullSourceRepository, newsArticleRepository, extractor);
  });

  describe('execute', () => {
    it('should extract and return new articles from a source', async () => {
      const source = new RssPullSource(
        'source-1',
        new Date('2024-01-01T00:00:00Z'),
        true,
        'https://example.com/rss'
      );

      await pullSourceRepository.save(source);

      extractor.setArticlesToReturn([
        {
          title: 'New Article 1',
          content: 'Content of article 1',
          mainImageUrl: 'https://example.com/image1.jpg',
          originalAuthor: 'Author 1',
          articleUrl: 'https://example.com/article-1',
          createdAt: new Date('2024-01-01T00:00:00Z')
        },
        {
          title: 'New Article 2',
          content: 'Content of article 2',
          mainImageUrl: 'https://example.com/image2.jpg',
          originalAuthor: 'Author 2',
          articleUrl: 'https://example.com/article-2',
          createdAt: new Date('2024-01-01T00:00:00Z')
        }
      ]);

      const result = await useCase.execute(source.id);

      expect(result.length).toBe(2);
      expect(result[0].title).toBe('New Article 1');
      expect(result[1].title).toBe('New Article 2');
    });

    it('should not return articles that already exist by URL', async () => {
      const source = new RssPullSource(
        'source-1',
        new Date('2024-01-01T00:00:00Z'),
        true,
        'https://example.com/rss'
      );

      await pullSourceRepository.save(source);

      const existingArticle = new NewsArticle(
        'existing-article',
        'https://example.com/existing-article',
        'Existing Article',
        'This article already exists',
        'Existing Author',
        'https://example.com/existing-image.jpg',
        'source-1'
      );

      await newsArticleRepository.save(existingArticle);

      extractor.setArticlesToReturn([
        {
          title: 'Existing Article',
          content: 'This article already exists',
          mainImageUrl: 'https://example.com/existing-image.jpg',
          originalAuthor: 'Existing Author',
          articleUrl: 'https://example.com/existing-article',
          createdAt: new Date('2024-01-01T00:00:00Z')
        },
        {
          title: 'New Article',
          content: 'This is a new article',
          mainImageUrl: 'https://example.com/new-image.jpg',
          originalAuthor: 'New Author',
          articleUrl: 'https://example.com/new-article',
          createdAt: new Date('2024-01-01T00:00:00Z')
        }
      ]);

      const result = await useCase.execute(source.id);

      expect(result.length).toBe(1);
      expect(result[0].title).toBe('New Article');
    });

    it('should return empty array when source has no new content', async () => {
      const source = new RssPullSource(
        'source-1',
        new Date('2024-01-01T00:00:00Z'),
        true,
        'https://example.com/rss'
      );

      await pullSourceRepository.save(source);

      extractor.setArticlesToReturn([]);

      const result = await useCase.execute(source.id);

      expect(result).toEqual([]);
    });

    it('should throw an error when source does not exist', async () => {
      await expect(useCase.execute('nonexistent-source')).rejects.toThrow(
        'PullSource not found'
      );
    });
  });
});
