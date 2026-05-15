import { World, IWorldOptions } from '@cucumber/cucumber';
import {
  ArticleStatus,
  InMemoryNewsArticleRepository,
  NewsArticle,
} from '@ai-news-aggregator/news-article';
import { GetArticlesToSummarizeUseCase } from '../../src/core/application/use-cases/get-articles-to-summarize.use-case';
import { ProcessScheduledSummarizationUseCase } from '../../src/core/application/use-cases/process-scheduled-summarization.use-case';
import { SummarizeArticleUseCase } from '../../src/core/application/use-cases/summarize-article.use-case';
import { InMemorySummaryGenerator } from '../../src/core/domain/test/mocks/in-memory-summary-generator';

export class CustomWorld extends World {
  public articleRepository: InMemoryNewsArticleRepository;
  public summaryGenerator: InMemorySummaryGenerator;
  public getArticlesToSummarizeUseCase: GetArticlesToSummarizeUseCase;
  public summarizeArticleUseCase: SummarizeArticleUseCase;
  public processScheduledSummarizationUseCase: ProcessScheduledSummarizationUseCase;
  public articles: NewsArticle[] = [];
  public currentArticle: NewsArticle | null = null;
  public processResult: { processed: number } | null = null;
  public summarizationError: Error | null = null;

  constructor(options: IWorldOptions) {
    super(options);
    this.articleRepository = new InMemoryNewsArticleRepository();
    this.summaryGenerator = new InMemorySummaryGenerator();
    this.getArticlesToSummarizeUseCase = new GetArticlesToSummarizeUseCase(
      this.articleRepository,
    );
    this.summarizeArticleUseCase = new SummarizeArticleUseCase(
      this.summaryGenerator,
    );
    this.processScheduledSummarizationUseCase =
      new ProcessScheduledSummarizationUseCase(
        this.articleRepository,
        this.getArticlesToSummarizeUseCase,
        this.summarizeArticleUseCase,
      );
  }

  reset(): void {
    this.articleRepository.clear();
    this.summaryGenerator.clearError();
    this.summaryGenerator.setGeneratedSummary('Generated summary');
    this.articles = [];
    this.currentArticle = null;
    this.processResult = null;
    this.summarizationError = null;
  }

  createArticle(status: ArticleStatus, generatedSummary?: string | null): NewsArticle {
    return new NewsArticle(
      'article-1',
      'https://example.com/article-1',
      'Test Article',
      'Test content',
      'Test Author',
      'https://example.com/image.jpg',
      'source-1',
      status,
      false,
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-01T00:00:00Z'),
      generatedSummary,
    );
  }
}
