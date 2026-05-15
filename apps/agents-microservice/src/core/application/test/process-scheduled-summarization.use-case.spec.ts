import {
  ArticleStatus,
  InMemoryNewsArticleRepository,
  NewsArticle,
  NewsArticleRepositoryPort,
} from '@ai-news-aggregator/news-article';
import { InMemorySummaryGenerator } from '../../domain/test/mocks/in-memory-summary-generator';
import { GetArticlesToSummarizeUseCase } from '../use-cases/get-articles-to-summarize.use-case';
import { ProcessScheduledSummarizationUseCase } from '../use-cases/process-scheduled-summarization.use-case';
import { SummarizeArticleUseCase } from '../use-cases/summarize-article.use-case';

describe('ProcessScheduledSummarizationUseCase', () => {
  let repository: NewsArticleRepositoryPort;
  let getArticlesToSummarize: GetArticlesToSummarizeUseCase;
  let summaryGenerator: InMemorySummaryGenerator;
  let summarizeArticle: SummarizeArticleUseCase;
  let useCase: ProcessScheduledSummarizationUseCase;

  beforeEach(() => {
    repository = new InMemoryNewsArticleRepository();
    getArticlesToSummarize = new GetArticlesToSummarizeUseCase(repository);
    summaryGenerator = new InMemorySummaryGenerator();
    summaryGenerator.setGeneratedSummary('Summary for {id}');
    summarizeArticle = new SummarizeArticleUseCase(summaryGenerator);
    useCase = new ProcessScheduledSummarizationUseCase(
      repository,
      getArticlesToSummarize,
      summarizeArticle,
    );
  });

  it('should summarize every approved unsummarized article', async () => {
    await repository.save(
      new NewsArticle(
        '1',
        'http://example.com/article1',
        'Article 1',
        'Content 1',
        'Author 1',
        null,
        'pull-1',
        ArticleStatus.APPROVED,
      ),
    );
    await repository.save(
      new NewsArticle(
        '2',
        'http://example.com/article2',
        'Article 2',
        'Content 2',
        'Author 2',
        null,
        'pull-2',
        ArticleStatus.APPROVED,
      ),
    );

    const result = await useCase.execute();
    const article1 = await repository.findById('1');
    const article2 = await repository.findById('2');

    expect(result.processed).toBe(2);
    expect(article1?.generatedSummary).toBe('Summary for 1');
    expect(article2?.generatedSummary).toBe('Summary for 2');
  });

  it('should skip articles that already have a summary', async () => {
    await repository.save(
      new NewsArticle(
        '1',
        'http://example.com/article1',
        'Article 1',
        'Content 1',
        'Author 1',
        null,
        'pull-1',
        ArticleStatus.APPROVED,
        false,
        new Date(),
        new Date(),
        'Existing summary',
      ),
    );

    const result = await useCase.execute();

    expect(result.processed).toBe(0);
  });

  it('should persist the summarized article after generation', async () => {
    await repository.save(
      new NewsArticle(
        '1',
        'http://example.com/article1',
        'Article 1',
        'Content 1',
        'Author 1',
        null,
        'pull-1',
        ArticleStatus.APPROVED,
      ),
    );

    await useCase.execute();

    const storedArticle = await repository.findById('1');

    expect(storedArticle?.generatedSummary).toBe('Summary for 1');
    expect(storedArticle?.summarized).toBe(true);
  });
});
