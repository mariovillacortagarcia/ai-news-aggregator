import { NewsArticle, ArticleStatus } from '../../entities/news-article';
import { NewsArticleRepositoryPort } from '../../ports/news-article-repository.port';

export class InMemoryNewsArticleRepository implements NewsArticleRepositoryPort {
  private articles: Map<string, NewsArticle> = new Map();
  private urlIndex: Map<string, string> = new Map();

  async findById(id: string): Promise<NewsArticle | null> {
    return this.articles.get(id) || null;
  }

  async findByUrl(url: string): Promise<NewsArticle | null> {
    for (const article of this.articles.values()) {
      if (article.articleUrl === url) {
        return article;
      }
    }
    return null;
  }

  async save(article: NewsArticle): Promise<NewsArticle> {
    this.articles.set(article.id, article);
    this.urlIndex.set(article.articleUrl, article.id);
    return article;
  }

  async update(article: NewsArticle): Promise<NewsArticle> {
    if (!this.articles.has(article.id)) {
      throw new Error('Article not found');
    }
    this.articles.set(article.id, article);
    return article;
  }

  async find(filter?: { notified?: boolean; status?: string[] }): Promise<NewsArticle[]> {
    const results: NewsArticle[] = [];
    for (const article of this.articles.values()) {
      if (filter?.notified !== undefined && article.notified !== filter.notified) {
        continue;
      }
      if (filter?.status !== undefined && !filter.status.includes(article.status)) {
        continue;
      }
      results.push(article);
    }
    return results;
  }

  clear(): void {
    this.articles.clear();
    this.urlIndex.clear();
  }
}
