import { RssPullSourceExtractor } from './rss-pull-source.extractor';
import { RssPullSource } from '@ai-news-aggregator/ingestion-microservice/core/domain/entities/pull-source';

describe('RssPullSourceExtractor', () => {
  let extractor: RssPullSourceExtractor;
  let mockSource: RssPullSource;
  const originalFetch = global.fetch;

  beforeEach(() => {
    extractor = new RssPullSourceExtractor();
    mockSource = new RssPullSource('test-source', null, true, 'https://example.com/rss');
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should extract titles wrapped in CDATA blocks', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => `
        <rss>
          <channel>
            <item>
              <title><![CDATA[Quantum Computing Breakthrough]]></title>
              <link><![CDATA[https://example.com/quantum]]></link>
              <description><![CDATA[Researchers announced a new milestone.]]></description>
              <dc:creator><![CDATA[Science Desk]]></dc:creator>
              <media:content url="https://example.com/quantum.jpg" />
              <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>
      `,
    } as Response);

    const articles = await extractor.extract(mockSource, undefined);

    expect(articles).toHaveLength(1);
    expect(articles[0]).toMatchObject({
      title: 'Quantum Computing Breakthrough',
      articleUrl: 'https://example.com/quantum',
      content: 'Researchers announced a new milestone.',
      originalAuthor: 'Science Desk',
    });
  });
});
