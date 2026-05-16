import { createHmac, timingSafeEqual } from 'crypto';
import { Injectable } from '@nestjs/common';
import { getEmailConfig } from '../../config/email.config';

interface ReviewTokenPayload {
  aud: 'ingestion-review';
  email: string;
  articleIds: string[];
  iat: number;
  exp: number;
}

@Injectable()
export class ReviewTokenService {
  createReviewJwt(email: string, articleIds: string[]): string {
    const now = Math.floor(Date.now() / 1000);
    const config = getEmailConfig();
    const payload: ReviewTokenPayload = {
      aud: 'ingestion-review',
      email,
      articleIds,
      iat: now,
      exp: now + config.jwtTtlSeconds,
    };

    return this.sign(payload);
  }

  verifyReviewJwt(reviewJwt: string): ReviewTokenPayload {
    const config = getEmailConfig();
    const [encodedHeader, encodedPayload, encodedSignature] =
      reviewJwt.split('.');

    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      throw new Error('Invalid review token format');
    }

    const data = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = this.base64UrlEncode(
      createHmac('sha256', config.jwtSecret).update(data).digest(),
    );

    if (
      Buffer.byteLength(encodedSignature) !== Buffer.byteLength(expectedSignature) ||
      !timingSafeEqual(
        Buffer.from(encodedSignature),
        Buffer.from(expectedSignature),
      )
    ) {
      throw new Error('Invalid review token signature');
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as ReviewTokenPayload;

    if (payload.aud !== 'ingestion-review') {
      throw new Error('Invalid review token audience');
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      throw new Error('Expired review token');
    }

    return payload;
  }

  private sign(payload: ReviewTokenPayload): string {
    const config = getEmailConfig();
    const encodedHeader = this.base64UrlEncode(
      Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })),
    );
    const encodedPayload = this.base64UrlEncode(
      Buffer.from(JSON.stringify(payload)),
    );
    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = this.base64UrlEncode(
      createHmac('sha256', config.jwtSecret).update(data).digest(),
    );

    return `${data}.${signature}`;
  }

  private base64UrlEncode(value: Buffer): string {
    return value.toString('base64url');
  }
}
