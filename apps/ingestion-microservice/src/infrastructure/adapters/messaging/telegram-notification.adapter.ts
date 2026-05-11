import { Injectable, Logger } from '@nestjs/common';
import { TelegramNotificationPort, ArticleNotificationData } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/telegram-notification.port';
import { getTelegramConfig } from '../../config/telegram.config';

@Injectable()
export class TelegramNotificationAdapter implements TelegramNotificationPort {
  private static readonly maxMessageLength = 3900;
  private readonly logger = new Logger(TelegramNotificationAdapter.name);
  private readonly config = getTelegramConfig();

  async sendBatchNotification(articles: ArticleNotificationData[]): Promise<void> {
    this.logger.debug(`sendBatchNotification called with ${articles.length} articles`);
    
    if (!this.config.botToken || !this.config.adminChatId) {
      this.logger.warn('Telegram not configured - skipping notification');
      return;
    }

    if (articles.length === 0) {
      this.logger.debug('No articles to notify - skipping');
      return;
    }

    this.logger.log(`Sending notification for ${articles.length} articles to chat ${this.config.adminChatId}`);
    const chunks = this.buildNotificationChunks(articles);

    for (const chunk of chunks) {
      const inlineKeyboard = this.buildApprovalKeyboard(chunk.articles);
      await this.sendMessageWithKeyboard(chunk.message, inlineKeyboard);
    }
    this.logger.log('Batch notification sent successfully');
  }

  private buildNotificationChunks(
    articles: ArticleNotificationData[],
  ): Array<{ message: string; articles: ArticleNotificationData[] }> {
    const chunks: Array<{ message: string; articles: ArticleNotificationData[] }> = [];
    let currentArticles: ArticleNotificationData[] = [];
    let currentLines: string[] = [];

    for (const article of articles) {
      const nextLine = this.buildArticleLine(article, currentArticles.length + 1);
      const nextMessage = this.buildNotificationMessage(
        articles.length,
        currentLines.concat(nextLine),
      );

      if (
        currentArticles.length > 0 &&
        nextMessage.length > TelegramNotificationAdapter.maxMessageLength
      ) {
        chunks.push({
          message: this.buildNotificationMessage(articles.length, currentLines),
          articles: currentArticles,
        });
        currentArticles = [];
        currentLines = [];
      }

      currentArticles.push(article);
      currentLines.push(this.buildArticleLine(article, currentArticles.length));
    }

    if (currentArticles.length > 0) {
      chunks.push({
        message: this.buildNotificationMessage(articles.length, currentLines),
        articles: currentArticles,
      });
    }

    return chunks;
  }

  private buildNotificationMessage(totalArticles: number, articleLines: string[]): string {
    const header = `📰 <b>Nuevos Artículos Pendientes de Aprobación</b> (${totalArticles})\n\n`;
    
    const articleList = articleLines.join('\n\n');

    const footer = `\n\n⚡ <i>Selecciona una acción para cada artículo usando los botones abajo.</i>`;

    return header + articleList + footer;
  }

  private buildArticleLine(article: ArticleNotificationData, index: number): string {
    const title = this.escapeHtml(this.truncate(article.title, 220));
    const author = this.escapeHtml(this.truncate(article.originalAuthor, 120));
    const articleUrl = this.escapeHtml(this.truncate(article.articleUrl, 500));

    return `${index}. <b>${title}</b>\n   👤 ${author}\n   🔗 ${articleUrl}`;
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
        parse_mode: 'HTML',
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

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private truncate(value: string, maxLength: number): string {
    if (value.length <= maxLength) {
      return value;
    }

    return `${value.slice(0, maxLength - 1)}…`;
  }
}
