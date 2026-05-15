import Joi from 'joi';

export interface AgentsLlmConfig {
  openAIApiKey: string;
  summaryModel: string;
  summaryWriterSystemPrompt: string;
  summaryReviewerSystemPrompt: string;
}

interface ValidatedEnvironment {
  OPENAI_API_KEY: string;
  AGENTS_SUMMARY_MODEL: string;
  AGENTS_SUMMARY_WRITER_SYSTEM_PROMPT: string;
  AGENTS_SUMMARY_REVIEWER_SYSTEM_PROMPT: string;
}

const llmConfigSchema = Joi.object<ValidatedEnvironment>({
  OPENAI_API_KEY: Joi.string().trim().min(1).required(),
  AGENTS_SUMMARY_MODEL: Joi.string().trim().min(1).default('gpt-4o-mini'),
  AGENTS_SUMMARY_WRITER_SYSTEM_PROMPT: Joi.string().trim().min(1).required(),
  AGENTS_SUMMARY_REVIEWER_SYSTEM_PROMPT: Joi.string().trim().min(1).required(),
}).unknown(true);

export function getLlmConfig(): AgentsLlmConfig {
  const { error, value } = llmConfigSchema.validate(process.env, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    const details = error.details.map((detail) => detail.message).join('; ');
    throw new Error(`Invalid agents llm configuration: ${details}`);
  }

  const env = value as ValidatedEnvironment;

  return {
    openAIApiKey: env.OPENAI_API_KEY,
    summaryModel: env.AGENTS_SUMMARY_MODEL,
    summaryWriterSystemPrompt: env.AGENTS_SUMMARY_WRITER_SYSTEM_PROMPT,
    summaryReviewerSystemPrompt: env.AGENTS_SUMMARY_REVIEWER_SYSTEM_PROMPT,
  };
}
