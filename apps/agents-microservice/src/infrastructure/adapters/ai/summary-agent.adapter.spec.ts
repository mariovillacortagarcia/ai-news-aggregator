import { AIMessage, HumanMessage, SystemMessage } from 'langchain';
import { NewsArticle } from '@ai-news-aggregator/news-article';
import { SummaryAgentAdapter } from './summary-agent.adapter';
import { SummaryChatModelProvider } from './summary-chat-model.provider';

describe('SummaryAgentAdapter', () => {
  const originalEnv = process.env;
  let adapter: SummaryAgentAdapter;
  let summaryChatModelProvider: SummaryChatModelProvider;
  let invoke: jest.Mock;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      OPENAI_API_KEY: 'test-key',
      AGENTS_SUMMARY_MODEL: 'gpt-4o-mini',
      AGENTS_SUMMARY_WRITER_SYSTEM_PROMPT: 'writer system prompt',
      AGENTS_SUMMARY_REVIEWER_SYSTEM_PROMPT: 'reviewer system prompt',
    };
    invoke = jest
      .fn()
      .mockResolvedValueOnce(new AIMessage('Draft summary'))
      .mockResolvedValueOnce(new AIMessage('Reviewed summary'));
    summaryChatModelProvider = {
      getModel: jest.fn().mockResolvedValue({
        invoke,
      }),
    } as unknown as SummaryChatModelProvider;
    adapter = new SummaryAgentAdapter(summaryChatModelProvider);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should invoke the llm workflow with the configured system prompts', async () => {
    const article = new NewsArticle(
      '1',
      'http://example.com/article1',
      'Article 1',
      'Line one.\n\nLine two.   Line three.',
      'Author 1',
      null,
      'pull-1',
    );

    const result = await adapter.generateSummary(article);

    expect(result).toBe('Reviewed summary');
    expect(summaryChatModelProvider.getModel).toHaveBeenCalledTimes(2);
    expect(invoke).toHaveBeenCalledTimes(2);

    const writerMessages = invoke.mock.calls[0][0] as [SystemMessage, HumanMessage];
    const reviewerMessages = invoke.mock.calls[1][0] as [SystemMessage, HumanMessage];

    expect(writerMessages[0].content).toBe('writer system prompt');
    expect(writerMessages[1].content).toContain('Title: Article 1');
    expect(writerMessages[1].content).toContain('Author: Author 1');
    expect(writerMessages[1].content).toContain('Content:\nLine one.\n\nLine two.   Line three.');

    expect(reviewerMessages[0].content).toBe('reviewer system prompt');
    expect(reviewerMessages[1].content).toContain('Title: Article 1');
    expect(reviewerMessages[1].content).toContain('Draft summary:\nDraft summary');
  });

  it('should fail when the writer returns an empty draft', async () => {
    invoke.mockReset();
    invoke.mockResolvedValueOnce(new AIMessage('   '));

    const article = new NewsArticle(
      '1',
      'http://example.com/article1',
      'Article 1',
      'Content',
      'Author 1',
      null,
      'pull-1',
    );

    await expect(adapter.generateSummary(article)).rejects.toThrow(
      'Generated draft summary cannot be empty',
    );
  });

  it('should fail when the reviewer returns an empty summary', async () => {
    invoke.mockReset();
    invoke
      .mockResolvedValueOnce(new AIMessage('Draft summary'))
      .mockResolvedValueOnce(new AIMessage('   '));

    const article = new NewsArticle(
      '1',
      'http://example.com/article1',
      'Article 1',
      'Content',
      'Author 1',
      null,
      'pull-1',
    );

    await expect(adapter.generateSummary(article)).rejects.toThrow(
      'Reviewed summary cannot be empty',
    );
  });
});
