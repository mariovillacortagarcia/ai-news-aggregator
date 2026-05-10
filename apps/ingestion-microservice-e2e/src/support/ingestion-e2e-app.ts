import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@ai-news-aggregator/ingestion-microservice/app/app.module';
import { ProcessDuePullSourcesUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/process-due-pull-sources.use-case';
import { InMemoryNewsArticleRepository } from '@ai-news-aggregator/ingestion-microservice/infrastructure/adapters/persistence/in-memory-news-article.repository';
import { InMemoryPullSourceRepository } from '@ai-news-aggregator/ingestion-microservice/infrastructure/adapters/persistence/in-memory-pull-source.repository';
import { INGESTION_TOKENS } from '@ai-news-aggregator/ingestion-microservice/infrastructure/di/ingestion.tokens';
import { Source } from '@ai-news-aggregator/ingestion-microservice/core/domain/entities/source.entity';
import { SourceRepositoryPort } from '@ai-news-aggregator/ingestion-microservice/core/application/ports/outbound/source.repository.port';

export interface IngestionE2eContext {
  app: INestApplication;
  repository: InMemoryNewsArticleRepository;
  pullSourceRepository: InMemoryPullSourceRepository;
  sourceRepository: InMemorySourceRepository;
  processDuePullSources: ProcessDuePullSourcesUseCase;
  fetchMock: jest.Mock;
}

export class InMemorySourceRepository implements SourceRepositoryPort {
  private readonly sourcesById = new Map<string, Source>();

  async findById(id: string): Promise<Source | null> {
    return this.sourcesById.get(id) ?? null;
  }

  async findByUrl(url: string): Promise<Source | null> {
    return Array.from(this.sourcesById.values()).find(s => s.sourceUrl.value === url) ?? null;
  }

  async save(source: Source): Promise<void> {
    this.sourcesById.set(source.id, source);
  }

  clear(): void {
    this.sourcesById.clear();
  }
}

export async function createIngestionE2eApp(): Promise<IngestionE2eContext> {
  const fetchMock = jest.fn();
  global.fetch = fetchMock;
  const sourceRepository = new InMemorySourceRepository();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(INGESTION_TOKENS.ingestionConfig)
    .useValue({
      pullSourcesPollIntervalMs: 60_000,
      pullSourcesSchedulerEnabled: false,
      telegramBotToken: 'bot-token',
      telegramAdminUserId: '42',
    })
    .overrideProvider(INGESTION_TOKENS.sourceRepository)
    .useValue(sourceRepository)
    .compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  await app.init();

  return {
    app,
    repository: app.get(INGESTION_TOKENS.newsArticleRepository),
    pullSourceRepository: app.get(INGESTION_TOKENS.pullSourceRepository),
    sourceRepository,
    processDuePullSources: app.get(ProcessDuePullSourcesUseCase),
    fetchMock,
  };
}

export async function resetIngestionE2eContext(context: IngestionE2eContext): Promise<void> {
  context.repository.clear();
  context.pullSourceRepository.clear();
  context.sourceRepository.clear();
  context.fetchMock.mockReset();
}

export function validReactivePayload(articleUrl = 'https://example.com/quantum-breakthrough') {
  return {
    title: 'Quantum Computing Breakthrough',
    articleUrl,
    content: 'Body',
    mainImageUrl: 'https://example.com/image.jpg',
    originalAuthor: 'Original Author',
    sourceId: '00112233-4455-6677-8899-aabbccddeeff',
  };
}

export async function createCandidate(
  context: IngestionE2eContext,
  articleUrl = 'https://example.com/quantum-breakthrough',
): Promise<string> {
  const response = await request(context.app.getHttpServer())
    .post('/api/ingestion/reactive')
    .send(validReactivePayload(articleUrl))
    .expect(201);

  return response.body.article.id as string;
}

export function mockSourceHtml(context: IngestionE2eContext, articleUrl: string): void {
  context.fetchMock.mockResolvedValueOnce({
    ok: true,
    text: async () => `
      <html>
        <head>
          <title>Pulled Article Title</title>
          <link rel="canonical" href="${articleUrl}">
        </head>
        <body>
          <img src="https://example.com/image.jpg">
          <span class="author">Original Author</span>
          Pulled article body content
        </body>
      </html>
    `,
  });
}
