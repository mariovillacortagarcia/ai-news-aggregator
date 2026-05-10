import { PullSource } from '../entities/pull-source';

export interface PullSourceRepositoryPort {
  findDueSources(now: Date): Promise<PullSource[]>;
  updateLastPolledAt(id: string, timestamp: Date): Promise<void>;
  findById(id: string): Promise<PullSource | null>;
}
