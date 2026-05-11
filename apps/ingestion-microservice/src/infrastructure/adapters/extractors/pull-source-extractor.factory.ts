import { Injectable, Logger } from '@nestjs/common';
import { PullSourceExtractorPort, ExtractedArticleData } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/pull-source-extractor.port';
import { PullSource, RssPullSource, HtmlPullSource } from '@ai-news-aggregator/ingestion-microservice/core/domain/entities/pull-source';
import { RssPullSourceExtractor } from './rss-pull-source.extractor';
import { HtmlPullSourceExtractor } from './html-pull-source.extractor';

@Injectable()
export class PullSourceExtractorFactory {
  private readonly logger = new Logger(PullSourceExtractorFactory.name);

  constructor(
    private readonly rssExtractor: RssPullSourceExtractor,
    private readonly htmlExtractor: HtmlPullSourceExtractor,
  ) {}

  getExtractor(source: PullSource): PullSourceExtractorPort {
    if (source instanceof RssPullSource) {
      this.logger.debug(`Using RSS extractor for source: ${source.id}`);
      return this.rssExtractor;
    }
    
    if (source instanceof HtmlPullSource) {
      this.logger.debug(`Using HTML extractor for source: ${source.id}`);
      return this.htmlExtractor;
    }

    throw new Error(`No extractor available for source type: ${source.constructor.name}`);
  }

  async extract(source: PullSource): Promise<ExtractedArticleData[]> {
    const extractor = this.getExtractor(source);
    return extractor.extract(source);
  }
}
