import { Test } from '@nestjs/testing';
import { SummaryGeneratorPort } from '../../core/domain/ports/summary-generator.port';
import { SummaryAgentAdapter } from '../adapters/ai/summary-agent.adapter';
import { AiModule } from './ai.module';

describe('AiModule', () => {
  it('should provide SummaryGeneratorPort using SummaryAgentAdapter', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AiModule],
    }).compile();

    const summaryGenerator = moduleRef.get(SummaryGeneratorPort);

    expect(summaryGenerator).toBeInstanceOf(SummaryAgentAdapter);
  });
});
