import { Injectable, Logger } from '@nestjs/common';
import { NewsArticleRepositoryPort } from '../../domain/ports/news-article-repository.port';
import { ArticleNotFoundError } from '../../domain/errors/article-not-found.error';

@Injectable()
export class ApproveArticleUseCase {
  private readonly logger = new Logger(ApproveArticleUseCase.name);

  constructor(private readonly articleRepository: NewsArticleRepositoryPort) {}

  async execute(articleId: string): Promise<void> {
    this.logger.debug(`Approving article: ${articleId}`);
    
    const article = await this.articleRepository.findById(articleId);
    
    if (!article) {
      this.logger.warn(`Article not found: ${articleId}`);
      throw new ArticleNotFoundError(articleId);
    }

    article.approve();
    await this.articleRepository.update(article);
    this.logger.log(`Article ${articleId} approved - status: ${article.status}`);
  }
}
