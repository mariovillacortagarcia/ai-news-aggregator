export interface ExtractedArticleData {
  title: string;
  content: string;
  mainImageUrl: string;
  originalAuthor: string;
  articleUrl: string;
  createdAt: Date;
}

export abstract class PullSourceExtractorPort {
  abstract extract(sourceUrl: string, html?: string, classIdentifiers?: Record<string, string>): Promise<ExtractedArticleData[]>;
}
