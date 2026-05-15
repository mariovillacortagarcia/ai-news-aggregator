import { World, IWorldOptions } from '@cucumber/cucumber';
import { ArticleNotificationData } from '../../src/core/domain/ports/telegram-notification.port';
import { NewsArticle, InMemoryNewsArticleRepository } from '@ai-news-aggregator/news-article';
import { PullSource } from '../../src/core/domain/entities/pull-source';
import { GetArticlesToNotifyUseCase } from '../../src/core/application/use-cases/get-articles-to-notify.use-case';
import { SendBatchNotificationUseCase } from '../../src/core/application/use-cases/send-batch-notification.use-case';
import { ApproveArticleUseCase } from '../../src/core/application/use-cases/approve-article.use-case';
import { RejectArticleUseCase } from '../../src/core/application/use-cases/reject-article.use-case';
import { InMemoryTelegramNotificationRepository } from '../../src/core/domain/test/mocks/in-memory-telegram-notification.repository';

export class CustomWorld extends World {
  public articleRepository: InMemoryNewsArticleRepository;
  public telegramNotification: InMemoryTelegramNotificationRepository;
  public getArticlesToNotifyUseCase: GetArticlesToNotifyUseCase;
  public sendNotificationUseCase: SendBatchNotificationUseCase;
  public approveArticleUseCase: ApproveArticleUseCase;
  public rejectArticleUseCase: RejectArticleUseCase;
  public articles: NewsArticle[] = [];
  public pullSources: PullSource[] = [];
  public savedArticles: NewsArticle[] = [];
  public sourceExtractionErrors: Set<string> = new Set();
  public lastCheckedTimestamps: Map<string, Date> = new Map();
  public notificationSent: boolean = false;
  public lastNotificationArticles: ArticleNotificationData[] | null = null;
  public notificationError: Error | null = null;
  public processResult: { success: string[]; errors: { sourceId: string; error: Error }[] } | null = null;
  public ingestionError: Error | null = null;
  public currentArticle: NewsArticle | null = null;
  public articleActionError: Error | null = null;
  public originalArticleUpdatedAt: Date | null = null;
  public processingCompleted: boolean = false;

  constructor(options: IWorldOptions) {
    super(options);
    this.articleRepository = new InMemoryNewsArticleRepository();
    this.telegramNotification = new InMemoryTelegramNotificationRepository();
    this.getArticlesToNotifyUseCase = new GetArticlesToNotifyUseCase(
      this.articleRepository,
    );
    this.sendNotificationUseCase = new SendBatchNotificationUseCase(
      this.getArticlesToNotifyUseCase,
      this.articleRepository,
      this.telegramNotification,
    );
    this.approveArticleUseCase = new ApproveArticleUseCase(
      this.articleRepository,
    );
    this.rejectArticleUseCase = new RejectArticleUseCase(
      this.articleRepository,
    );
  }
}
