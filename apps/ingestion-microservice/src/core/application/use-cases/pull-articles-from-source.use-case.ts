import { ArticleStatus, NewsArticle } from '../../domain/entities/news-article';
import { PullSource, RssPullSource, HtmlPullSource } from '../../domain/entities/pull-source';
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

    const sourceUrl = this.getSourceUrl(source);
    const extractedArticles = await this.extractor.extract(sourceUrl);
    const newArticles: NewsArticle[] = [];

    for (const articleData of extractedArticles) {
      const existing = await this.newsArticleRepository.findByUrl(articleData.articleUrl);
      
      if (existing) {
        continue;
      }

      const newArticle = new NewsArticle(
        `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  private getSourceUrl(source: PullSource): string {
    if (source instanceof RssPullSource || source instanceof HtmlPullSource) {
      return source.sourceUrl;
    }
    throw new Error('Unknown source type');
  }
}
