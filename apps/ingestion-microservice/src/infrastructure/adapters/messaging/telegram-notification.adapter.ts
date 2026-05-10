import { Injectable, Logger } from '@nestjs/common';
import { TelegramNotificationPort, ArticleNotificationData } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/telegram-notification.port';
import { getTelegramConfig } from '../../config/telegram.config';

@Injectable()
export class TelegramNotificationAdapter implements TelegramNotificationPort {
  private readonly logger = new Logger(TelegramNotificationAdapter.name);
  private readonly config = getTelegramConfig();

  async sendBatchNotification(articles: ArticleNotificationData[]): Promise<void> {
    if (!this.config.botToken || !this.config.adminChatId) {
      this.logger.warn('Telegram not configured - skipping notification');
      return;
    }

    if (articles.length === 0) {
      return;
    }

    const message = this.buildNotificationMessage(articles);
    const inlineKeyboard = this.buildApprovalKeyboard(articles);

    await this.sendMessageWithKeyboard(message, inlineKeyboard);
  }

  private buildNotificationMessage(articles: ArticleNotificationData[]): string {
    const header = `📰 *Nuevos Artículos Pendientes de Aprobación* (${articles.length})\n\n`;
    
    const articleList = articles
      .map((article, index) => {
        return `${index + 1}. *${article.title}*\n   👤 ${article.originalAuthor}\n   🔗 ${article.articleUrl}`;
      })
      .join('\n\n');

    const footer = `\n\n⚡ _Selecciona una acción para cada artículo usando los botones abajo._`;

    return header + articleList + footer;
  }

  private buildApprovalKeyboard(articles: ArticleNotificationData[]): any {
    const inlineKeyboard: any[] = [];

    for (const article of articles) {
      inlineKeyboard.push([
        {
          text: '✅ Aprobar',
          callback_data: `approve:${article.articleId}`,
        },
        {
          text: '❌ Rechazar',
          callback_data: `reject:${article.articleId}`,
        },
      ]);
    }

    return { inline_keyboard: inlineKeyboard };
  }

  private async sendMessageWithKeyboard(message: string, replyMarkup: any): Promise<void> {
    const url = `https://api.telegram.org/bot${this.config.botToken}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: this.config.adminChatId,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: replyMarkup,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      this.logger.error(`Failed to send Telegram message: ${JSON.stringify(error)}`);
      throw new Error(`Telegram API error: ${error.description || 'Unknown error'}`);
    }

    this.logger.log(`Notification sent with ${replyMarkup.inline_keyboard.length} articles`);
  }
}
