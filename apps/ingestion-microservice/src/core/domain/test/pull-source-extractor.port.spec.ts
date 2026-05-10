import { ExtractedArticleData } from '../ports/pull-source-extractor.port';
import { InMemoryPullSourceExtractor } from './mocks/in-memory-pull-source.extractor';

describe('PullSourceExtractorPort', () => {
  let extractor: InMemoryPullSourceExtractor;

  beforeEach(() => {
    extractor = new InMemoryPullSourceExtractor();
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

      const result = await extractor.extract('https://example.com/rss');

      expect(result).toEqual(mockArticles);
    });

    it('should return an empty array when no articles are found', async () => {
      extractor.setArticlesToReturn([]);

      const result = await extractor.extract('https://example.com/rss');

      expect(result).toEqual([]);
    });

    it('should throw an error when extraction fails', async () => {
      extractor.setError('SOURCE_EXTRACTION_ERROR: Failed to extract content');

      await expect(extractor.extract('https://example.com/rss')).rejects.toThrow(
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

      const result = await extractor.extract('https://example.com/rss');

      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('content');
      expect(result[0]).toHaveProperty('mainImageUrl');
      expect(result[0]).toHaveProperty('originalAuthor');
      expect(result[0]).toHaveProperty('articleUrl');
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0].createdAt).toEqual(createdAt);
    });
  });
});
