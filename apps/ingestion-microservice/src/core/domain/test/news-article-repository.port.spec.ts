import { NewsArticle, ArticleStatus } from '../entities/news-article';
import { NewsArticleRepositoryPort } from '../ports/news-article-repository.port';
import { InMemoryNewsArticleRepository } from './mocks/in-memory-news-article.repository';

describe('NewsArticleRepositoryPort', () => {
  let repository: NewsArticleRepositoryPort;
  let testArticle: NewsArticle;

  beforeEach(() => {
    repository = new InMemoryNewsArticleRepository();
    testArticle = new NewsArticle(
      'article-123',
      'https://example.com/article',
      'Example Article',
      'This is an example article.',
      'John Doe',
      'https://example.com/image.jpg',
      'source-123'
    );
  });

  describe('save', () => {
    it('should save a new news article', async () => {
      const saved = await repository.save(testArticle);

      expect(saved).toBeDefined();
      expect(saved.id).toBe(testArticle.id);
    });
  });

  describe('update', () => {
    it('should update an existing news article', async () => {
      await repository.save(testArticle);

      const updatedArticle = new NewsArticle(
        testArticle.id,
        testArticle.articleUrl,
        'Updated Title',
        testArticle.content,
        testArticle.author,
        testArticle.mainImageUrl,
        testArticle.pullSourceId,
        ArticleStatus.APPROVED,
        testArticle.notified,
        testArticle.createdAt,
        new Date()
      );

      const updated = await repository.update(updatedArticle);

      expect(updated.title).toBe('Updated Title');
      expect(updated.status).toBe(ArticleStatus.APPROVED);
    });
  });

  describe('findByUrl', () => {
    it('should find an article by its URL', async () => {
      await repository.save(testArticle);

      const found = await repository.findByUrl(testArticle.articleUrl);

      expect(found).toBeDefined();
      expect(found?.id).toBe(testArticle.id);
    });

    it('should return null when article URL does not exist', async () => {
      const found = await repository.findByUrl('https://nonexistent.com');

      expect(found).toBeNull();
    });
  });

  describe('find', () => {
    it('should find articles with notified=false when filter is { notified: false }', async () => {
      await repository.save(testArticle);

      const results = await repository.find({ notified: false });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe(testArticle.id);
    });

    it('should find articles with notified=true when filter is { notified: true }', async () => {
      const notifiedArticle = new NewsArticle(
        'article-456',
        'https://example.com/article-456',
        'Notified Article',
        'This is a notified article.',
        'Jane Doe',
        'https://example.com/image-456.jpg',
        'source-123',
        ArticleStatus.CANDIDATE,
        true
      );
      await repository.save(notifiedArticle);

      const results = await repository.find({ notified: true });

      expect(results.length).toBe(1);
      expect(results[0].id).toBe('article-456');
    });

    it('should find articles by status when filter is { status: [ArticleStatus.CANDIDATE] }', async () => {
      await repository.save(testArticle);

      const approvedArticle = new NewsArticle(
        'article-456',
        'https://example.com/article-456',
        'Approved Article',
        'This is an approved article.',
        'Jane Doe',
        'https://example.com/image-456.jpg',
        'source-123',
        ArticleStatus.APPROVED
      );
      await repository.save(approvedArticle);

      const results = await repository.find({ status: [ArticleStatus.CANDIDATE] });

      expect(results.length).toBe(1);
      expect(results[0].id).toBe(testArticle.id);
    });

    it('should find articles by multiple statuses', async () => {
      await repository.save(testArticle);

      const approvedArticle = new NewsArticle(
        'article-456',
        'https://example.com/article-456',
        'Approved Article',
        'This is an approved article.',
        'Jane Doe',
        'https://example.com/image-456.jpg',
        'source-123',
        ArticleStatus.APPROVED
      );
      await repository.save(approvedArticle);

      const results = await repository.find({ status: [ArticleStatus.CANDIDATE, ArticleStatus.APPROVED] });

      expect(results.length).toBe(2);
    });

    it('should find articles with combined filters', async () => {
      await repository.save(testArticle);

      const notifiedCandidate = new NewsArticle(
        'article-456',
        'https://example.com/article-456',
        'Notified Candidate',
        'This is a notified candidate.',
        'Jane Doe',
        'https://example.com/image-456.jpg',
        'source-123',
        ArticleStatus.CANDIDATE,
        true
      );
      await repository.save(notifiedCandidate);

      const results = await repository.find({ notified: false, status: [ArticleStatus.CANDIDATE] });

      expect(results.length).toBe(1);
      expect(results[0].id).toBe(testArticle.id);
    });

    it('should return all articles when no filter is provided', async () => {
      await repository.save(testArticle);

      const results = await repository.find();

      expect(results.length).toBe(1);
    });

    it('should return empty array when no articles match the filter', async () => {
      const results = await repository.find({ notified: false });

      expect(results.length).toBe(0);
    });
  });
});
