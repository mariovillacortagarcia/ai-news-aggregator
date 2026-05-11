import { TelegramNotificationAdapter } from './telegram-notification.adapter';

describe('TelegramNotificationAdapter', () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      TELEGRAM_BOT_TOKEN: 'test-token',
      TELEGRAM_ADMIN_CHAT_ID: 'test-chat',
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('should escape dynamic article fields before sending formatted Telegram messages', async () => {
    const adapter = new TelegramNotificationAdapter();

    await adapter.sendBatchNotification([
      {
        articleId: 'article-1',
        title: 'Breaking *news* with _markdown_ & <html>',
        articleUrl: 'https://example.com/a?x=1&y=<bad>',
        mainImageUrl: '',
        originalAuthor: 'A_B & <Author>',
      },
    ]);

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);

    expect(body.parse_mode).toBe('HTML');
    expect(body.text).toContain('Breaking *news* with _markdown_ &amp; &lt;html&gt;');
    expect(body.text).toContain('A_B &amp; &lt;Author&gt;');
    expect(body.text).toContain('https://example.com/a?x=1&amp;y=&lt;bad&gt;');
  });

  it('should split large batches into multiple Telegram messages', async () => {
    const adapter = new TelegramNotificationAdapter();

    await adapter.sendBatchNotification(
      Array.from({ length: 35 }, (_, index) => ({
        articleId: `article-${index}`,
        title: `Article ${index} ${'x'.repeat(180)}`,
        articleUrl: `https://example.com/${index}/${'y'.repeat(160)}`,
        mainImageUrl: '',
        originalAuthor: `Author ${index}`,
      })),
    );

    expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(1);

    for (const call of (global.fetch as jest.Mock).mock.calls) {
      const body = JSON.parse(call[1].body);
      expect(body.text.length).toBeLessThanOrEqual(3900);
    }
  });
});
