import { CmsPublicationException } from '../../core/domain/errors/cms-publication.exception';
import { CmsCredentialsProvider } from './cms-credentials.provider';

describe('CmsCredentialsProvider', () => {
  const originalEnv = process.env;
  let provider: CmsCredentialsProvider;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.CMS_WORDPRESS_MAIN_APPLICATION_PASSWORD;
    provider = new CmsCredentialsProvider();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should resolve wordpress application password from credentials ref', () => {
    process.env.CMS_WORDPRESS_MAIN_APPLICATION_PASSWORD = 'secret';

    const resolvedCredential = provider.getWordpressApplicationPassword(
      'wordpress-main',
    );

    expect(resolvedCredential).toBe('secret');
  });

  it('should throw when credentials ref cannot be resolved', () => {
    expect(() =>
      provider.getWordpressApplicationPassword('wordpress-main'),
    ).toThrow(CmsPublicationException);
  });
});
