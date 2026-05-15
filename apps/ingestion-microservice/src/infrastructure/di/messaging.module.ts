import { Module } from '@nestjs/common';
import { TelegramNotificationAdapter } from '../adapters/messaging/telegram-notification.adapter';
import { TelegramNotificationPort } from '../../core/domain/ports/telegram-notification.port';

@Module({
  providers: [
    {
      provide: TelegramNotificationPort,
      useClass: TelegramNotificationAdapter,
    },
  ],
  exports: [TelegramNotificationPort],
})
export class MessagingModule {}
