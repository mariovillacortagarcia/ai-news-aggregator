import { Module } from '@nestjs/common';
import { SupabaseClientProvider } from '@ai-news-aggregator/ingestion-microservice/infrastructure/config/supabase-client.provider';
import { SupabaseNewsArticleRepository } from '@ai-news-aggregator/ingestion-microservice/infrastructure/adapters/persistence/supabase-news-article.repository';
import { SupabasePullSourceRepository } from '@ai-news-aggregator/ingestion-microservice/infrastructure/adapters/persistence/supabase-pull-source.repository';
import { RssPullSourceExtractor } from '@ai-news-aggregator/ingestion-microservice/infrastructure/adapters/extractors/rss-pull-source.extractor';
import { HtmlPullSourceExtractor } from '@ai-news-aggregator/ingestion-microservice/infrastructure/adapters/extractors/html-pull-source.extractor';
import { PullSourceExtractorFactory } from '@ai-news-aggregator/ingestion-microservice/infrastructure/adapters/extractors/pull-source-extractor.factory';
import { NewsArticleRepositoryPort } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/news-article-repository.port';
import { PullSourceRepositoryPort } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/pull-source-repository.port';
import { PullSourceExtractorPort } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/pull-source-extractor.port';

@Module({
  providers: [
    SupabaseClientProvider,
    {
      provide: NewsArticleRepositoryPort,
      useClass: SupabaseNewsArticleRepository,
    },
    {
      provide: PullSourceRepositoryPort,
      useClass: SupabasePullSourceRepository,
    },
    RssPullSourceExtractor,
    HtmlPullSourceExtractor,
    PullSourceExtractorFactory,
    {
      provide: PullSourceExtractorPort,
      useFactory: (factory: PullSourceExtractorFactory) => factory,
      inject: [PullSourceExtractorFactory],
    },
  ],
  exports: [NewsArticleRepositoryPort, PullSourceRepositoryPort, PullSourceExtractorPort],
})
export class PersistenceModule {}
