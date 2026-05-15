import {
  ArticleStatus,
  NewsArticle,
} from '@ai-news-aggregator/news-article';
import { InMemorySummaryGenerator } from '../../domain/test/mocks/in-memory-summary-generator';
import { SummarizeArticleUseCase } from '../use-cases/summarize-article.use-case';

describe('SummarizeArticleUseCase', () => {
  let useCase: SummarizeArticleUseCase;
  let summaryGenerator: InMemorySummaryGenerator;

  beforeEach(() => {
    summaryGenerator = new InMemorySummaryGenerator();
    useCase = new SummarizeArticleUseCase(summaryGenerator);
  });

  it('should generate a summary for an article', async () => {
    summaryGenerator.setGeneratedSummary('Generated summary');

    const article = new NewsArticle(
      '1',
      'http://example.com/article1',
      'Article 1',
      'Content 1',
      'Author 1',
      null,
      'pull-1',
      ArticleStatus.APPROVED,
    );

    const result = await useCase.execute(article);

    expect(result.generatedSummary).toBe('Generated summary');
    expect(result.summarized).toBe(true);
  });

  it('should not persist the summarized article', async () => {
    const article = new NewsArticle(
      '1',
      'http://example.com/article1',
      'Article 1',
      'Content 1',
      'Author 1',
      null,
      'pull-1',
      ArticleStatus.APPROVED,
    );

    const result = await useCase.execute(article);

    expect(result).toBe(article);
  });
});
