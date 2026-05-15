import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  InMemoryNewsArticleRepository,
  NewsArticleRepositoryPort,
} from '@ai-news-aggregator/news-article';
import { AppModule } from '../../../agents-microservice/src/app/app.module';
import { ProcessScheduledSummarizationUseCase } from '../../../agents-microservice/src/core/application/use-cases/process-scheduled-summarization.use-case';
import { SummarizeArticleUseCase } from '../../../agents-microservice/src/core/application/use-cases/summarize-article.use-case';
import { SummaryGeneratorPort } from '../../../agents-microservice/src/core/domain/ports/summary-generator.port';
import { InMemorySummaryGenerator } from '../../../agents-microservice/src/core/domain/test/mocks/in-memory-summary-generator';

export interface AgentsE2eContext {
  app: INestApplication;
  articleRepository: InMemoryNewsArticleRepository;
  summaryGenerator: InMemorySummaryGenerator;
  processScheduledSummarization: ProcessScheduledSummarizationUseCase;
  summarizeArticle: SummarizeArticleUseCase;
}

export async function createAgentsE2eApp(): Promise<AgentsE2eContext> {
  const articleRepository = new InMemoryNewsArticleRepository();
  const summaryGenerator = new InMemorySummaryGenerator();
  summaryGenerator.setGeneratedSummary('Generated summary');

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(NewsArticleRepositoryPort)
    .useValue(articleRepository)
    .overrideProvider(SummaryGeneratorPort)
    .useValue(summaryGenerator)
    .compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  await app.init();

  const processScheduledSummarization = moduleRef.get(
    ProcessScheduledSummarizationUseCase,
  );
  const summarizeArticle = moduleRef.get(SummarizeArticleUseCase);

  return {
    app,
    articleRepository,
    summaryGenerator,
    processScheduledSummarization,
    summarizeArticle,
  };
}

export async function resetAgentsE2eContext(
  context: AgentsE2eContext,
): Promise<void> {
  context.articleRepository.clear();
  context.summaryGenerator.clearError();
  context.summaryGenerator.setGeneratedSummary('Generated summary');
}
