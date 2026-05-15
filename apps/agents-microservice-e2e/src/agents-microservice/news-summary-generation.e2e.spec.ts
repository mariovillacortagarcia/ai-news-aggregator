import {
  ArticleStatus,
  NewsArticle,
} from '@ai-news-aggregator/news-article';
import {
  AgentsE2eContext,
  createAgentsE2eApp,
  resetAgentsE2eContext,
} from '../support/agents-e2e-app';

function createFeatureArticle(
  status: ArticleStatus,
  generatedSummary?: string | null,
): NewsArticle {
  return new NewsArticle(
    'article-1',
    'https://example.com/article-1',
    'Quantum Computing Breakthrough',
    `Scientists have achieved a significant breakthrough in quantum computing, enabling faster processing and improved stability.
This advancement could revolutionize various industries, including cryptography, drug discovery, and artificial intelligence.
The new quantum processor is expected to be commercially available within the next few years, promising to enhance computational capabilities and drive innovation across multiple sectors.`,
    'Test Author',
    'https://example.com/image.jpg',
    'source-1',
    status,
    false,
    new Date('2024-01-01T00:00:00Z'),
    new Date('2024-01-01T00:00:00Z'),
    generatedSummary,
  );
}

describe('News Summary Generation E2E', () => {
  let context: AgentsE2eContext;

  beforeEach(async () => {
    context = await createAgentsE2eApp();
  });

  afterEach(async () => {
    await resetAgentsE2eContext(context);
    await context.app.close();
  });

  describe('Successfully generating a summary for an approved article', () => {
    it('should generate a summary and mark the article as summarized', async () => {
      const article = createFeatureArticle(ArticleStatus.APPROVED);
      await context.articleRepository.save(article);
      context.summaryGenerator.setGeneratedSummary(
        'Quantum computing has reached a major breakthrough.',
      );

      const result = await context.processScheduledSummarization.execute();
      const updatedArticle = await context.articleRepository.findById('article-1');

      expect(result.processed).toBe(1);
      expect(updatedArticle?.generatedSummary).toBe(
        'Quantum computing has reached a major breakthrough.',
      );
      expect(updatedArticle?.summarized).toBe(true);
    });
  });

  describe('Skipping articles that are not approved', () => {
    it('should not summarize the article', async () => {
      const article = createFeatureArticle(ArticleStatus.CANDIDATE);
      await context.articleRepository.save(article);

      const result = await context.processScheduledSummarization.execute();
      const updatedArticle = await context.articleRepository.findById('article-1');

      expect(result.processed).toBe(0);
      expect(updatedArticle?.generatedSummary).toBeNull();
      expect(updatedArticle?.summarized).toBe(false);
    });
  });

  describe('Skipping articles that already have a summary', () => {
    it('should not summarize the article again', async () => {
      const article = createFeatureArticle(
        ArticleStatus.APPROVED,
        'Existing summary',
      );
      await context.articleRepository.save(article);
      context.summaryGenerator.setGeneratedSummary('New summary that should not be used');

      const result = await context.processScheduledSummarization.execute();
      const updatedArticle = await context.articleRepository.findById('article-1');

      expect(result.processed).toBe(0);
      expect(updatedArticle?.generatedSummary).toBe('Existing summary');
    });
  });
});
