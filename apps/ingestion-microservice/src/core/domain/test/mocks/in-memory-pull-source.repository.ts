import { PullSource, RssPullSource, HtmlPullSource } from '../../entities/pull-source';
import { PullSourceRepositoryPort } from '../../ports/pull-source-repository.port';

export class InMemoryPullSourceRepository implements PullSourceRepositoryPort {
  private sources: Map<string, PullSource> = new Map();

  async save(source: PullSource): Promise<PullSource> {
    this.sources.set(source.id, source);
    return source;
  }

  async findById(id: string): Promise<PullSource | null> {
    return this.sources.get(id) || null;
  }

  async findDueSources(now: Date): Promise<PullSource[]> {
    const dueSources: PullSource[] = [];
    
    for (const source of this.sources.values()) {
      if (!source.isActive) {
        continue;
      }
      
      if (source.lastPolledAt === null) {
        dueSources.push(source);
        continue;
      }
      
      const millisecondsSinceLastPoll = now.getTime() - source.lastPolledAt.getTime();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (millisecondsSinceLastPoll >= fiveMinutes) {
        dueSources.push(source);
      }
    }
    
    return dueSources;
  }

  async updateLastPolledAt(id: string, timestamp: Date): Promise<void> {
    const source = this.sources.get(id);
    if (!source) {
      throw new Error('Source not found');
    }
    
    if (source instanceof RssPullSource) {
      const updated = new RssPullSource(
        source.id,
        timestamp,
        source.isActive,
        source.sourceUrl
      );
      this.sources.set(id, updated);
    } else if (source instanceof HtmlPullSource) {
      const updated = new HtmlPullSource(
        source.id,
        timestamp,
        source.isActive,
        source.sourceUrl,
        source.classIdentifiers
      );
      this.sources.set(id, updated);
    }
  }

  clear(): void {
    this.sources.clear();
  }
}
