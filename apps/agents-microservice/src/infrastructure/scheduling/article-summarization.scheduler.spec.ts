import { Logger } from '@nestjs/common';
import { ProcessScheduledSummarizationUseCase } from '../../core/application/use-cases/process-scheduled-summarization.use-case';
import { ArticleSummarizationScheduler } from './article-summarization.scheduler';

describe('ArticleSummarizationScheduler', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {};
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('should run scheduled summarization when enabled', async () => {
    const processScheduledSummarization = {
      execute: jest.fn().mockResolvedValue({ processed: 2 }),
    } as unknown as ProcessScheduledSummarizationUseCase;

    const scheduler = new ArticleSummarizationScheduler(
      processScheduledSummarization,
    );

    await scheduler.handleSummarization();

    expect(processScheduledSummarization.execute).toHaveBeenCalledTimes(1);
  });

  it('should log errors thrown by the summarization process', async () => {
    const processScheduledSummarization = {
      execute: jest.fn().mockRejectedValue(new Error('boom')),
    } as unknown as ProcessScheduledSummarizationUseCase;

    const scheduler = new ArticleSummarizationScheduler(
      processScheduledSummarization,
    );

    const errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    await scheduler.handleSummarization();

    expect(processScheduledSummarization.execute).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      'Scheduled article summarization failed: boom',
    );
  });

  it('should skip execution when a previous cycle is still running', async () => {
    let releaseExecution: (() => void) | undefined;

    const processScheduledSummarization = {
      execute: jest.fn().mockImplementation(
        () =>
          new Promise<{ processed: number }>((resolve) => {
            releaseExecution = () => resolve({ processed: 1 });
          }),
      ),
    } as unknown as ProcessScheduledSummarizationUseCase;

    const scheduler = new ArticleSummarizationScheduler(
      processScheduledSummarization,
    );

    const firstRun = scheduler.handleSummarization();
    await Promise.resolve();

    await scheduler.handleSummarization();

    expect(processScheduledSummarization.execute).toHaveBeenCalledTimes(1);

    releaseExecution?.();
    await firstRun;
  });
});
