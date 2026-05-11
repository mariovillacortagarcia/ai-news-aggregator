import { Injectable, Logger } from '@nestjs/common';
import { NewsArticleRepositoryPort } from '../../domain/ports/news-article-repository.port';
import { ArticleNotFoundError } from '../../domain/errors/article-not-found.error';

@Injectable()
export class RejectArticleUseCase {
  private readonly logger = new Logger(RejectArticleUseCase.name);

  constructor(private readonly articleRepository: NewsArticleRepositoryPort) {}

  async execute(articleId: string): Promise<void> {
    this.logger.debug(`Rejecting article: ${articleId}`);
    
    const article = await this.articleRepository.findById(articleId);
    
    if (!article) {
      this.logger.warn(`Article not found: ${articleId}`);
      throw new ArticleNotFoundError(articleId);
    }

    article.reject();
    await this.articleRepository.update(article);
    this.logger.log(`Article ${articleId} rejected - status: ${article.status}`);
  }
}
