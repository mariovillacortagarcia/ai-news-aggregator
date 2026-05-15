import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GetArticlesToSummarizeUseCase } from '../../core/application/use-cases/get-articles-to-summarize.use-case';
import { ProcessScheduledSummarizationUseCase } from '../../core/application/use-cases/process-scheduled-summarization.use-case';
import { SummarizeArticleUseCase } from '../../core/application/use-cases/summarize-article.use-case';
import { ArticleSummarizationScheduler } from '../scheduling/article-summarization.scheduler';
import { AiModule } from './ai.module';
import { PersistenceModule } from './persistence.module';

@Module({
  imports: [ScheduleModule.forRoot(), PersistenceModule, AiModule],
  providers: [
    GetArticlesToSummarizeUseCase,
    SummarizeArticleUseCase,
    ProcessScheduledSummarizationUseCase,
    ArticleSummarizationScheduler,
  ],
  exports: [
    GetArticlesToSummarizeUseCase,
    SummarizeArticleUseCase,
    ProcessScheduledSummarizationUseCase,
  ],
})
export class SchedulingModule {}
