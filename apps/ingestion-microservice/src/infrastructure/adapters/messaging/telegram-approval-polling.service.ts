import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ApproveArticleUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/approve-article.use-case';
import { RejectArticleUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/reject-article.use-case';
import { getTelegramConfig } from '../../config/telegram.config';

interface TelegramUpdate {
  update_id: number;
  callback_query?: {
    id: string;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
    };
    message?: {
      chat: {
        id: number;
      };
      message_id: number;
    };
    data: string;
  };
}

interface TelegramCallbackResponse {
  ok: boolean;
  result?: any;
}

@Injectable()
export class TelegramApprovalPollingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramApprovalPollingService.name);
  private readonly config = getTelegramConfig();
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastUpdateId: number | null = null;

  constructor(
    private readonly approveArticle: ApproveArticleUseCase,
    private readonly rejectArticle: RejectArticleUseCase,
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.config.pollingEnabled && this.config.botToken) {
      this.logger.log('Starting Telegram approval polling service...');
      this.startPolling();
    } else {
      this.logger.log('Telegram polling disabled by configuration');
    }
  }

  onModuleDestroy(): void {
    this.stopPolling();
  }

  private startPolling(): void {
    this.pollingInterval = setInterval(
      () => this.pollUpdates(),
      this.config.pollingIntervalMs,
    );
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.logger.log('Telegram polling stopped');
    }
  }

  private async pollUpdates(): Promise<void> {
    try {
      this.logger.debug('Polling for updates...');
      const updates = await this.getUpdates();
      
      if (updates.length > 0) {
        this.logger.debug(`Received ${updates.length} updates`);
      }
      
      for (const update of updates) {
        if (update.callback_query) {
          await this.handleCallbackQuery(update.callback_query);
        }
        
        this.lastUpdateId = update.update_id;
      }
    } catch (error) {
      this.logger.error(`Polling error: ${(error as Error).message}`);
    }
  }

  private async getUpdates(): Promise<TelegramUpdate[]> {
    const offset = this.lastUpdateId ? this.lastUpdateId + 1 : 0;
    const url = `https://api.telegram.org/bot${this.config.botToken}/getUpdates?offset=${offset}&timeout=10`;

    this.logger.debug(`Fetching updates from offset ${offset}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      this.logger.error(`Telegram API error: ${response.status}`);
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const data = await response.json();
    const results = data.result || [];
    this.logger.debug(`Received ${results.length} updates from Telegram`);
    return results;
  }

  private async handleCallbackQuery(callbackQuery: TelegramUpdate['callback_query']): Promise<void> {
    if (!callbackQuery || !callbackQuery.data) {
      return;
    }

    const userId = callbackQuery.from.id;
    
    if (!this.isAdminUser(userId)) {
      this.logger.warn(`Unauthorized approval attempt by user ${userId}`);
      await this.answerCallbackQuery(callbackQuery.id, '❌ No autorizado');
      return;
    }

    const [action, articleId] = callbackQuery.data.split(':');

    if (!articleId) {
      this.logger.warn(`Invalid callback data: ${callbackQuery.data}`);
      return;
    }

    try {
      if (action === 'approve') {
        await this.approveArticle.execute(articleId);
        await this.answerCallbackQuery(callbackQuery.id, '✅ Artículo aprobado');
        this.logger.log(`Article ${articleId} approved by user ${userId}`);
      } else if (action === 'reject') {
        await this.rejectArticle.execute(articleId);
        await this.answerCallbackQuery(callbackQuery.id, '❌ Artículo rechazado');
        this.logger.log(`Article ${articleId} rejected by user ${userId}`);
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      await this.answerCallbackQuery(callbackQuery.id, `⚠️ Error: ${errorMessage}`);
      this.logger.error(`Failed to process approval for ${articleId}: ${errorMessage}`);
    }
  }

  private isAdminUser(userId: number): boolean {
    return this.config.adminUserIds.some(id => id === userId.toString());
  }

  private async answerCallbackQuery(callbackQueryId: string, text: string): Promise<void> {
    try {
      const url = `https://api.telegram.org/bot${this.config.botToken}/answerCallbackQuery`;

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: text,
          show_alert: true,
        }),
      });
    } catch (error) {
      this.logger.error(`Failed to answer callback query: ${(error as Error).message}`);
    }
  }
}
