import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
  newsArticlesTable: string;
  pullSourcesTable: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  return {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    newsArticlesTable: process.env.SUPABASE_NEWS_ARTICLES_TABLE || 'news_articles',
    pullSourcesTable: process.env.SUPABASE_PULL_SOURCES_TABLE || 'pull_sources',
  };
}

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const config = getSupabaseConfig();
    if (!config.url || !config.serviceRoleKey) {
      throw new Error('Supabase URL and Service Role Key must be configured');
    }
    supabaseClient = createClient(config.url, config.serviceRoleKey);
  }
  return supabaseClient;
}

export function resetSupabaseClient(): void {
  supabaseClient = null;
}
