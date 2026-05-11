import { ExtractedArticleData } from '../ports/pull-source-extractor.port';
import { InMemoryPullSourceExtractor } from './mocks/in-memory-pull-source.extractor';
import { RssPullSource } from '../entities/pull-source';

describe('PullSourceExtractorPort', () => {
  let extractor: InMemoryPullSourceExtractor;
  let mockSource: RssPullSource;

  beforeEach(() => {
    extractor = new InMemoryPullSourceExtractor();
    mockSource = new RssPullSource('test-source', null, true, 'https://example.com/rss');
  });

  describe('extract', () => {
    it('should return an array of extracted articles', async () => {
      const mockArticles: ExtractedArticleData[] = [
        {
          title: 'Article 1',
          content: 'Content 1',
          mainImageUrl: 'https://example.com/image1.jpg',
          originalAuthor: 'Author 1',
          articleUrl: 'https://example.com/article-1',
          createdAt: new Date('2024-01-01T00:00:00Z')
        },
        {
          title: 'Article 2',
          content: 'Content 2',
          mainImageUrl: 'https://example.com/image2.jpg',
          originalAuthor: 'Author 2',
          articleUrl: 'https://example.com/article-2',
          createdAt: new Date('2024-01-01T00:00:00Z')
        }
      ];

      extractor.setArticlesToReturn(mockArticles);

      const result = await extractor.extract(mockSource, undefined);

      expect(result).toEqual(mockArticles);
    });

    it('should return an empty array when no articles are found', async () => {
      extractor.setArticlesToReturn([]);

      const result = await extractor.extract(mockSource, undefined);

      expect(result).toEqual([]);
    });

    it('should throw an error when extraction fails', async () => {
      extractor.setError('SOURCE_EXTRACTION_ERROR: Failed to extract content');

      await expect(extractor.extract(mockSource, undefined)).rejects.toThrow(
        'SOURCE_EXTRACTION_ERROR: Failed to extract content'
      );
    });

    it('should return articles with all required fields', async () => {
      const createdAt = new Date('2024-01-01T12:00:00Z');
      extractor.setArticlesToReturn([
        {
          title: 'Test Article',
          content: 'Test Content',
          mainImageUrl: 'https://example.com/test.jpg',
          originalAuthor: 'Test Author',
          articleUrl: 'https://example.com/test',
          createdAt
        }
      ]);

      const result = await extractor.extract(mockSource, undefined);

      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('content');
      expect(result[0]).toHaveProperty('mainImageUrl');
      expect(result[0]).toHaveProperty('originalAuthor');
      expect(result[0]).toHaveProperty('articleUrl');
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0].createdAt).toEqual(createdAt);
    });

    it('should filter articles by lastPolledAt', async () => {
      const oldArticle: ExtractedArticleData = {
        title: 'Old Article',
        content: 'Old Content',
        mainImageUrl: 'https://example.com/old.jpg',
        originalAuthor: 'Old Author',
        articleUrl: 'https://example.com/old',
        createdAt: new Date('2024-01-01T00:00:00Z')
      };
      
      const newArticle: ExtractedArticleData = {
        title: 'New Article',
        content: 'New Content',
        mainImageUrl: 'https://example.com/new.jpg',
        originalAuthor: 'New Author',
        articleUrl: 'https://example.com/new',
        createdAt: new Date('2024-01-02T00:00:00Z')
      };

      extractor.setArticlesToReturn([oldArticle, newArticle]);
      const lastPolledAt = new Date('2024-01-01T12:00:00Z');

      const result = await extractor.extract(mockSource, lastPolledAt);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('New Article');
    });
  });
});
