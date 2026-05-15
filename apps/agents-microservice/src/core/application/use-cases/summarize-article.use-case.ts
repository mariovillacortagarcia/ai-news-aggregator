import { Injectable } from '@nestjs/common';
import { NewsArticle } from '@ai-news-aggregator/news-article';
import { SummaryGeneratorPort } from '../../domain/ports/summary-generator.port';

@Injectable()
export class SummarizeArticleUseCase {
  constructor(
    private readonly summaryGenerator: SummaryGeneratorPort,
  ) {}

  async execute(article: NewsArticle): Promise<NewsArticle> {
    const generatedSummary = await this.summaryGenerator.generateSummary(article);

    article.summarize(generatedSummary);

    return article;
  }
}
