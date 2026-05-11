import { NewsArticle, ArticleStatus } from '../entities/news-article';

export abstract class NewsArticleRepositoryPort {
  abstract findById(id: string): Promise<NewsArticle | null>;
  abstract findByUrl(url: string): Promise<NewsArticle | null>;
  abstract save(article: NewsArticle): Promise<NewsArticle>;
  abstract update(article: NewsArticle): Promise<NewsArticle>;
  abstract find(filter?: { notified?: boolean; status?: ArticleStatus[] }): Promise<NewsArticle[]>;
}
