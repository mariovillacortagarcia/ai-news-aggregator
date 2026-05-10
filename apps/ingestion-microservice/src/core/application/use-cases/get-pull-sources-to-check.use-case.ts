import { PullSource } from '../../domain/entities/pull-source';
import { PullSourceRepositoryPort } from '../../domain/ports/pull-source-repository.port';

export class GetPullSourcesToCheckUseCase {
  constructor(private readonly repository: PullSourceRepositoryPort) {}

  async execute(now: Date): Promise<PullSource[]> {
    return this.repository.findDueSources(now);
  }
}
