import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Post,
  Query,
} from '@nestjs/common';
import { ApproveArticleUseCase } from '../core/application/use-cases/approve-article.use-case';
import { RejectArticleUseCase } from '../core/application/use-cases/reject-article.use-case';
import { ReviewTokenService } from '../infrastructure/adapters/messaging/review-token.service';
import {
  ArticleStatus,
  NewsArticle,
  NewsArticleRepositoryPort,
} from '@ai-news-aggregator/news-article';

type ReviewAction = 'approve' | 'reject';

@Controller('review')
export class ReviewController {
  constructor(
    private readonly reviewTokenService: ReviewTokenService,
    private readonly articleRepository: NewsArticleRepositoryPort,
    private readonly approveArticle: ApproveArticleUseCase,
    private readonly rejectArticle: RejectArticleUseCase,
  ) {}

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  async getReviewPage(@Query('reviewJwt') reviewJwt: string): Promise<string> {
    try {
      const payload = this.reviewTokenService.verifyReviewJwt(reviewJwt);
      const pendingArticles = await this.getPendingArticles(payload.articleIds);

      if (pendingArticles.length === 0) {
        return this.renderResultPage(
          'All batch articles have already been reviewed.',
        );
      }

      return this.renderReviewPage(reviewJwt, pendingArticles);
    } catch (error) {
      return this.renderErrorPage(
        'Invalid or expired review link',
        (error as Error).message,
      );
    }
  }

  @Post('actions')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async applyReviewAction(
    @Query('reviewJwt') reviewJwt: string,
    @Body('action') action: ReviewAction,
    @Body('articleIds') articleIds: string[] | string | undefined,
  ): Promise<string> {
    if (action !== 'approve' && action !== 'reject') {
      throw new BadRequestException('Invalid action');
    }

    try {
      const payload = this.reviewTokenService.verifyReviewJwt(reviewJwt);
      const selectedIds = this.normalizeSelectedArticleIds(articleIds);

      if (selectedIds.length === 0) {
        throw new BadRequestException('At least one article must be selected');
      }

      const invalidArticleId = selectedIds.find(
        (articleId) => !payload.articleIds.includes(articleId),
      );

      if (invalidArticleId) {
        throw new BadRequestException('Invalid article selection');
      }

      const results = await Promise.allSettled(
        selectedIds.map((articleId) =>
          action === 'approve'
            ? this.approveArticle.execute(articleId)
            : this.rejectArticle.execute(articleId),
        ),
      );
      const failedResults = results.filter(
        (result): result is PromiseRejectedResult => result.status === 'rejected',
      );

      const pendingArticles = await this.getPendingArticles(payload.articleIds);
      const processedCount = selectedIds.length - failedResults.length;

      if (failedResults.length > 0) {
        const errorMessage = failedResults
          .map((result) => (result.reason as Error).message)
          .join('; ');

        if (pendingArticles.length === 0) {
          return this.renderResultPage(
            `${processedCount} article(s) processed with action ${action}. ${failedResults.length} article(s) failed: ${errorMessage}`,
          );
        }

        return this.renderReviewPage(reviewJwt, pendingArticles, {
          variant: 'warning',
          title: 'Selection partially processed',
          message: `${processedCount} article(s) processed with action ${action}. ${failedResults.length} article(s) failed: ${errorMessage}.`,
        });
      }

      if (pendingArticles.length === 0) {
        return this.renderResultPage(
          `${selectedIds.length} article(s) processed with action ${action}. No pending articles remain in this batch.`,
        );
      }

      return this.renderReviewPage(reviewJwt, pendingArticles, {
        variant: 'success',
        title: 'Selection processed',
        message: `${selectedIds.length} article(s) processed with action ${action}. ${pendingArticles.length} article(s) remain in this batch.`,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      return this.renderErrorPage(
        'Invalid or expired review link',
        (error as Error).message,
      );
    }
  }

  private normalizeSelectedArticleIds(
    articleIds: string[] | string | undefined,
  ): string[] {
    if (!articleIds) {
      return [];
    }

    return [...new Set(Array.isArray(articleIds) ? articleIds : [articleIds])];
  }

  private async getPendingArticles(articleIds: string[]): Promise<NewsArticle[]> {
    const articles = await Promise.all(
      articleIds.map((articleId) => this.articleRepository.findById(articleId)),
    );

    return articles.filter(
      (article): article is NewsArticle =>
        article !== null && article.status === ArticleStatus.CANDIDATE,
    );
  }

  private renderReviewPage(
    reviewJwt: string,
    articles: NewsArticle[],
    feedback?: {
      variant: 'success' | 'warning';
      title: string;
      message: string;
    },
  ): string {
    const rows = articles
      .map(
        (article) => `
          <label style="display: block; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; margin-bottom: 12px;">
            <input type="checkbox" name="articleIds" value="${this.escapeHtml(article.id)}" />
            <strong>${this.escapeHtml(article.title)}</strong><br />
            <span>${this.escapeHtml(article.author)}</span><br />
            <a href="${this.escapeHtml(article.articleUrl)}">${this.escapeHtml(article.articleUrl)}</a>
          </label>
        `,
      )
      .join('');
    const feedbackStyles =
      feedback?.variant === 'warning'
        ? 'background: #fffbeb; color: #92400e; border: 1px solid #fcd34d;'
        : 'background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;';
    const feedbackBanner = feedback
      ? `
          <div style="margin-bottom: 20px; padding: 12px 16px; border-radius: 8px; ${feedbackStyles}">
            <strong>${this.escapeHtml(feedback.title)}</strong><br />
            <span>${this.escapeHtml(feedback.message)}</span>
          </div>
        `
      : '';

    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #111827; padding: 24px;">
          <h1>Review pending articles</h1>
          ${feedbackBanner}
          <form method="POST" action="/api/review/actions?reviewJwt=${encodeURIComponent(reviewJwt)}">
            ${rows}
            <div style="margin-top: 24px; display: flex; gap: 12px;">
              <button type="submit" name="action" value="approve">Approve selected</button>
              <button type="submit" name="action" value="reject">Reject selected</button>
            </div>
          </form>
        </body>
      </html>
    `;
  }

  private renderResultPage(message: string): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #111827; padding: 24px;">
          <h1>Review completed</h1>
          <p>${this.escapeHtml(message)}</p>
        </body>
      </html>
    `;
  }

  private renderErrorPage(title: string, message: string): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #111827; padding: 24px;">
          <h1>${this.escapeHtml(title)}</h1>
          <p>${this.escapeHtml(message)}</p>
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
