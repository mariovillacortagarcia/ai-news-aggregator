import { ArticleStatus, NewsArticle } from '../../domain/entities/news-article';
import { NewsArticleRepositoryPort } from '../../domain/ports/news-article-repository.port';

export class GetArticlesToNotifyUseCase {
  constructor(private readonly repository: NewsArticleRepositoryPort) {}

  async execute(): Promise<NewsArticle[]> {
    return this.repository.find({
      notified: false,
      status: [ArticleStatus.CANDIDATE]
    });
  }
}
