import { SendBatchNotificationUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/send-batch-notification.use-case';
import { getSchedulingConfig } from '@ai-news-aggregator/ingestion-microservice/infrastructure/config/scheduling.config';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ApprovalNotificationScheduler {
  private readonly logger = new Logger(ApprovalNotificationScheduler.name);
  private readonly config = getSchedulingConfig();

  constructor(
    private readonly sendBatchNotification: SendBatchNotificationUseCase,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleApprovalNotification(): Promise<void> {
    if (!this.config.approvalNotificationSchedulerEnabled) {
      this.logger.debug(
        'Approval notification scheduler disabled by configuration',
      );
      return;
    }

    this.logger.log('Running scheduled approval notification check...');

    try {
      await this.sendBatchNotification.execute();
      this.logger.log('Approval notification check completed');
    } catch (error) {
      const errorObj = error as Error;
      this.logger.error(`Approval notification failed: ${errorObj.message}`);
      this.logger.debug(`Stack trace: ${errorObj.stack}`);
    }
  }
}
