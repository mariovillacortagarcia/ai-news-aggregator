import { PullSource } from '../entities/pull-source';

export abstract class PullSourceRepositoryPort {
  abstract findDueSources(now: Date): Promise<PullSource[]>;
  abstract updateLastPolledAt(id: string, timestamp: Date): Promise<void>;
  abstract findById(id: string): Promise<PullSource | null>;
}
