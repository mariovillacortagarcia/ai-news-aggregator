import { Module } from '@nestjs/common';
import { SupabaseClientProvider } from '@ai-news-aggregator/ingestion-microservice/infrastructure/config/supabase-client.provider';
import { SupabaseNewsArticleRepository } from '@ai-news-aggregator/ingestion-microservice/infrastructure/adapters/persistence/supabase-news-article.repository';
import { SupabasePullSourceRepository } from '@ai-news-aggregator/ingestion-microservice/infrastructure/adapters/persistence/supabase-pull-source.repository';
import { NewsArticleRepositoryPort } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/news-article-repository.port';
import { PullSourceRepositoryPort } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/pull-source-repository.port';

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
  ],
  exports: [NewsArticleRepositoryPort, PullSourceRepositoryPort],
})
export class PersistenceModule {}
