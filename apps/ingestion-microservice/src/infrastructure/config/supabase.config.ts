import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getEnvironmentConfig, resetEnvironmentConfigForTest } from './environment.config';

export interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
  newsArticlesTable: string;
  pullSourcesTable: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  const config = getEnvironmentConfig();

  return {
    url: config.supabaseUrl,
    serviceRoleKey: config.supabaseServiceRoleKey,
    newsArticlesTable: config.supabaseNewsArticlesTable,
    pullSourcesTable: config.supabasePullSourcesTable,
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
  resetEnvironmentConfigForTest();
}
