import { PullSourceExtractorPort, ExtractedArticleData } from '../../ports/pull-source-extractor.port';

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

  async extract(sourceUrl: string): Promise<ExtractedArticleData[]> {
    if (this.shouldThrowError) {
      throw new Error(this.errorMessage);
    }
    return this.articlesToReturn;
  }
}
