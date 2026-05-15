import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface NewsArticleSupabaseConfig {
  url: string;
  serviceRoleKey: string;
  newsArticlesTable: string;
}

@Injectable()
export class NewsArticleSupabaseClientProvider {
  private readonly client: SupabaseClient;
  private readonly newsArticlesTable: string;
  private readonly logger = new Logger(NewsArticleSupabaseClientProvider.name);

  constructor() {
    const config = this.loadConfigFromEnv();
    
    if (!config.url || !config.serviceRoleKey) {
      this.logger.warn('Supabase not fully configured - using mock client');
      this.client = null as any;
      this.newsArticlesTable = 'news_articles';
    } else {
      this.client = createClient(config.url, config.serviceRoleKey);
      this.newsArticlesTable = config.newsArticlesTable || 'news_articles';
      this.logger.log('Supabase client initialized');
    }
  }

  private loadConfigFromEnv(): NewsArticleSupabaseConfig {
    return {
      url: process.env['SUPABASE_URL'] || '',
      serviceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] || '',
      newsArticlesTable: process.env['SUPABASE_NEWS_ARTICLES_TABLE'] || 'news_articles',
    };
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  getNewsArticlesTable(): string {
    return this.newsArticlesTable;
  }
}
