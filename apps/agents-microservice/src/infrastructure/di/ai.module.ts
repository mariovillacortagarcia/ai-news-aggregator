import { Module } from '@nestjs/common';
import { SummaryGeneratorPort } from '../../core/domain/ports/summary-generator.port';
import { SummaryAgentAdapter } from '../adapters/ai/summary-agent.adapter';
import { SummaryChatModelProvider } from '../adapters/ai/summary-chat-model.provider';

@Module({
  providers: [
    SummaryChatModelProvider,
    {
      provide: SummaryGeneratorPort,
      useClass: SummaryAgentAdapter,
    },
  ],
  exports: [SummaryGeneratorPort],
})
export class AiModule {}
