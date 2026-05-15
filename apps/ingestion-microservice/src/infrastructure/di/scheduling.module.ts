import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PersistenceModule } from './persistence.module';
import { MessagingModule } from './messaging.module';
import { PullSourcesScheduler } from '../scheduling/pull-sources.scheduler';
import { ApprovalNotificationScheduler } from '../scheduling/approval-notification.scheduler';
import { TelegramApprovalScheduler } from '../scheduling/telegram-approval.scheduler';
import { ProcessScheduledPullUseCase } from '../../core/application/use-cases/process-scheduled-pull.use-case';
import { SendBatchNotificationUseCase } from '../../core/application/use-cases/send-batch-notification.use-case';
import { GetArticlesToNotifyUseCase } from '../../core/application/use-cases/get-articles-to-notify.use-case';
import { ApproveArticleUseCase } from '../../core/application/use-cases/approve-article.use-case';
import { RejectArticleUseCase } from '../../core/application/use-cases/reject-article.use-case';

@Module({
  imports: [ScheduleModule.forRoot(), PersistenceModule, MessagingModule],
  providers: [
    ProcessScheduledPullUseCase,
    SendBatchNotificationUseCase,
    GetArticlesToNotifyUseCase,
    ApproveArticleUseCase,
    RejectArticleUseCase,
    PullSourcesScheduler,
    ApprovalNotificationScheduler,
    TelegramApprovalScheduler,
  ],
  exports: [
    ProcessScheduledPullUseCase,
    SendBatchNotificationUseCase,
    GetArticlesToNotifyUseCase,
    ApproveArticleUseCase,
    RejectArticleUseCase,
  ],
})
export class SchedulingModule {}
