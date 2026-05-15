import { NewsArticle } from '@ai-news-aggregator/news-article';

export abstract class SummaryGeneratorPort {
  abstract generateSummary(article: NewsArticle): Promise<string>;
}
