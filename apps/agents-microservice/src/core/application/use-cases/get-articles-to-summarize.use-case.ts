import { Injectable } from '@nestjs/common';
import {
  ArticleStatus,
  NewsArticle,
  NewsArticleRepositoryPort,
} from '@ai-news-aggregator/news-article';

@Injectable()
export class GetArticlesToSummarizeUseCase {
  constructor(
    private readonly newsArticleRepository: NewsArticleRepositoryPort,
  ) {}

  async execute(): Promise<NewsArticle[]> {
    const approvedArticles = await this.newsArticleRepository.find({
      status: [ArticleStatus.APPROVED],
    });

    return approvedArticles.filter((article) => !article.summarized);
  }
}
