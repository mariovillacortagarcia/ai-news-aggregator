import { NewsArticleRepositoryPort } from '../../domain/ports/news-article-repository.port';
import { TelegramNotificationPort } from '../../domain/ports/telegram-notification.port';
import { GetArticlesToNotifyUseCase } from './get-articles-to-notify.use-case';
import { SendNotificationError } from '../../domain/errors/send-notification.error';

export class SendBatchNotificationUseCase {
  constructor(
    private readonly getArticlesToNotify: GetArticlesToNotifyUseCase,
    private readonly articleRepository: NewsArticleRepositoryPort,
    private readonly telegramNotification: TelegramNotificationPort
  ) {}

  async execute(): Promise<void> {
    const articlesToNotify = await this.getArticlesToNotify.execute();

    if (articlesToNotify.length === 0) {
      return;
    }

    const notificationData = articlesToNotify.map(article => ({
      articleId: article.id,
      title: article.title,
      articleUrl: article.articleUrl,
      mainImageUrl: article.mainImageUrl,
      originalAuthor: article.author
    }));

    try {
      await this.telegramNotification.sendBatchNotification(notificationData);
    } catch (error) {
      throw new SendNotificationError(`Failed to send notification: ${(error as Error).message}`);
    }

    for (const article of articlesToNotify) {
      article.notify();
      await this.articleRepository.update(article);
    }
  }
}
