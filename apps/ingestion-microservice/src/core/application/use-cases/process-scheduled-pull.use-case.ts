import { PullSourceRepositoryPort } from '../../domain/ports/pull-source-repository.port';
import { NewsArticleRepositoryPort } from '../../domain/ports/news-article-repository.port';
import { PullSourceExtractorPort } from '../../domain/ports/pull-source-extractor.port';
import { NewsArticle, ArticleStatus } from '../../domain/entities/news-article';
import { PullSource, RssPullSource, HtmlPullSource } from '../../domain/entities/pull-source';

export class ProcessScheduledPullUseCase {
  constructor(
    private readonly pullSourceRepository: PullSourceRepositoryPort,
    private readonly newsArticleRepository: NewsArticleRepositoryPort,
    private readonly extractor: PullSourceExtractorPort
  ) {}

  async execute(): Promise<{ success: string[]; errors: { sourceId: string; error: Error }[] }> {
    const now = new Date();
    const dueSources = await this.pullSourceRepository.findDueSources(now);
    
    const success: string[] = [];
    const errors: { sourceId: string; error: Error }[] = [];

    for (const source of dueSources) {
      try {
        const sourceUrl = this.getSourceUrl(source);
        const extractedArticles = await this.extractor.extract(sourceUrl);

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
            source.id,
            ArticleStatus.CANDIDATE,
            false,
            articleData.createdAt,
            new Date()
          );

          await this.newsArticleRepository.save(newArticle);
        }

        await this.pullSourceRepository.updateLastPolledAt(source.id, now);
        success.push(source.id);
      } catch (error) {
        errors.push({ sourceId: source.id, error: error as Error });
        await this.pullSourceRepository.updateLastPolledAt(source.id, now);
      }
    }

    return { success, errors };
  }

  private getSourceUrl(source: PullSource): string {
    if (source instanceof RssPullSource || source instanceof HtmlPullSource) {
      return source.sourceUrl;
    }
    throw new Error('Unknown source type');
  }
}
