import { PullSourceExtractorPort, ExtractedArticleData } from '../../ports/pull-source-extractor.port';
import { PullSource } from '../../entities/pull-source';

export class InMemoryPullSourceExtractor implements PullSourceExtractorPort {
  private articlesToReturn: ExtractedArticleData[] = [];
  private shouldThrowError: boolean = false;
  private errorMessage: string = '';

  setArticlesToReturn(articles: ExtractedArticleData[]) {
    this.articlesToReturn = articles;
  }

  setError(message: string) {
    this.shouldThrowError = true;
    this.errorMessage = message;
  }

  clearError() {
    this.shouldThrowError = false;
    this.errorMessage = '';
  }

  clear() {
    this.articlesToReturn = [];
    this.shouldThrowError = false;
    this.errorMessage = '';
  }

  async extract(source: PullSource, lastPolledAt?: Date): Promise<ExtractedArticleData[]> {
    if (this.shouldThrowError) {
      throw new Error(this.errorMessage);
    }
    
    if (lastPolledAt) {
      return this.articlesToReturn.filter(article => article.createdAt > lastPolledAt);
    }
    
    return this.articlesToReturn;
  }
}
