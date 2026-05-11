import { Module } from '@nestjs/common';
import { PersistenceModule } from '@ai-news-aggregator/ingestion-microservice/infrastructure/di/persistence.module';
import { TelegramNotificationAdapter } from '@ai-news-aggregator/ingestion-microservice/infrastructure/adapters/messaging/telegram-notification.adapter';
import { TelegramNotificationPort } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/telegram-notification.port';

@Module({
  imports: [PersistenceModule],
  providers: [
    {
      provide: TelegramNotificationPort,
      useClass: TelegramNotificationAdapter,
    },
  ],
  exports: [TelegramNotificationPort],
})
export class MessagingModule {}
