import { getLlmConfig } from './llm.config';

describe('agents llm config validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {};
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should load llm configuration from environment', () => {
    process.env = {
      OPENAI_API_KEY: 'test-key',
      AGENTS_SUMMARY_MODEL: 'gpt-4o-mini',
      AGENTS_SUMMARY_WRITER_SYSTEM_PROMPT: 'writer prompt',
      AGENTS_SUMMARY_REVIEWER_SYSTEM_PROMPT: 'reviewer prompt',
    };

    const config = getLlmConfig();

    expect(config).toEqual({
      openAIApiKey: 'test-key',
      summaryModel: 'gpt-4o-mini',
      summaryWriterSystemPrompt: 'writer prompt',
      summaryReviewerSystemPrompt: 'reviewer prompt',
    });
  });

  it('should provide a default summary model', () => {
    process.env = {
      OPENAI_API_KEY: 'test-key',
      AGENTS_SUMMARY_WRITER_SYSTEM_PROMPT: 'writer prompt',
      AGENTS_SUMMARY_REVIEWER_SYSTEM_PROMPT: 'reviewer prompt',
    };

    const config = getLlmConfig();

    expect(config.summaryModel).toBe('gpt-4o-mini');
  });

  it('should reject missing openai api key', () => {
    expect(() => getLlmConfig()).toThrow(/Invalid agents llm configuration/);
  });

  it('should reject missing system prompts', () => {
    process.env = {
      OPENAI_API_KEY: 'test-key',
    };

    expect(() => getLlmConfig()).toThrow(/Invalid agents llm configuration/);
  });
});
