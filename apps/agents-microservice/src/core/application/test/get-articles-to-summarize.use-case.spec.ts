import {
  ArticleStatus,
  InMemoryNewsArticleRepository,
  NewsArticle,
  NewsArticleRepositoryPort,
} from '@ai-news-aggregator/news-article';
import { GetArticlesToSummarizeUseCase } from '../use-cases/get-articles-to-summarize.use-case';

describe('GetArticlesToSummarizeUseCase', () => {
  let useCase: GetArticlesToSummarizeUseCase;
  let repository: NewsArticleRepositoryPort;
  beforeEach(async () => {
    repository = new InMemoryNewsArticleRepository();
    useCase = new GetArticlesToSummarizeUseCase(repository);
  });
  describe('constructor', () => {
    it('should create the use case', () => {
      expect(useCase).toBeDefined();
    });
  });

  describe('execute', () => {
    it('should return approved articles that are not summarized', async () => {
      const article1 = await repository.save(
        new NewsArticle(
          '1',
          'http://example.com/article1',
          'Article 1',
          'Content 1',
          'Author 1',
          null,
          'pull-1',
          ArticleStatus.APPROVED,
        ),
      );
      const article2 = await repository.save(
        new NewsArticle(
          '2',
          'http://example.com/article2',
          'Article 2',
          'Content 2',
          'Author 2',
          null,
          'pull-2',
        ),
      );
      const article3 = await repository.save(
        new NewsArticle(
          '3',
          'http://example.com/article3',
          'Article 3',
          'Content 3',
          'Author 3',
          null,
          'pull-3',
          ArticleStatus.APPROVED,
          true,
          new Date(),
          new Date(),
          'Already summarized',
        ),
      );

      const result = await useCase.execute();

      expect(result).toEqual([article1]);
    });

    it('should not return articles that are not APPROVED', async () => {
      const article1 = await repository.save(
        new NewsArticle(
          '1',
          'http://example.com/article1',
          'Article 1',
          'Content 1',
          'Author 1',
          null,
          'pull-1',
        ),
      );
      const article2 = await repository.save(
        new NewsArticle(
          '2',
          'http://example.com/article2',
          'Article 2',
          'Content 2',
          'Author 2',
          null,
          'pull-2',
        ),
      );

      const result = await useCase.execute();

      expect(result).toEqual([]);
    });

    it('should not return approved articles that already have a summary', async () => {
      await repository.save(
        new NewsArticle(
          '1',
          'http://example.com/article1',
          'Article 1',
          'Content 1',
          'Author 1',
          null,
          'pull-1',
          ArticleStatus.APPROVED,
          false,
          new Date(),
          new Date(),
          'Existing summary',
        ),
      );

      const result = await useCase.execute();

      expect(result).toEqual([]);
    });
  });
});
