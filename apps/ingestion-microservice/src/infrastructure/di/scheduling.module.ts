import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PullSourcesScheduler } from '@ai-news-aggregator/ingestion-microservice/infrastructure/scheduling/pull-sources.scheduler';
import { ApprovalNotificationScheduler } from '@ai-news-aggregator/ingestion-microservice/infrastructure/scheduling/approval-notification.scheduler';
import { ProcessScheduledPullUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/process-scheduled-pull.use-case';
import { SendBatchNotificationUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/send-batch-notification.use-case';
import { PullSourceRepositoryPort } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/pull-source-repository.port';
import { NewsArticleRepositoryPort } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/news-article-repository.port';
import { PullSourceExtractorPort } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/pull-source-extractor.port';
import { TelegramNotificationPort } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/telegram-notification.port';
import { GetArticlesToNotifyUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/get-articles-to-notify.use-case';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    PullSourcesScheduler,
    ApprovalNotificationScheduler,
    ProcessScheduledPullUseCase,
    SendBatchNotificationUseCase,
    GetArticlesToNotifyUseCase,
  ],
})
export class SchedulingModule {}
