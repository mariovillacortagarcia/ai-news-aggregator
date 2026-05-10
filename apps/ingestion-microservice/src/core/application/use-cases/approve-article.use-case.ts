import { NewsArticleRepositoryPort } from '../../domain/ports/news-article-repository.port';
import { ArticleNotFoundError } from '../../domain/errors/article-not-found.error';

export class ApproveArticleUseCase {
  constructor(private readonly articleRepository: NewsArticleRepositoryPort) {}

  async execute(articleId: string): Promise<void> {
    const article = await this.articleRepository.findById(articleId);
    
    if (!article) {
      throw new ArticleNotFoundError(articleId);
    }

    article.approve();
    await this.articleRepository.update(article);
  }
}
