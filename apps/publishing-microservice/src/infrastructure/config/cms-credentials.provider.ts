import { Injectable } from '@nestjs/common';
import { CmsPublicationException } from '../../core/domain/errors/cms-publication.exception';

@Injectable()
export class CmsCredentialsProvider {
  getWordpressApplicationPassword(credentialsRef: string): string {
    const normalizedRef = credentialsRef
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toUpperCase();

    const envVarName = `CMS_${normalizedRef}_APPLICATION_PASSWORD`;
    const resolvedCredential = process.env[envVarName]?.trim();

    if (!resolvedCredential) {
      throw new CmsPublicationException(
        `Missing WordPress application password for credentials ref ${credentialsRef}`,
      );
    }

    return resolvedCredential;
  }
}
