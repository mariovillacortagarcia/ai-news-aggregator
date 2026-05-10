import {
  HtmlPullSource,
  PullSource,
  RssPullSource,
} from '../entities/pull-source';
import { ArgumentError } from '../errors/argument.error';

describe('PullSource', () => {
  it('should create a PullSource instance with correct properties', () => {
    const id = 'source-123';
    const lastPolledAt = new Date('2024-01-01T00:00:00Z');
    const isActive = true;

    const pullSource = new (class extends PullSource {})(
      id,
      lastPolledAt,
      isActive,
    );

    expect(pullSource.id).toBe(id);
    expect(pullSource.lastPolledAt).toBe(lastPolledAt);
    expect(pullSource.isActive).toBe(isActive);
  });

  it('should throw an error if id is not provided', () => {
    expect(() => {
      new (class extends PullSource {})('', null, true);
    }).toThrow(new ArgumentError('PullSource id cannot be empty'));
  });

  it('should allow lastPolledAt to be null', () => {
    const id = 'source-123';
    const isActive = true;

    const pullSource = new (class extends PullSource {})(id, null, isActive);

    expect(pullSource.lastPolledAt).toBeNull();
  });

  it('should allow isActive to be false', () => {
    const id = 'source-123';
    const lastPolledAt = new Date('2024-01-01T00:00:00Z');
    const isActive = false;

    const pullSource = new (class extends PullSource {})(
      id,
      lastPolledAt,
      isActive,
    );

    expect(pullSource.isActive).toBe(isActive);
  });
});

describe('RssPullSource', () => {
  it('should create an RssPullSource instance with correct properties', () => {
    const id = 'rss-source-123';
    const lastPolledAt = new Date('2024-01-01T00:00:00Z');
    const isActive = true;
    const sourceUrl = 'https://example.com/rss';

    const rssPullSource = new RssPullSource(
      id,
      lastPolledAt,
      isActive,
      sourceUrl,
    );

    expect(rssPullSource.id).toBe(id);
    expect(rssPullSource.lastPolledAt).toBe(lastPolledAt);
    expect(rssPullSource.isActive).toBe(isActive);
    expect(rssPullSource.sourceUrl).toBe(sourceUrl);
  });

  it('should throw an error if sourceUrl is not provided', () => {
    expect(() => {
      new RssPullSource('rss-source-123', new Date(), true, '');
    }).toThrow(new ArgumentError('RssPullSource sourceUrl cannot be empty'));
  });
});

describe('HtmlPullSource', () => {
  it('should create an HtmlPullSource instance with correct properties', () => {
    const id = 'html-source-123';
    const lastPolledAt = new Date('2024-01-01T00:00:00Z');
    const isActive = true;
    const sourceUrl = 'https://example.com/html';
    const classIdentifiers = {
      title: 'title-class',
      content: 'content-class',
      mainImageUrl: 'image-class',
      originalAuthor: 'author-class',
      createdAt: 'created-at-class',
    };

    const htmlPullSource = new HtmlPullSource(
      id,
      lastPolledAt,
      isActive,
      sourceUrl,
      classIdentifiers,
    );

    expect(htmlPullSource.id).toBe(id);
    expect(htmlPullSource.lastPolledAt).toBe(lastPolledAt);
    expect(htmlPullSource.isActive).toBe(isActive);
    expect(htmlPullSource.sourceUrl).toBe(sourceUrl);
    expect(htmlPullSource.classIdentifiers).toEqual(classIdentifiers);
  });

  it('should throw an error if sourceUrl is not provided', () => {
    expect(() => {
      new HtmlPullSource('html-source-123', new Date(), true, '', {
        title: 'title-class',
        content: 'content-class',
        mainImageUrl: 'image-class',
        originalAuthor: 'author-class',
        createdAt: 'created-at-class',
      });
    }).toThrow(new ArgumentError('HtmlPullSource sourceUrl cannot be empty'));
  });

  it('should throw an error if classIdentifiers are not provided', () => {
    expect(() => {
      new HtmlPullSource(
        'html-source-123',
        new Date(),
        true,
        'https://example.com/html',
        null as any,
      );
    }).toThrow(
      new ArgumentError('HtmlPullSource classIdentifiers cannot be null'),
    );
  });
});
