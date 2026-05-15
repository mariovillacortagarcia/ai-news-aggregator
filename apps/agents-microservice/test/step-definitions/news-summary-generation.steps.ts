import { Before, Given, Then, When } from '@cucumber/cucumber';
import { ArticleStatus, NewsArticle } from '@ai-news-aggregator/news-article';
import { CustomWorld } from '../support/custom-world';

interface SummaryGenerationWorld extends CustomWorld {
  articleTitle: string;
  articleContent: string;
}

Before(function (this: SummaryGenerationWorld) {
  this.reset();
  this.articleTitle = 'Test Article';
  this.articleContent = 'Test content';
});

Given(
  'a news article exists in the repository with status {string}',
  async function (this: SummaryGenerationWorld, status: string) {
    const article = this.createArticle(status as ArticleStatus);
    this.articles = [article];
    this.currentArticle = article;
    await this.articleRepository.save(article);
  },
);

Given(
  'the article has the title {string}',
  async function (this: SummaryGenerationWorld, title: string) {
    this.articleTitle = title;
    const existingArticle = this.articles[0];
    if (!existingArticle) {
      return;
    }

    const article = new NewsArticle(
      existingArticle.id,
      existingArticle.articleUrl,
      title,
      existingArticle.content,
      existingArticle.author,
      existingArticle.mainImageUrl,
      existingArticle.pullSourceId,
      existingArticle.status,
      existingArticle.notified,
      existingArticle.createdAt,
      existingArticle.updatedAt,
      existingArticle.generatedSummary,
    );

    await this.articleRepository.update(article);
    this.articles = [article];
    this.currentArticle = article;
  },
);

Given(
  'the article has the following content:',
  async function (this: SummaryGenerationWorld, content: string) {
    this.articleContent = content;
    const existingArticle = this.articles[0];
    if (!existingArticle) {
      return;
    }

    const article = new NewsArticle(
      existingArticle.id,
      existingArticle.articleUrl,
      existingArticle.title,
      content,
      existingArticle.author,
      existingArticle.mainImageUrl,
      existingArticle.pullSourceId,
      existingArticle.status,
      existingArticle.notified,
      existingArticle.createdAt,
      existingArticle.updatedAt,
      existingArticle.generatedSummary,
    );

    await this.articleRepository.update(article);
    this.articles = [article];
    this.currentArticle = article;
  },
);

Given(
  'the approved article already has a generated summary',
  async function (this: SummaryGenerationWorld) {
    const existingArticle = this.articles[0];
    if (!existingArticle) {
      return;
    }

    const article = new NewsArticle(
      existingArticle.id,
      existingArticle.articleUrl,
      existingArticle.title,
      existingArticle.content,
      existingArticle.author,
      existingArticle.mainImageUrl,
      existingArticle.pullSourceId,
      existingArticle.status,
      existingArticle.notified,
      existingArticle.createdAt,
      existingArticle.updatedAt,
      'Existing summary',
    );

    await this.articleRepository.update(article);
    this.articles = [article];
    this.currentArticle = article;
  },
);

When(
  'the scheduled summarization process runs',
  async function (this: SummaryGenerationWorld) {
    this.summarizationError = null;

    try {
      this.processResult =
        await this.processScheduledSummarizationUseCase.execute();
    } catch (error) {
      this.summarizationError = error as Error;
    }
  },
);

Then(
  'a summary should be generated and attached to the article',
  async function (this: SummaryGenerationWorld) {
    const article = await this.articleRepository.findById('article-1');

    if (!article?.generatedSummary) {
      throw new Error('Expected the article to have a generated summary');
    }
  },
);

Then(
  'the article should be marked as summarized',
  async function (this: SummaryGenerationWorld) {
    const article = await this.articleRepository.findById('article-1');

    if (!article?.summarized) {
      throw new Error('Expected the article to be marked as summarized');
    }
  },
);

Then(
  'the article should not be summarized',
  async function (this: SummaryGenerationWorld) {
    const article = await this.articleRepository.findById('article-1');

    if (!article) {
      throw new Error('Article not found');
    }

    if (article.summarized) {
      throw new Error('Expected the article to remain unsummarized');
    }
  },
);

Then(
  'the article should not be summarized again',
  async function (this: SummaryGenerationWorld) {
    const article = await this.articleRepository.findById('article-1');

    if (!article) {
      throw new Error('Article not found');
    }

    if (article.generatedSummary !== 'Existing summary') {
      throw new Error(
        `Expected existing summary to be preserved but got: ${article.generatedSummary}`,
      );
    }
  },
);
