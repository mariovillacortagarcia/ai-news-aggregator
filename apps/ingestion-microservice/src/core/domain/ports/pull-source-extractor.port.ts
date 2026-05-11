import { PullSource } from '../entities/pull-source';

export interface ExtractedArticleData {
  title: string;
  content: string;
  mainImageUrl: string;
  originalAuthor: string;
  articleUrl: string;
  createdAt: Date;
}

export abstract class PullSourceExtractorPort {
  abstract extract(source: PullSource, lastPolledAt?: Date): Promise<ExtractedArticleData[]>;
}
