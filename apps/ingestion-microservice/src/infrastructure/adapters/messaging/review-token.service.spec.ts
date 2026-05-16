import { ReviewTokenService } from './review-token.service';

describe('ReviewTokenService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NOTIFICATION_JWT_SECRET: 'test-secret',
      NOTIFICATION_JWT_TTL_SECONDS: '3600',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create and verify a signed review token', () => {
    const service = new ReviewTokenService();

    const reviewJwt = service.createReviewJwt('editor@example.com', ['a1', 'a2']);
    const payload = service.verifyReviewJwt(reviewJwt);

    expect(payload.email).toBe('editor@example.com');
    expect(payload.articleIds).toEqual(['a1', 'a2']);
    expect(payload.aud).toBe('ingestion-review');
  });

  it('should reject tokens with invalid signatures', () => {
    const service = new ReviewTokenService();
    const reviewJwt = service.createReviewJwt('editor@example.com', ['a1']);
    const tampered = `${reviewJwt.slice(0, -1)}x`;

    expect(() => service.verifyReviewJwt(tampered)).toThrow(
      'Invalid review token signature',
    );
  });
});
