import { Injectable, Logger } from '@nestjs/common';
import { PullSourceExtractorPort, ExtractedArticleData } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/pull-source-extractor.port';
import { PullSource, HtmlPullSource } from '@ai-news-aggregator/ingestion-microservice/core/domain/entities/pull-source';

@Injectable()
export class HtmlPullSourceExtractor implements PullSourceExtractorPort {
  private readonly logger = new Logger(HtmlPullSourceExtractor.name);

  async extract(source: PullSource, lastPolledAt?: Date): Promise<ExtractedArticleData[]> {
    if (!(source instanceof HtmlPullSource)) {
      throw new Error(`HtmlPullSourceExtractor can only extract HtmlPullSource, got ${source.constructor.name}`);
    }

    const sourceUrl = source.sourceUrl;
    const classIdentifiers = source.classIdentifiers;
    const lastPolledDate = lastPolledAt ?? source.lastPolledAt;
    
    this.logger.debug(`Extracting HTML from: ${sourceUrl} (source: ${source.id}, lastPolledAt: ${lastPolledDate?.toISOString() ?? 'null'})`);
    
    try {
      const response = await fetch(sourceUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'AI News Aggregator/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const html = await response.text();
      this.logger.debug(`Received HTML, parsing with selectors...`);
      
      const articles = this.parseHtml(html, classIdentifiers, lastPolledDate);
      this.logger.log(`Extracted ${articles.length} articles from HTML (source: ${source.id})`);
      
      return articles;
    } catch (error) {
      const errorObj = error as Error;
      this.logger.error(`Failed to extract HTML: ${errorObj.message}`);
      throw error;
    }
  }

  private parseHtml(html: string, classIdentifiers: Record<string, string>, lastPolledAt?: Date): ExtractedArticleData[] {
    const articles: ExtractedArticleData[] = [];
    
    this.logger.warn('HTML extraction not yet implemented - requires DOM parser');
    
    return articles;
  }
}
