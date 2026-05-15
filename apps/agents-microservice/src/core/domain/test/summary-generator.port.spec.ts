import { NewsArticle } from '@ai-news-aggregator/news-article';
import { InMemorySummaryGenerator } from './mocks/in-memory-summary-generator';

describe('SummaryGeneratorPort', () => {
  let generator: InMemorySummaryGenerator;
  let article: NewsArticle;

  beforeEach(() => {
    generator = new InMemorySummaryGenerator();
    article = new NewsArticle(
      'article-1',
      'https://example.com/article-1',
      'Article 1',
      'Article content',
      'Author 1',
      null,
      'source-1',
    );
  });

  it('should return a generated summary for a news article', async () => {
    generator.setGeneratedSummary('Summary for {id}');

    const result = await generator.generateSummary(article);

    expect(result).toBe('Summary for article-1');
  });

  it('should throw an error when summary generation fails', async () => {
    generator.setError('SUMMARY_GENERATION_ERROR');

    await expect(generator.generateSummary(article)).rejects.toThrow(
      'SUMMARY_GENERATION_ERROR',
    );
  });
});
