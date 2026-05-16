import {
  ArticleNotificationData,
} from '../../../core/domain/ports/notification.port';
import { EmailNotificationAdapter } from './email-notification.adapter';
import { EmailClientProvider } from './email-client.provider';
import { ReviewTokenService } from './review-token.service';

describe('EmailNotificationAdapter', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NOTIFICATION_EMAIL_TO: 'editor@example.com',
      NOTIFICATION_EMAIL_FROM: 'bot@example.com',
      NOTIFICATION_REVIEW_BASE_URL: 'https://review.example.com',
      NOTIFICATION_JWT_SECRET: 'test-secret',
      SMTP_HOST: 'smtp.example.com',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('should send an html email with a signed review link', async () => {
    const sendMail = jest.fn().mockResolvedValue(undefined);
    const emailClientProvider = {
      getTransporter: jest.fn().mockReturnValue({
        sendMail,
      }),
    } as unknown as EmailClientProvider;
    const reviewTokenService = {
      createReviewJwt: jest.fn().mockReturnValue('signed-jwt'),
    } as unknown as ReviewTokenService;
    const adapter = new EmailNotificationAdapter(
      emailClientProvider,
      reviewTokenService,
    );

    const articles: ArticleNotificationData[] = [
      {
        articleId: 'article-1',
        title: 'Article 1',
        articleUrl: 'https://example.com/article-1',
        mainImageUrl: 'https://example.com/image1.jpg',
        originalAuthor: 'Author 1',
      },
    ];

    await adapter.sendBatchNotification(articles);

    expect(reviewTokenService.createReviewJwt).toHaveBeenCalledWith(
      'editor@example.com',
      ['article-1'],
    );
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'editor@example.com',
        from: 'bot@example.com',
        subject: 'News approval batch (1)',
        html: expect.stringContaining(
          'https://review.example.com/api/review?reviewJwt=signed-jwt',
        ),
      }),
    );
  });

  it('should skip sending when email configuration is incomplete', async () => {
    process.env = {
      ...originalEnv,
      NOTIFICATION_EMAIL_TO: '',
    };

    const emailClientProvider = {
      getTransporter: jest.fn(),
    } as unknown as EmailClientProvider;
    const reviewTokenService = new ReviewTokenService();
    const adapter = new EmailNotificationAdapter(
      emailClientProvider,
      reviewTokenService,
    );

    await adapter.sendBatchNotification([
      {
        articleId: 'article-1',
        title: 'Article 1',
        articleUrl: 'https://example.com/article-1',
        mainImageUrl: 'https://example.com/image1.jpg',
        originalAuthor: 'Author 1',
      },
    ]);

    expect(emailClientProvider.getTransporter).not.toHaveBeenCalled();
  });
});
