import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ArticleStatus, NewsArticle } from '../../domain/entities/news-article';
import { NewsArticleRepositoryPort } from '../../domain/ports/news-article-repository.port';

@Injectable()
export class GetArticlesToNotifyUseCase {
  private readonly logger = new Logger(GetArticlesToNotifyUseCase.name);

  constructor(private readonly repository: NewsArticleRepositoryPort) {}

  async execute(): Promise<NewsArticle[]> {
    this.logger.debug('Finding articles with status CANDIDATE and notified=false');
    
    const articles = await this.repository.find({
      notified: false,
      status: [ArticleStatus.CANDIDATE]
    });
    
    this.logger.debug(`Found ${articles.length} articles to notify`);
    return articles;
  }
}
