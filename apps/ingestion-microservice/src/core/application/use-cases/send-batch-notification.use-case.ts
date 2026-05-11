import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { NewsArticleRepositoryPort } from '../../domain/ports/news-article-repository.port';
import { TelegramNotificationPort } from '../../domain/ports/telegram-notification.port';
import { GetArticlesToNotifyUseCase } from './get-articles-to-notify.use-case';
import { SendNotificationError } from '../../domain/errors/send-notification.error';

@Injectable()
export class SendBatchNotificationUseCase {
  private readonly logger = new Logger(SendBatchNotificationUseCase.name);

  constructor(
    private readonly getArticlesToNotify: GetArticlesToNotifyUseCase,
    private readonly articleRepository: NewsArticleRepositoryPort,
    private readonly telegramNotification: TelegramNotificationPort
  ) {}

  async execute(): Promise<void> {
    this.logger.debug('Fetching articles to notify...');
    const articlesToNotify = await this.getArticlesToNotify.execute();
    this.logger.log(`Found ${articlesToNotify.length} articles to notify`);

    if (articlesToNotify.length === 0) {
      this.logger.debug('No articles to notify - skipping');
      return;
    }

    const notificationData = articlesToNotify.map(article => ({
      articleId: article.id,
      title: article.title,
      articleUrl: article.articleUrl,
      mainImageUrl: article.mainImageUrl,
      originalAuthor: article.author
    }));

    this.logger.debug(`Sending batch notification with ${notificationData.length} articles...`);
    try {
      await this.telegramNotification.sendBatchNotification(notificationData);
      this.logger.log('Batch notification sent successfully');
    } catch (error) {
      const errorObj = error as Error;
      this.logger.error(`Failed to send notification: ${errorObj.message}`);
      this.logger.debug(`Stack trace: ${errorObj.stack}`);
      throw new SendNotificationError(`Failed to send notification: ${errorObj.message}`);
    }

    this.logger.debug('Updating article notification status...');
    for (const article of articlesToNotify) {
      article.notify();
      await this.articleRepository.update(article);
      this.logger.debug(`Article ${article.id} marked as notified`);
    }

    this.logger.log(`SendBatchNotification completed: ${articlesToNotify.length} articles notified`);
  }
}
