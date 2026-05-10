import { Injectable, Logger } from '@nestjs/common';
import { PullSourceRepositoryPort } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/pull-source-repository.port';
import { PullSource, RssPullSource, HtmlPullSource } from '@ai-news-aggregator/ingestion-microservice/core/domain/entities/pull-source';
import { SupabaseClientProvider } from '../../config/supabase-client.provider';

interface PullSourceDbRecord {
  id: string;
  type: 'rss' | 'html';
  source_url: string;
  class_identifiers: Record<string, string> | null;
  last_polled_at: string | null;
  is_active: boolean;
  created_at: string;
}

@Injectable()
export class SupabasePullSourceRepository implements PullSourceRepositoryPort {
  private readonly logger = new Logger(SupabasePullSourceRepository.name);

  constructor(private readonly supabaseClient: SupabaseClientProvider) {}

  async findDueSources(now: Date): Promise<PullSource[]> {
    const client = this.supabaseClient.getClient();
    const table = this.supabaseClient.getPullSourcesTable();

    const { data, error } = await client
      .from(table)
      .select('*')
      .eq('is_active', true)
      .or(`last_polled_at.is.null,last_polled_at.lt.${now.toISOString()}`);

    if (error) {
      this.logger.error(`Failed to find due sources: ${error.message}`);
      throw error;
    }

    return (data as PullSourceDbRecord[]).map(record => this.mapToDomain(record));
  }

  async updateLastPolledAt(id: string, timestamp: Date): Promise<void> {
    const client = this.supabaseClient.getClient();
    const table = this.supabaseClient.getPullSourcesTable();

    const { error } = await client
      .from(table)
      .update({ last_polled_at: timestamp.toISOString() })
      .eq('id', id);

    if (error) {
      this.logger.error(`Failed to update last_polled_at for source ${id}: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<PullSource | null> {
    const client = this.supabaseClient.getClient();
    const table = this.supabaseClient.getPullSourcesTable();

    const { data, error } = await client
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      this.logger.debug(`Pull source ${id} not found`);
      return null;
    }

    return this.mapToDomain(data);
  }

  private mapToDomain(record: PullSourceDbRecord): PullSource {
    const lastPolledAt = record.last_polled_at ? new Date(record.last_polled_at) : null;

    if (record.type === 'rss') {
      return new RssPullSource(
        record.id,
        lastPolledAt,
        record.is_active,
        record.source_url,
      );
    } else {
      return new HtmlPullSource(
        record.id,
        lastPolledAt,
        record.is_active,
        record.source_url,
        record.class_identifiers as any,
      );
    }
  }
}
