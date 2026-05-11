import { HtmlPullSourceExtractor } from './html-pull-source.extractor';
import { HtmlPullSource } from '@ai-news-aggregator/ingestion-microservice/core/domain/entities/pull-source';

describe('HtmlPullSourceExtractor', () => {
  let extractor: HtmlPullSourceExtractor;
  let mockSource: HtmlPullSource;
  const originalFetch = global.fetch;

  beforeEach(() => {
    extractor = new HtmlPullSourceExtractor();
    mockSource = new HtmlPullSource(
      'test-html-source',
      null,
      true,
      'https://example.com/news',
      {
        title: '.article-title',
        content: '.article-content',
        mainImageUrl: '.article-image',
        originalAuthor: '.article-author',
        createdAt: '.article-date',
      }
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should throw an error when extracting a non-HTML source', async () => {
    const rssSource = {
      id: 'rss-source',
      lastPolledAt: null,
      isActive: true,
      sourceUrl: 'https://example.com/rss',
      constructor: { name: 'RssPullSource' }
    } as any;

    await expect(extractor.extract(rssSource)).rejects.toThrow(
      'HtmlPullSourceExtractor can only extract HtmlPullSource, got RssPullSource'
    );
  });

  it('should fetch HTML content from the source URL', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => '<html><body><div class="article">Article</div></body></html>',
    } as Response);

    await extractor.extract(mockSource, undefined);

    expect(global.fetch).toHaveBeenCalledWith('https://example.com/news', {
      method: 'GET',
      headers: {
        'User-Agent': 'AI News Aggregator/1.0',
      },
    });
  });

  it('should throw an error when HTTP request fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    await expect(extractor.extract(mockSource, undefined)).rejects.toThrow(
      'HTTP error: 404'
    );
  });

  it('should log warning about HTML extraction not being implemented', async () => {
    const warnSpy = jest.spyOn(extractor['logger'], 'warn');
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => '<html></html>',
    } as Response);

    await extractor.extract(mockSource, undefined);

    expect(warnSpy).toHaveBeenCalledWith(
      'HTML extraction not yet implemented - requires DOM parser'
    );
    
    warnSpy.mockRestore();
  });

  it('should return empty array when HTML extraction is not implemented', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => '<html><body>Content</body></html>',
    } as Response);

    const articles = await extractor.extract(mockSource, undefined);

    expect(articles).toHaveLength(0);
  });

  it('should pass lastPolledAt to parseHtml method', async () => {
    const lastPolledAt = new Date('2024-01-01T00:00:00Z');
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => '<html></html>',
    } as Response);

    const parseHtmlSpy = jest.spyOn(extractor as any, 'parseHtml');

    await extractor.extract(mockSource, lastPolledAt);

    expect(parseHtmlSpy).toHaveBeenCalledWith(
      expect.any(String),
      mockSource.classIdentifiers,
      lastPolledAt
    );
    
    parseHtmlSpy.mockRestore();
  });

  it('should use source.lastPolledAt when lastPolledAt parameter is not provided', async () => {
    const sourceWithLastPolled = new HtmlPullSource(
      'test-source',
      new Date('2024-01-01T12:00:00Z'),
      true,
      'https://example.com/news',
      mockSource.classIdentifiers
    );

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => '<html></html>',
    } as Response);

    const parseHtmlSpy = jest.spyOn(extractor as any, 'parseHtml');

    await extractor.extract(sourceWithLastPolled, undefined);

    expect(parseHtmlSpy).toHaveBeenCalledWith(
      expect.any(String),
      sourceWithLastPolled.classIdentifiers,
      new Date('2024-01-01T12:00:00Z')
    );
    
    parseHtmlSpy.mockRestore();
  });

  it('should handle network errors gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    await expect(extractor.extract(mockSource, undefined)).rejects.toThrow(
      'Network error'
    );
  });

  it('should log debug message with source details before fetching', async () => {
    const debugSpy = jest.spyOn(extractor['logger'], 'debug');
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => '<html></html>',
    } as Response);

    await extractor.extract(mockSource, undefined);

    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('Extracting HTML from: https://example.com/news')
    );
    
    debugSpy.mockRestore();
  });

  it('should log error message when extraction fails', async () => {
    const errorSpy = jest.spyOn(extractor['logger'], 'error');
    
    global.fetch = jest.fn().mockRejectedValue(new Error('Connection failed'));

    await expect(extractor.extract(mockSource, undefined)).rejects.toThrow(
      'Connection failed'
    );

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to extract HTML: Connection failed'
    );
    
    errorSpy.mockRestore();
  });
});
