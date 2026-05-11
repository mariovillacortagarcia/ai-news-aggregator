import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PullSourcesScheduler } from '@ai-news-aggregator/ingestion-microservice/infrastructure/scheduling/pull-sources.scheduler';
import { ApprovalNotificationScheduler } from '@ai-news-aggregator/ingestion-microservice/infrastructure/scheduling/approval-notification.scheduler';
import { PersistenceModule } from '@ai-news-aggregator/ingestion-microservice/infrastructure/di/persistence.module';
import { MessagingModule } from '@ai-news-aggregator/ingestion-microservice/infrastructure/di/messaging.module';
import { ProcessScheduledPullUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/process-scheduled-pull.use-case';
import { GetArticlesToNotifyUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/get-articles-to-notify.use-case';
import { SendBatchNotificationUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/send-batch-notification.use-case';

@Module({
  imports: [ScheduleModule.forRoot(), PersistenceModule, MessagingModule],
  providers: [
    ProcessScheduledPullUseCase,
    GetArticlesToNotifyUseCase,
    SendBatchNotificationUseCase,
    PullSourcesScheduler,
    ApprovalNotificationScheduler,
  ],
})
export class SchedulingModule {}
