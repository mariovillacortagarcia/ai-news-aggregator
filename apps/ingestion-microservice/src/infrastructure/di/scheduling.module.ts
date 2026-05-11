import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PullSourcesScheduler } from '@ai-news-aggregator/ingestion-microservice/infrastructure/scheduling/pull-sources.scheduler';
import { ApprovalNotificationScheduler } from '@ai-news-aggregator/ingestion-microservice/infrastructure/scheduling/approval-notification.scheduler';
import { TelegramApprovalScheduler } from '@ai-news-aggregator/ingestion-microservice/infrastructure/scheduling/telegram-approval.scheduler';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    PullSourcesScheduler,
    ApprovalNotificationScheduler,
    TelegramApprovalScheduler,
  ],
})
export class SchedulingModule {}
