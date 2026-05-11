import { RssPullSource } from "../../domain/entities/pull-source";
import { InMemoryPullSourceRepository } from "../../domain/test/mocks/in-memory-pull-source.repository";
import { GetPullSourcesToCheckUseCase } from "../use-cases/get-pull-sources-to-check.use-case";

describe('GetPullSourcesToCheckUseCase', () => {
  let useCase: GetPullSourcesToCheckUseCase;
  let repository: InMemoryPullSourceRepository;

  beforeEach(() => {
    repository = new InMemoryPullSourceRepository();
    useCase = new GetPullSourcesToCheckUseCase(repository);
  });

  describe('constructor', () => {
    it('should create an instance of GetPullSourcesToCheckUseCase', () => {
      expect(useCase).toBeDefined();
    });
  });

  describe('execute', () => {
    it('should return pull sources that have not been checked since a certain period', async () => {
      const now = new Date('2024-01-01T01:00:00Z');
      
      const dueSource = new RssPullSource(
        'source-1',
        new Date('2024-01-01T00:00:00Z'),
        true,
        'https://example.com/rss'
      );

      const notDueSource = new RssPullSource(
        'source-2',
        now,
        true,
        'https://another-example.com/rss'
      );

      await repository.save(dueSource);
      await repository.save(notDueSource);

      const result = await useCase.execute(now);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('source-1');
    });

    it('should return only active pull sources', async () => {
      const now = new Date('2024-01-01T01:00:00Z');
      
      const activeSource = new RssPullSource(
        'source-1',
        new Date('2024-01-01T00:00:00Z'),
        true,
        'https://example.com/rss'
      );

      const inactiveSource = new RssPullSource(
        'source-2',
        new Date('2024-01-01T00:00:00Z'),
        false,
        'https://another-example.com/rss'
      );

      await repository.save(activeSource);
      await repository.save(inactiveSource);

      const result = await useCase.execute(now);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('source-1');
    });

    it('should return all active sources that have never been checked', async () => {
      const now = new Date('2024-01-01T01:00:00Z');
      
      const neverCheckedSource = new RssPullSource(
        'source-1',
        null,
        true,
        'https://example.com/rss'
      );

      await repository.save(neverCheckedSource);

      const result = await useCase.execute(now);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('source-1');
    });

    it('should return an empty array when no sources are due', async () => {
      const now = new Date('2024-01-01T00:05:00Z');
      
      const source = new RssPullSource(
        'source-1',
        now,
        true,
        'https://example.com/rss'
      );

      await repository.save(source);

      const result = await useCase.execute(now);

      expect(result).toEqual([]);
    });
  });
});
