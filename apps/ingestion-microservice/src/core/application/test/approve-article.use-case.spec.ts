import { ArticleStatus, NewsArticle, ArticleNotFoundError, ArgumentError, InMemoryNewsArticleRepository } from '@ai-news-aggregator/news-article';
import { ApproveArticleUseCase } from '../use-cases/approve-article.use-case';

describe('ApproveArticleUseCase', () => {
  let useCase: ApproveArticleUseCase;
  let articleRepository: InMemoryNewsArticleRepository;

  beforeEach(() => {
    articleRepository = new InMemoryNewsArticleRepository();
    useCase = new ApproveArticleUseCase(articleRepository);
  });

  describe('execute', () => {
    it('should approve a CANDIDATE article', async () => {
      const article = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Article 1',
        'Content 1',
        'Author 1',
        'https://example.com/image1.jpg',
        'source-1',
        ArticleStatus.CANDIDATE,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z')
      );

      await articleRepository.save(article);

      await useCase.execute('article-1');

      const updatedArticle = await articleRepository.findById('article-1');
      expect(updatedArticle?.status).toBe(ArticleStatus.APPROVED);
    });

    it('should update updatedAt timestamp when approving', async () => {
      const before = new Date('2024-01-01T00:00:00Z');
      const article = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Article 1',
        'Content 1',
        'Author 1',
        'https://example.com/image1.jpg',
        'source-1',
        ArticleStatus.CANDIDATE,
        false,
        before,
        before
      );

      await articleRepository.save(article);

      await useCase.execute('article-1');

      const updatedArticle = await articleRepository.findById('article-1');
      expect(updatedArticle?.updatedAt.getTime()).toBeGreaterThan(before.getTime());
    });

    it('should throw ArticleNotFoundError when article does not exist', async () => {
      await expect(useCase.execute('non-existent-id')).rejects.toThrow(ArticleNotFoundError);
      await expect(useCase.execute('non-existent-id')).rejects.toThrow('Article with id "non-existent-id" not found');
    });

    it('should throw ArgumentError when article is already APPROVED', async () => {
      const article = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Article 1',
        'Content 1',
        'Author 1',
        'https://example.com/image1.jpg',
        'source-1',
        ArticleStatus.APPROVED,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z')
      );

      await articleRepository.save(article);

      await expect(useCase.execute('article-1')).rejects.toThrow(ArgumentError);
      await expect(useCase.execute('article-1')).rejects.toThrow('Cannot approve an article with status APPROVED');
    });

    it('should throw ArgumentError when article is already REJECTED', async () => {
      const article = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Article 1',
        'Content 1',
        'Author 1',
        'https://example.com/image1.jpg',
        'source-1',
        ArticleStatus.REJECTED,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z')
      );

      await articleRepository.save(article);

      await expect(useCase.execute('article-1')).rejects.toThrow(ArgumentError);
      await expect(useCase.execute('article-1')).rejects.toThrow('Cannot approve an article with status REJECTED');
    });
  });
});
