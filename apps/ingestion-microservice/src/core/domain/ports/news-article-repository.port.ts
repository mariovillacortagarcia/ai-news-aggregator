import { NewsArticle, ArticleStatus } from '../entities/news-article';

export interface NewsArticleRepositoryPort {
  findByUrl(url: string): Promise<NewsArticle | null>;
  save(article: NewsArticle): Promise<NewsArticle>;
  update(article: NewsArticle): Promise<NewsArticle>;
  find(filter?: { notified?: boolean; status?: ArticleStatus[] }): Promise<NewsArticle[]>;
}
