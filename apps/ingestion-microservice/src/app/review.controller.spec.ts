import {
  ArticleStatus,
  InMemoryNewsArticleRepository,
  NewsArticle,
} from '@ai-news-aggregator/news-article';
import { ApproveArticleUseCase } from '../core/application/use-cases/approve-article.use-case';
import { RejectArticleUseCase } from '../core/application/use-cases/reject-article.use-case';
import { ReviewTokenService } from '../infrastructure/adapters/messaging/review-token.service';
import { ReviewController } from './review.controller';

describe('ReviewController', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NOTIFICATION_JWT_SECRET: 'test-secret',
      NOTIFICATION_JWT_TTL_SECONDS: '86400',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  function createArticle(id: string, status: ArticleStatus): NewsArticle {
    return new NewsArticle(
      id,
      `https://example.com/${id}`,
      `Article ${id}`,
      `Content ${id}`,
      `Author ${id}`,
      `https://example.com/${id}.jpg`,
      'source-1',
      status,
      false,
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-01T00:00:00Z'),
    );
  }

  it('should only show pending articles from the batch review page', async () => {
    const repository = new InMemoryNewsArticleRepository();
    const candidateArticle = createArticle('article-1', ArticleStatus.CANDIDATE);
    const approvedArticle = createArticle('article-2', ArticleStatus.APPROVED);
    await repository.save(candidateArticle);
    await repository.save(approvedArticle);

    const controller = new ReviewController(
      new ReviewTokenService(),
      repository,
      new ApproveArticleUseCase(repository),
      new RejectArticleUseCase(repository),
    );
    const reviewJwt = new ReviewTokenService().createReviewJwt('editor@example.com', [
      candidateArticle.id,
      approvedArticle.id,
    ]);

    const page = await controller.getReviewPage(reviewJwt);

    expect(page).toContain('Article article-1');
    expect(page).not.toContain('Article article-2');
  });

  it('should keep remaining candidate articles available after processing a selection', async () => {
    const repository = new InMemoryNewsArticleRepository();
    const firstArticle = createArticle('article-1', ArticleStatus.CANDIDATE);
    const secondArticle = createArticle('article-2', ArticleStatus.CANDIDATE);
    await repository.save(firstArticle);
    await repository.save(secondArticle);

    const controller = new ReviewController(
      new ReviewTokenService(),
      repository,
      new ApproveArticleUseCase(repository),
      new RejectArticleUseCase(repository),
    );
    const reviewJwt = new ReviewTokenService().createReviewJwt('editor@example.com', [
      firstArticle.id,
      secondArticle.id,
    ]);

    const page = await controller.applyReviewAction(
      reviewJwt,
      'approve',
      firstArticle.id,
    );

    const storedFirstArticle = await repository.findById(firstArticle.id);
    const storedSecondArticle = await repository.findById(secondArticle.id);

    expect(storedFirstArticle?.status).toBe(ArticleStatus.APPROVED);
    expect(storedSecondArticle?.status).toBe(ArticleStatus.CANDIDATE);
    expect(page).toContain('Selection processed');
    expect(page).toContain('1 article(s) remain in this batch.');
    expect(page).toContain('Article article-2');
    expect(page).not.toContain('Article article-1');
  });

  it('should render a completion page when the batch has no pending articles left', async () => {
    const repository = new InMemoryNewsArticleRepository();
    const article = createArticle('article-1', ArticleStatus.CANDIDATE);
    await repository.save(article);

    const controller = new ReviewController(
      new ReviewTokenService(),
      repository,
      new ApproveArticleUseCase(repository),
      new RejectArticleUseCase(repository),
    );
    const reviewJwt = new ReviewTokenService().createReviewJwt('editor@example.com', [
      article.id,
    ]);

    const page = await controller.applyReviewAction(
      reviewJwt,
      'reject',
      article.id,
    );

    expect(page).toContain('Review completed');
    expect(page).toContain('No pending articles remain in this batch.');
  });

  it('should render a user-friendly error page when the review jwt is invalid', async () => {
    const repository = new InMemoryNewsArticleRepository();
    const controller = new ReviewController(
      new ReviewTokenService(),
      repository,
      new ApproveArticleUseCase(repository),
      new RejectArticleUseCase(repository),
    );

    const page = await controller.getReviewPage('invalid');

    expect(page).toContain('Invalid or expired review link');
    expect(page).toContain('Invalid review token format');
  });

  it('should deduplicate selected article ids before processing', async () => {
    const repository = new InMemoryNewsArticleRepository();
    const article = createArticle('article-1', ArticleStatus.CANDIDATE);
    await repository.save(article);
    const approveUseCase = new ApproveArticleUseCase(repository);
    const approveSpy = jest.spyOn(approveUseCase, 'execute');
    const controller = new ReviewController(
      new ReviewTokenService(),
      repository,
      approveUseCase,
      new RejectArticleUseCase(repository),
    );
    const reviewJwt = new ReviewTokenService().createReviewJwt(
      'editor@example.com',
      [article.id],
    );

    await controller.applyReviewAction(reviewJwt, 'approve', [
      article.id,
      article.id,
    ]);

    expect(approveSpy).toHaveBeenCalledTimes(1);
  });

  it('should escape article ids and result messages in rendered html', async () => {
    const repository = new InMemoryNewsArticleRepository();
    const article = createArticle('article-1" onclick="alert(1)', ArticleStatus.CANDIDATE);
    await repository.save(article);
    const controller = new ReviewController(
      new ReviewTokenService(),
      repository,
      new ApproveArticleUseCase(repository),
      new RejectArticleUseCase(repository),
    );
    const reviewJwt = new ReviewTokenService().createReviewJwt(
      'editor@example.com',
      [article.id],
    );

    const reviewPage = await controller.getReviewPage(reviewJwt);
    const resultPage = await controller.applyReviewAction(
      reviewJwt,
      'approve',
      article.id,
    );

    expect(reviewPage).toContain(
      'value="article-1&quot; onclick=&quot;alert(1)"',
    );
    expect(resultPage).not.toContain('<script>');
  });
});
