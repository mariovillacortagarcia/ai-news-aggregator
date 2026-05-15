import { Injectable } from '@nestjs/common';
import { NewsArticle } from '@ai-news-aggregator/news-article';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import {
  Annotation,
  END,
  START,
  StateGraph,
} from '@langchain/langgraph';
import { SummaryGeneratorPort } from '../../../core/domain/ports/summary-generator.port';
import { getLlmConfig } from '../../config/llm.config';
import { ChatModelLike, SummaryChatModelProvider } from './summary-chat-model.provider';

const SummaryWorkflowState = Annotation.Root({
  article: Annotation<NewsArticle>,
  draftSummary: Annotation<string>,
  reviewedSummary: Annotation<string>,
});

type SummaryWorkflowStateType = typeof SummaryWorkflowState.State;

@Injectable()
export class SummaryAgentAdapter implements SummaryGeneratorPort {
  constructor(private readonly summaryChatModelProvider: SummaryChatModelProvider) {}

  private readonly workflow = new StateGraph(SummaryWorkflowState)
    .addNode('writer', async (state: SummaryWorkflowStateType) => ({
      draftSummary: await this.createDraftSummary(state.article),
    }))
    .addNode('reviewer', async (state: SummaryWorkflowStateType) => ({
      reviewedSummary: await this.reviewDraftSummary(state.article, state.draftSummary),
    }))
    .addEdge(START, 'writer')
    .addEdge('writer', 'reviewer')
    .addEdge('reviewer', END)
    .compile();

  async generateSummary(article: NewsArticle): Promise<string> {
    const result = await this.workflow.invoke({
      article,
      draftSummary: '',
      reviewedSummary: '',
    });

    if (!result.reviewedSummary) {
      throw new Error('Summary workflow returned an empty summary');
    }

    return result.reviewedSummary;
  }

  private async createDraftSummary(article: NewsArticle): Promise<string> {
    const config = getLlmConfig();
    const model = await this.summaryChatModelProvider.getModel();
    const response = await model.invoke([
      new SystemMessage(config.summaryWriterSystemPrompt),
      new HumanMessage(
        `Title: ${article.title}\nAuthor: ${article.author}\nContent:\n${article.content}`,
      ),
    ]);
    const draftSummary = this.extractText(response);
    const normalizedDraftSummary = draftSummary.replace(/\s+/g, ' ').trim();

    if (!normalizedDraftSummary) {
      throw new Error('Generated draft summary cannot be empty');
    }

    return normalizedDraftSummary;
  }

  private async reviewDraftSummary(
    article: NewsArticle,
    draftSummary: string,
  ): Promise<string> {
    const config = getLlmConfig();
    const model = await this.summaryChatModelProvider.getModel();
    const response = await model.invoke([
      new SystemMessage(config.summaryReviewerSystemPrompt),
      new HumanMessage(
        `Title: ${article.title}\nDraft summary:\n${draftSummary}`,
      ),
    ]);
    const reviewedSummary = this.extractText(response);
    const normalizedDraftSummary = reviewedSummary.replace(/\s+/g, ' ').trim();

    if (!normalizedDraftSummary) {
      throw new Error('Reviewed summary cannot be empty');
    }

    return normalizedDraftSummary;
  }

  private extractText(response: unknown): string {
    if (typeof response === 'string') {
      return response;
    }

    if (
      typeof response === 'object' &&
      response !== null &&
      'content' in response
    ) {
      const { content } = response as {
        content: unknown;
      };

      if (typeof content === 'string') {
        return content;
      }

      if (Array.isArray(content)) {
        return content
          .map((part) => {
            if (typeof part === 'string') {
              return part;
            }

            if (
              typeof part === 'object' &&
              part !== null &&
              'text' in part &&
              typeof (part as { text: unknown }).text === 'string'
            ) {
              return (part as { text: string }).text;
            }

            return '';
          })
          .join(' ')
          .trim();
      }
    }

    throw new Error('Unsupported chat model response format');
  }
}
