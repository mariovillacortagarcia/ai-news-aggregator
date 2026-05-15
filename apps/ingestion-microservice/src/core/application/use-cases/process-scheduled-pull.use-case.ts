import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PullSourceRepositoryPort } from '../../domain/ports/pull-source-repository.port';
import { NewsArticleRepositoryPort, NewsArticle, ArticleStatus } from '@ai-news-aggregator/news-article';
import { PullSourceExtractorPort } from '../../domain/ports/pull-source-extractor.port';
import { PullSource } from '../../domain/entities/pull-source';

@Injectable()
export class ProcessScheduledPullUseCase {
  private readonly logger = new Logger(ProcessScheduledPullUseCase.name);

  constructor(
    private readonly pullSourceRepository: PullSourceRepositoryPort,
    private readonly newsArticleRepository: NewsArticleRepositoryPort,
    private readonly extractor: PullSourceExtractorPort
  ) {}

  async execute(): Promise<{ success: string[]; errors: { sourceId: string; error: Error }[] }> {
    const now = new Date();
    this.logger.debug(`Finding due sources at ${now.toISOString()}`);
    
    const dueSources = await this.pullSourceRepository.findDueSources(now);
    this.logger.log(`Found ${dueSources.length} sources due for polling`);
    
    const success: string[] = [];
    const errors: { sourceId: string; error: Error }[] = [];

    for (const source of dueSources) {
      try {
        this.logger.debug(`Processing source: ${source.id} (type: ${source.constructor.name}, lastPolledAt: ${source.lastPolledAt?.toISOString() ?? 'null'})`);
        
        const extractedArticles = await this.extractor.extract(source, source.lastPolledAt ?? undefined);
        this.logger.debug(`Extracted ${extractedArticles.length} articles from ${source.id}`);

        if (extractedArticles.length === 0) {
          this.logger.debug(`No articles to process for source ${source.id}`);
          await this.pullSourceRepository.updateLastPolledAt(source.id, now);
          success.push(source.id);
          continue;
        }

        const articleUrls = extractedArticles.map(article => article.articleUrl);
        const existingUrls = await this.newsArticleRepository.findByUrls(articleUrls);
        this.logger.debug(`Found ${existingUrls.size} existing articles out of ${articleUrls.length}`);

        let newArticlesCount = 0;
        let duplicateCount = 0;

        for (const articleData of extractedArticles) {
          if (existingUrls.has(articleData.articleUrl)) {
            this.logger.debug(`Article already exists: ${articleData.articleUrl}`);
            duplicateCount++;
            continue;
          }

          const newArticle = new NewsArticle(
            randomUUID(),
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
          this.logger.debug(`Saved new article: ${newArticle.id} - "${newArticle.title.substring(0, 50)}..."`);
          newArticlesCount++;
        }

        await this.pullSourceRepository.updateLastPolledAt(source.id, now);
        this.logger.debug(`Updated last_polled_at for source: ${source.id}`);
        success.push(source.id);
        this.logger.log(`Source ${source.id} completed: ${newArticlesCount} new articles, ${duplicateCount} duplicates`);
      } catch (error) {
        const errorObj = error as Error;
        this.logger.error(`Error processing source ${source.id}: ${errorObj.message}`);
        this.logger.debug(`Stack trace: ${errorObj.stack}`);
        errors.push({ sourceId: source.id, error: errorObj });
        await this.pullSourceRepository.updateLastPolledAt(source.id, now);
      }
    }

    this.logger.log(`ProcessScheduledPull completed: ${success.length} sources processed, ${errors.length} errors`);
    return { success, errors };
  }
}
