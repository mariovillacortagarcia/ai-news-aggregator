import { Module } from '@nestjs/common';
import { NewsArticlePersistenceModule } from '@ai-news-aggregator/news-article';

@Module({
  imports: [NewsArticlePersistenceModule],
  exports: [NewsArticlePersistenceModule],
})
export class PersistenceModule {}
