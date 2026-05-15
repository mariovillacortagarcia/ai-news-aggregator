import { Injectable } from '@nestjs/common';
import { NewsArticleRepositoryPort } from '@ai-news-aggregator/news-article';
import { GetArticlesToSummarizeUseCase } from './get-articles-to-summarize.use-case';
import { SummarizeArticleUseCase } from './summarize-article.use-case';

@Injectable()
export class ProcessScheduledSummarizationUseCase {
  constructor(
    private readonly newsArticleRepository: NewsArticleRepositoryPort,
    private readonly getArticlesToSummarize: GetArticlesToSummarizeUseCase,
    private readonly summarizeArticle: SummarizeArticleUseCase,
  ) {}

  async execute(): Promise<{ processed: number }> {
    const articles = await this.getArticlesToSummarize.execute();

    for (const article of articles) {
      const summarizedArticle = await this.summarizeArticle.execute(article);
      await this.newsArticleRepository.update(summarizedArticle);
    }

    return {
      processed: articles.length,
    };
  }
}
