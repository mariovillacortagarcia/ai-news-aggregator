import { randomUUID } from 'crypto';
import { ArticleStatus, NewsArticle } from '../../domain/entities/news-article';
import { PullSource } from '../../domain/entities/pull-source';
import { PullSourceRepositoryPort } from '../../domain/ports/pull-source-repository.port';
import { NewsArticleRepositoryPort } from '../../domain/ports/news-article-repository.port';
import { PullSourceExtractorPort } from '../../domain/ports/pull-source-extractor.port';

export class PullArticlesFromSourceUseCase {
  constructor(
    private readonly pullSourceRepository: PullSourceRepositoryPort,
    private readonly newsArticleRepository: NewsArticleRepositoryPort,
    private readonly extractor: PullSourceExtractorPort
  ) {}

  async execute(sourceId: string): Promise<NewsArticle[]> {
    const source = await this.pullSourceRepository.findById(sourceId);
    
    if (!source) {
      throw new Error('PullSource not found');
    }

    const extractedArticles = await this.extractor.extract(source, source.lastPolledAt ?? undefined);
    const newArticles: NewsArticle[] = [];

    for (const articleData of extractedArticles) {
      const existing = await this.newsArticleRepository.findByUrl(articleData.articleUrl);
      
      if (existing) {
        continue;
      }

      const newArticle = new NewsArticle(
        randomUUID(),
        articleData.articleUrl,
        articleData.title,
        articleData.content,
        articleData.originalAuthor,
        articleData.mainImageUrl,
        sourceId,
        ArticleStatus.CANDIDATE,
        false,
        articleData.createdAt,
        new Date()
      );

      newArticles.push(newArticle);
    }

    return newArticles;
  }
}
