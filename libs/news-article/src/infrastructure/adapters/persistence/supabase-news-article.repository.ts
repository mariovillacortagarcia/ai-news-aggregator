import { Injectable, Logger } from '@nestjs/common';
import { NewsArticleRepositoryPort } from '../../../core/domain/ports/news-article-repository.port';
import { NewsArticle, ArticleStatus } from '../../../core/domain/entities/news-article';
import { NewsArticleSupabaseClientProvider } from '../../config/supabase-client.provider';

interface NewsArticleDbRecord {
  id: string;
  article_url: string;
  title: string;
  content: string;
  author: string;
  main_image_url: string | null;
  pull_source_id: string;
  status: string;
  notified: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class SupabaseNewsArticleRepository implements NewsArticleRepositoryPort {
  private readonly logger = new Logger(SupabaseNewsArticleRepository.name);

  constructor(private readonly supabaseClient: NewsArticleSupabaseClientProvider) {}

  async findById(id: string): Promise<NewsArticle | null> {
    const client = this.supabaseClient.getClient();
    const table = this.supabaseClient.getNewsArticlesTable();

    const { data, error } = await client
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      this.logger.debug(`Article ${id} not found`);
      return null;
    }

    return this.mapToDomain(data);
  }

  async findByUrl(url: string): Promise<NewsArticle | null> {
    const client = this.supabaseClient.getClient();
    const table = this.supabaseClient.getNewsArticlesTable();

    const { data, error } = await client
      .from(table)
      .select('*')
      .eq('article_url', url)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapToDomain(data);
  }

  async findByUrls(urls: string[]): Promise<Set<string>> {
    if (urls.length === 0) {
      return new Set<string>();
    }

    this.logger.debug(`Checking ${urls.length} URLs for duplicates`);
    
    const client = this.supabaseClient.getClient();
    const table = this.supabaseClient.getNewsArticlesTable();

    const { data, error } = await client
      .from(table)
      .select('article_url')
      .in('article_url', urls);

    if (error) {
      this.logger.error(`Failed to check duplicate URLs: ${error.message}`);
      throw error;
    }

    const existingUrls = new Set<string>(data?.map(record => record.article_url) || []);
    this.logger.debug(`Found ${existingUrls.size} existing URLs`);
    
    return existingUrls;
  }

  async save(article: NewsArticle): Promise<NewsArticle> {
    this.logger.debug(`Saving article: ${article.id} - "${article.title.substring(0, 50)}..."`);
    
    const client = this.supabaseClient.getClient();
    const table = this.supabaseClient.getNewsArticlesTable();

    const record = this.mapToDb(article);

    const { data, error } = await client
      .from(table)
      .insert(record)
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to save article: ${error.message}`);
      throw error;
    }

    this.logger.debug(`Article saved successfully: ${article.id}`);
    return this.mapToDomain(data);
  }

  async update(article: NewsArticle): Promise<NewsArticle> {
    this.logger.debug(`Updating article: ${article.id} - status: ${article.status}, notified: ${article.notified}`);
    
    const client = this.supabaseClient.getClient();
    const table = this.supabaseClient.getNewsArticlesTable();

    const record = this.mapToDb(article);

    const { data, error } = await client
      .from(table)
      .update(record)
      .eq('id', article.id)
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to update article ${article.id}: ${error.message}`);
      throw error;
    }

    this.logger.debug(`Article updated successfully: ${article.id}`);
    return this.mapToDomain(data);
  }

  async find(filter?: { notified?: boolean; status?: ArticleStatus[] }): Promise<NewsArticle[]> {
    const client = this.supabaseClient.getClient();
    const table = this.supabaseClient.getNewsArticlesTable();

    let query = client.from(table).select('*');

    if (filter?.notified !== undefined) {
      query = query.eq('notified', filter.notified);
    }

    if (filter?.status !== undefined && filter.status.length > 0) {
      query = query.in('status', filter.status);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error(`Failed to find articles: ${error.message}`);
      throw error;
    }

    return (data as NewsArticleDbRecord[]).map(record => this.mapToDomain(record));
  }

  private mapToDomain(record: NewsArticleDbRecord): NewsArticle {
    return new NewsArticle(
      record.id,
      record.article_url,
      record.title,
      record.content,
      record.author,
      record.main_image_url,
      record.pull_source_id,
      record.status as ArticleStatus,
      record.notified,
      new Date(record.created_at),
      new Date(record.updated_at),
    );
  }

  private mapToDb(article: NewsArticle): NewsArticleDbRecord {
    return {
      id: article.id,
      article_url: article.articleUrl,
      title: article.title,
      content: article.content,
      author: article.author,
      main_image_url: article.mainImageUrl,
      pull_source_id: article.pullSourceId,
      status: article.status,
      notified: article.notified,
      created_at: article.createdAt.toISOString(),
      updated_at: article.updatedAt.toISOString(),
    };
  }
}
