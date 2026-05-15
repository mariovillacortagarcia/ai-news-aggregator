import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProcessScheduledSummarizationUseCase } from '../../core/application/use-cases/process-scheduled-summarization.use-case';

@Injectable()
export class ArticleSummarizationScheduler {
  private readonly logger = new Logger(ArticleSummarizationScheduler.name);
  private isRunning = false;

  constructor(
    private readonly processScheduledSummarization: ProcessScheduledSummarizationUseCase,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleSummarization(): Promise<void> {
    if (this.isRunning) {
      this.logger.debug(
        'Summarization scheduler already in progress - skipping',
      );
      return;
    }

    this.logger.log('Running scheduled article summarization...');
    this.isRunning = true;

    try {
      const result = await this.processScheduledSummarization.execute();

      this.logger.log(
        `Scheduled article summarization completed: ${result.processed} articles processed`,
      );
    } catch (error) {
      const errorObj = error as Error;
      this.logger.error(
        `Scheduled article summarization failed: ${errorObj.message}`,
      );
      this.logger.debug(`Stack trace: ${errorObj.stack}`);
    } finally {
      this.isRunning = false;
    }
  }
}
