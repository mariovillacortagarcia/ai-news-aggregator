import { Module } from '@nestjs/common';
import { SupabaseClientProvider } from '../config/supabase-client.provider';
import { SupabasePullSourceRepository } from '../adapters/persistence/supabase-pull-source.repository';
import { RssPullSourceExtractor } from '../adapters/extractors/rss-pull-source.extractor';
import { HtmlPullSourceExtractor } from '../adapters/extractors/html-pull-source.extractor';
import { PullSourceExtractorFactory } from '../adapters/extractors/pull-source-extractor.factory';
import { NewsArticlePersistenceModule } from '@ai-news-aggregator/news-article';
import { PullSourceRepositoryPort } from '../../core/domain/ports/pull-source-repository.port';
import { PullSourceExtractorPort } from '../../core/domain/ports/pull-source-extractor.port';

@Module({
  imports: [NewsArticlePersistenceModule],
  providers: [
    SupabaseClientProvider,
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
  exports: [
    NewsArticlePersistenceModule,
    PullSourceRepositoryPort,
    PullSourceExtractorPort,
  ],
})
export class PersistenceModule {}
