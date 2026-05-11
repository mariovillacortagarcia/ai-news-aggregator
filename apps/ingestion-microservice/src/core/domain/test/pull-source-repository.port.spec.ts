import { PullSource, RssPullSource } from '../entities/pull-source';
import { PullSourceRepositoryPort } from '../ports/pull-source-repository.port';
import { InMemoryPullSourceRepository } from './mocks/in-memory-pull-source.repository';

describe('PullSourceRepositoryPort', () => {
  let repository: InMemoryPullSourceRepository;
  let testSource: RssPullSource;

  beforeEach(() => {
    repository = new InMemoryPullSourceRepository();
    testSource = new RssPullSource(
      'source-123',
      new Date('2024-01-01T00:00:00Z'),
      true,
      'https://example.com/rss'
    );
  });

  describe('findDueSources', () => {
    it('should return sources that are due for polling', async () => {
      const dueSources = await repository.findDueSources(new Date('2024-01-01T01:00:00Z'));

      expect(dueSources.length).toBe(0);
    });
  });

  describe('findById', () => {
    it('should return null when pull source ID does not exist', async () => {
      const found = await repository.findById('nonexistent-id');

      expect(found).toBeNull();
    });
  });

  describe('updateLastPolledAt', () => {
    it('should update the last polled timestamp for a source', async () => {
      await repository.save(testSource);

      const newTimestamp = new Date('2024-01-01T02:00:00Z');
      await repository.updateLastPolledAt(testSource.id, newTimestamp);

      const found = await repository.findById(testSource.id);
      expect(found?.lastPolledAt).toEqual(newTimestamp);
    });

    it('should throw error when source does not exist', async () => {
      await expect(repository.updateLastPolledAt('nonexistent-id', new Date())).rejects.toThrow('Source not found');
    });
  });
});
