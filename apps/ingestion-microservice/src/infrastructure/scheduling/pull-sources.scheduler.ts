import { ProcessScheduledPullUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/process-scheduled-pull.use-case';
import { getSchedulingConfig } from '@ai-news-aggregator/ingestion-microservice/infrastructure/config/scheduling.config';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PullSourcesScheduler {
  private readonly logger = new Logger(PullSourcesScheduler.name);
  private readonly config = getSchedulingConfig();

  constructor(
    private readonly processScheduledPull: ProcessScheduledPullUseCase,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handlePullSourcesCheck(): Promise<void> {
    if (!this.config.pullSourcesSchedulerEnabled) {
      this.logger.debug('Pull sources scheduler disabled by configuration');
      return;
    }

    this.logger.log('Running scheduled pull sources check...');

    try {
      const result = await this.processScheduledPull.execute();

      const successCount = result.success.length;
      const errorCount = result.errors.length;

      this.logger.log(
        `Pull sources check completed: ${successCount} successful, ${errorCount} errors`,
      );

      if (errorCount > 0) {
        result.errors.forEach(({ sourceId, error }) => {
          this.logger.error(`Source ${sourceId}: ${error.message}`);
          this.logger.debug(`Source ${sourceId} stack: ${error.stack}`);
        });
      }
    } catch (error) {
      const errorObj = error as Error;
      this.logger.error(`Scheduled pull check failed: ${errorObj.message}`);
      this.logger.debug(`Stack trace: ${errorObj.stack}`);
    }
  }
}
