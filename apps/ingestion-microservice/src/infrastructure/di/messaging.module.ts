import { Module } from '@nestjs/common';
import { PersistenceModule } from '@ai-news-aggregator/ingestion-microservice/infrastructure/di/persistence.module';
import { TelegramNotificationAdapter } from '@ai-news-aggregator/ingestion-microservice/infrastructure/adapters/messaging/telegram-notification.adapter';
import { TelegramApprovalPollingService } from '@ai-news-aggregator/ingestion-microservice/infrastructure/adapters/messaging/telegram-approval-polling.service';
import { TelegramNotificationPort } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/telegram-notification.port';
import { ApproveArticleUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/approve-article.use-case';
import { RejectArticleUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/reject-article.use-case';

@Module({
  imports: [PersistenceModule],
  providers: [
    {
      provide: TelegramNotificationPort,
      useClass: TelegramNotificationAdapter,
    },
    ApproveArticleUseCase,
    RejectArticleUseCase,
    TelegramApprovalPollingService,
  ],
  exports: [TelegramNotificationPort],
})
export class MessagingModule {}
