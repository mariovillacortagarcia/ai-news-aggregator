import { NewsArticle } from '@ai-news-aggregator/news-article';
import { SummaryGeneratorPort } from '../../ports/summary-generator.port';

export class InMemorySummaryGenerator implements SummaryGeneratorPort {
  private generatedSummary = 'Generated summary';
  private shouldThrowError = false;
  private errorMessage = '';

  setGeneratedSummary(summary: string): void {
    this.generatedSummary = summary;
  }

  setError(message: string): void {
    this.shouldThrowError = true;
    this.errorMessage = message;
  }

  clearError(): void {
    this.shouldThrowError = false;
    this.errorMessage = '';
  }

  async generateSummary(article: NewsArticle): Promise<string> {
    if (this.shouldThrowError) {
      throw new Error(this.errorMessage);
    }

    return this.generatedSummary.replace('{id}', article.id);
  }
}
