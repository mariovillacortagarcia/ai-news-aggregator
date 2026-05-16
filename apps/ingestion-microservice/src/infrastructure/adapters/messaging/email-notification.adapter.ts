import { Injectable, Logger } from '@nestjs/common';
import {
  ArticleNotificationData,
  NotificationPort,
} from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/notification.port';
import { getEmailConfig } from '../../config/email.config';
import { EmailClientProvider } from './email-client.provider';
import { ReviewTokenService } from './review-token.service';

@Injectable()
export class EmailNotificationAdapter implements NotificationPort {
  private readonly logger = new Logger(EmailNotificationAdapter.name);

  constructor(
    private readonly emailClientProvider: EmailClientProvider,
    private readonly reviewTokenService: ReviewTokenService,
  ) {}

  async sendBatchNotification(
    articles: ArticleNotificationData[],
  ): Promise<void> {
    const config = getEmailConfig();

    if (
      !config.to ||
      !config.from ||
      !config.reviewBaseUrl ||
      !config.jwtSecret ||
      !config.smtpHost
    ) {
      this.logger.warn('Email notification not fully configured - skipping notification');
      return;
    }

    if (articles.length === 0) {
      this.logger.debug('No articles to notify - skipping');
      return;
    }

    const reviewJwt = this.reviewTokenService.createReviewJwt(
      config.to,
      articles.map((article) => article.articleId),
    );
    const reviewUrl = this.buildReviewUrl(config.reviewBaseUrl, reviewJwt);
    const transporter = this.emailClientProvider.getTransporter();

    await transporter.sendMail({
      to: config.to,
      from: config.from,
      subject: `News approval batch (${articles.length})`,
      html: this.buildHtml(articles, reviewUrl),
    });
  }

  private buildReviewUrl(baseUrl: string, reviewJwt: string): string {
    const normalizedBaseUrl = baseUrl.endsWith('/')
      ? baseUrl.slice(0, -1)
      : baseUrl;

    return `${normalizedBaseUrl}/api/review?reviewJwt=${encodeURIComponent(reviewJwt)}`;
  }

  private buildHtml(
    articles: ArticleNotificationData[],
    reviewUrl: string,
  ): string {
    const items = articles
      .map(
        (article) => `
          <li style="margin-bottom: 16px;">
            <strong>${this.escapeHtml(article.title)}</strong><br />
            <span>Author: ${this.escapeHtml(article.originalAuthor)}</span><br />
            <a href="${this.escapeHtml(article.articleUrl)}">${this.escapeHtml(article.articleUrl)}</a>
          </li>
        `,
      )
      .join('');

    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #111827;">
          <h2>Pending News Approval</h2>
          <p>You have ${articles.length} pending articles to review.</p>
          <ul style="padding-left: 20px;">${items}</ul>
          <p>
            <a
              href="${this.escapeHtml(reviewUrl)}"
              style="display: inline-block; background: #111827; color: #ffffff; padding: 12px 18px; text-decoration: none; border-radius: 6px;"
            >
              Review selected articles
            </a>
          </p>
          <p>This link is signed and expires automatically.</p>
        </body>
      </html>
    `;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
