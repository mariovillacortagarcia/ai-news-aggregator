import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './supabase.config';

@Injectable()
export class SupabaseClientProvider {
  private readonly client: SupabaseClient;
  private readonly logger = new Logger(SupabaseClientProvider.name);

  constructor() {
    const config = getSupabaseConfig();
    
    if (!config.url || !config.serviceRoleKey) {
      this.logger.warn('Supabase not fully configured - using mock client');
      this.client = null as any;
    } else {
      this.client = createClient(config.url, config.serviceRoleKey);
      this.logger.log('Supabase client initialized');
    }
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  getNewsArticlesTable(): string {
    return process.env.SUPABASE_NEWS_ARTICLES_TABLE || 'news_articles';
  }

  getPullSourcesTable(): string {
    return process.env.SUPABASE_PULL_SOURCES_TABLE || 'pull_sources';
  }
}
