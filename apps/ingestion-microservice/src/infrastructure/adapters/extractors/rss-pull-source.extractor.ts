import { Injectable, Logger } from '@nestjs/common';
import { PullSourceExtractorPort, ExtractedArticleData } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/pull-source-extractor.port';
import { PullSource, RssPullSource } from '@ai-news-aggregator/ingestion-microservice/core/domain/entities/pull-source';

@Injectable()
export class RssPullSourceExtractor implements PullSourceExtractorPort {
  private readonly logger = new Logger(RssPullSourceExtractor.name);

  async extract(source: PullSource, lastPolledAt?: Date): Promise<ExtractedArticleData[]> {
    if (!(source instanceof RssPullSource)) {
      throw new Error(`RssPullSourceExtractor can only extract RssPullSource, got ${source.constructor.name}`);
    }

    const sourceUrl = source.sourceUrl;
    const lastPolledDate = lastPolledAt ?? source.lastPolledAt;
    
    this.logger.debug(`Extracting RSS feed from: ${sourceUrl} (source: ${source.id}, lastPolledAt: ${lastPolledDate?.toISOString() ?? 'null'})`);
    
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

      const xmlText = await response.text();
      this.logger.debug(`Received RSS feed, parsing...`);
      
      const articles = this.parseRssFeed(xmlText, lastPolledDate);
      this.logger.log(`Extracted ${articles.length} articles from RSS feed (source: ${source.id})`);
      
      return articles;
    } catch (error) {
      const errorObj = error as Error;
      this.logger.error(`Failed to extract RSS feed: ${errorObj.message}`);
      throw error;
    }
  }

  private parseRssFeed(xmlText: string, lastPolledAt?: Date): ExtractedArticleData[] {
    const articles: ExtractedArticleData[] = [];
    const lastPolledTimestamp = lastPolledAt?.getTime() ?? 0;
    
    this.logger.debug(`Filtering articles newer than: ${lastPolledAt?.toISOString() ?? 'beginning of time'}`);
    
    const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/g);
    
    if (!itemMatches) {
      this.logger.warn('No items found in RSS feed');
      return articles;
    }

    let filteredCount = 0;

    for (const item of itemMatches) {
      try {
        const title = this.extractTagContent(item, 'title');
        const link = this.extractTagContent(item, 'link');
        const description = this.extractTagContent(item, 'description');
        const pubDate = this.extractTagContent(item, 'pubDate');
        const author = this.extractTagContent(item, 'dc:creator') || this.extractTagContent(item, 'author');
        const imageUrl = this.extractImageUrl(item);

        const cleanTitle = this.cleanText(title);
        const cleanLink = this.cleanText(link);
        const cleanDescription = this.cleanText(description);
        const cleanAuthor = this.cleanText(author);
        const cleanImageUrl = this.cleanText(imageUrl);

        if (!cleanTitle || !cleanLink) {
          this.logger.debug('Skipping item - missing title or link');
          continue;
        }

        const articleDate = pubDate ? new Date(pubDate) : new Date();
        
        if (lastPolledAt && articleDate.getTime() <= lastPolledTimestamp) {
          this.logger.debug(`Skipping article "${cleanTitle}" - published at ${articleDate.toISOString()} (before lastPolledAt: ${lastPolledAt.toISOString()})`);
          filteredCount++;
          continue;
        }

        articles.push({
          articleUrl: cleanLink,
          title: cleanTitle,
          content: cleanDescription,
          originalAuthor: cleanAuthor || 'Unknown',
          mainImageUrl: cleanImageUrl,
          createdAt: articleDate,
        });
      } catch (error) {
        this.logger.warn(`Failed to parse RSS item: ${(error as Error).message}`);
      }
    }

    if (filteredCount > 0) {
      this.logger.debug(`Filtered out ${filteredCount} articles older than lastPolledAt`);
    }

    return articles;
  }

  private extractTagContent(xml: string, tagName: string): string {
    const regex = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1] : '';
  }

  private extractImageUrl(xml: string): string {
    const mediaContent = xml.match(/<media:content[^>]*url="([^"]*)"[^>]*>/i);
    if (mediaContent && mediaContent[1]) {
      return mediaContent[1];
    }

    const enclosure = xml.match(/<enclosure[^>]*url="([^"]*)"[^>]*>/i);
    if (enclosure && enclosure[1]) {
      return enclosure[1];
    }

    const image = xml.match(/<image>([^<]*)<\/image>/i);
    if (image && image[1]) {
      return image[1];
    }

    return '';
  }

  private cleanText(text: string): string {
    return text
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
}
