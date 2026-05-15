import { Module } from '@nestjs/common';
import { NewsArticleSupabaseClientProvider } from '../config/supabase-client.provider';
import { SupabaseNewsArticleRepository } from '../adapters/persistence/supabase-news-article.repository';
import { NewsArticleRepositoryPort } from '../../core/domain/ports/news-article-repository.port';

@Module({
  providers: [
    NewsArticleSupabaseClientProvider,
    {
      provide: NewsArticleRepositoryPort,
      useClass: SupabaseNewsArticleRepository,
    },
  ],
  exports: [NewsArticleRepositoryPort],
})
export class NewsArticlePersistenceModule {}
