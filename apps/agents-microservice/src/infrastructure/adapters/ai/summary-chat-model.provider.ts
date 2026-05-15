import { Injectable } from '@nestjs/common';
import { initChatModel } from 'langchain';
import { getLlmConfig } from '../../config/llm.config';

export interface ChatModelLike {
  invoke(input: unknown): Promise<unknown>;
}

@Injectable()
export class SummaryChatModelProvider {
  private modelPromise: Promise<ChatModelLike> | null = null;

  async getModel(): Promise<ChatModelLike> {
    if (!this.modelPromise) {
      const config = getLlmConfig();
      this.modelPromise = initChatModel(config.summaryModel, {
        modelProvider: 'openai',
        apiKey: config.openAIApiKey,
        temperature: 0.2,
      }) as Promise<ChatModelLike>;
    }

    return this.modelPromise;
  }
}
