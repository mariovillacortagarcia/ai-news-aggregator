import { ArticleStatus, NewsArticle } from '@ai-news-aggregator/news-article';
import request from 'supertest';
import {
  IngestionE2eContext,
  createIngestionE2eApp,
  resetIngestionE2eContext,
} from '../support/ingestion-e2e-app';
import { ReviewTokenService } from '@ai-news-aggregator/ingestion-microservice/infrastructure/adapters/messaging/review-token.service';

describe('Review Flow E2E', () => {
  let context: IngestionE2eContext;
  const originalEnv = process.env;

  beforeEach(async () => {
    process.env = {
      ...originalEnv,
      NOTIFICATION_JWT_SECRET: 'test-secret',
      NOTIFICATION_JWT_TTL_SECONDS: '86400',
    };
    context = await createIngestionE2eApp();
  });

  afterEach(async () => {
    process.env = originalEnv;
    await resetIngestionE2eContext(context);
    await context.app.close();
  });

  function createArticle(id: string): NewsArticle {
    return new NewsArticle(
      id,
      `https://example.com/${id}`,
      `Article ${id}`,
      `Content ${id}`,
      `Author ${id}`,
      `https://example.com/${id}.jpg`,
      'source-1',
      ArticleStatus.CANDIDATE,
      false,
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-01T00:00:00Z'),
    );
  }

  it('should keep the remaining articles of the batch available after an action', async () => {
    const firstArticle = createArticle('article-1');
    const secondArticle = createArticle('article-2');
    await context.articleRepository.save(firstArticle);
    await context.articleRepository.save(secondArticle);

    const tokenService = context.app.get(ReviewTokenService);
    const reviewJwt = tokenService.createReviewJwt('editor@example.com', [
      firstArticle.id,
      secondArticle.id,
    ]);

    const response = await request(context.app.getHttpServer())
      .post(`/api/review/actions?reviewJwt=${encodeURIComponent(reviewJwt)}`)
      .type('form')
      .send({
        action: 'approve',
        articleIds: firstArticle.id,
      });

    expect(response.status).toBe(201);
    expect(response.text).toContain('Selection processed');
    expect(response.text).toContain('1 article(s) remain in this batch.');
    expect(response.text).toContain('Article article-2');
    expect(response.text).not.toContain('Article article-1');

    const storedFirstArticle = await context.articleRepository.findById(
      firstArticle.id,
    );
    const storedSecondArticle = await context.articleRepository.findById(
      secondArticle.id,
    );

    expect(storedFirstArticle?.status).toBe(ArticleStatus.APPROVED);
    expect(storedSecondArticle?.status).toBe(ArticleStatus.CANDIDATE);
  });
});
