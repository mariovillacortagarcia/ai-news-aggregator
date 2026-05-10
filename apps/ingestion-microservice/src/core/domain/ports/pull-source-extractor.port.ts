export interface ExtractedArticleData {
  title: string;
  content: string;
  mainImageUrl: string;
  originalAuthor: string;
  articleUrl: string;
  createdAt: Date;
}

export interface PullSourceExtractorPort {
  extract(sourceUrl: string): Promise<ExtractedArticleData[]>;
}
