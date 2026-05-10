import { ArticleStatus, NewsArticle } from "../../domain/entities/news-article";
import { NewsArticleRepositoryPort } from "../../domain/ports/news-article-repository.port";
import { InMemoryNewsArticleRepository } from "../../domain/test/mocks/in-memory-news-article.repository";
import { GetArticlesToNotifyUseCase } from "../use-cases/get-articles-to-notify.use-case";

describe('GetArticlesToNotifyUseCase', () => {
  let repository: InMemoryNewsArticleRepository;
  let useCase: GetArticlesToNotifyUseCase;

  beforeEach(() => {
    repository = new InMemoryNewsArticleRepository();
    useCase = new GetArticlesToNotifyUseCase(repository);
  });

  describe('constructor', ()=> {
    it('should create an instance of GetArticlesToNotifyUseCase', () => {
      expect(useCase).toBeDefined();
    });
  });

  describe('execute', () => {
    it('should return articles that are not notified', async () => {
      const article1 = new NewsArticle(
        'article-1',
        'https://example.com/article1',
        'Article 1',
        'Content of article 1',
        'Author 1',
        'https://example.com/image1.jpg',
        'source-123',
        ArticleStatus.CANDIDATE,
        false,
        new Date(),
        new Date()
      );

      const article2 = new NewsArticle(
        'article-2',
        'https://example.com/article2',
        'Article 2',
        'Content of article 2',
        'Author 2',
        'https://example.com/image2.jpg',
        'source-123',
        ArticleStatus.APPROVED,
        true,
        new Date(),
        new Date()
      );

      await repository.save(article1);
      await repository.save(article2);

      const result = await useCase.execute();

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('article-1');
    });

    it('should return an empty array when there are no articles to notify', async () => {
      const result = await useCase.execute();

      expect(result).toEqual([]);
    });

    it('should omit articles already approved or rejected to be notified', async () => {
      const candidateArticle = new NewsArticle(
        'article-1',
        'https://example.com/article1',
        'Article 1',
        'Content of article 1',
        'Author 1',
        'https://example.com/image1.jpg',
        'source-123',
        ArticleStatus.CANDIDATE,
        false,
        new Date(),
        new Date()
      );

      const approvedArticle = new NewsArticle(
        'article-2',
        'https://example.com/article2',
        'Article 2',
        'Content of article 2',
        'Author 2',
        'https://example.com/image2.jpg',
        'source-123',
        ArticleStatus.APPROVED,
        false,
        new Date(),
        new Date()
      );

      const rejectedArticle = new NewsArticle(
        'article-3',
        'https://example.com/article3',
        'Article 3',
        'Content of article 3',
        'Author 3',
        'https://example.com/image3.jpg',
        'source-123',
        ArticleStatus.REJECTED,
        false,
        new Date(),
        new Date()
      );

      await repository.save(candidateArticle);
      await repository.save(approvedArticle);
      await repository.save(rejectedArticle);

      const result = await useCase.execute();

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('article-1');
    });
  });
});
