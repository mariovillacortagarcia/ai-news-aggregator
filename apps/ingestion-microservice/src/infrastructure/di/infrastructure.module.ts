import { Module } from '@nestjs/common';
import { PersistenceModule } from '@ai-news-aggregator/ingestion-microservice/infrastructure/di/persistence.module';
import { MessagingModule } from './messaging.module';
import { SchedulingModule } from './scheduling.module';
import { ProcessScheduledPullUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/process-scheduled-pull.use-case';
import { SendBatchNotificationUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/send-batch-notification.use-case';
import { GetArticlesToNotifyUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/get-articles-to-notify.use-case';
import { ApproveArticleUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/approve-article.use-case';
import { RejectArticleUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/reject-article.use-case';

@Module({
  imports: [PersistenceModule, MessagingModule, SchedulingModule],
  providers: [
    ProcessScheduledPullUseCase,
    SendBatchNotificationUseCase,
    GetArticlesToNotifyUseCase,
    ApproveArticleUseCase,
    RejectArticleUseCase,
  ],
  exports: [
    PersistenceModule,
    MessagingModule,
    SchedulingModule,
    ProcessScheduledPullUseCase,
    SendBatchNotificationUseCase,
    GetArticlesToNotifyUseCase,
    ApproveArticleUseCase,
    RejectArticleUseCase,
  ],
})
export class InfrastructureModule {}
