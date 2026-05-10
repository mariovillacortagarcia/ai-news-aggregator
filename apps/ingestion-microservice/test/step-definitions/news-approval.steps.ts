import { Given, Then, When } from '@cucumber/cucumber';
import { CustomWorld } from '../support/custom-world';
import { ArticleStatus, NewsArticle } from '../../src/core/domain/entities/news-article';
import { ArticleNotFoundError } from '../../src/core/domain/errors/article-not-found.error';
import { ArgumentError } from '../../src/core/domain/errors/argument.error';

interface NewsApprovalWorld extends CustomWorld {
  articleTitle: string;
}

Given(
  'a news article exists in the repository with status {string}',
  async function (this: NewsApprovalWorld, status: string) {
    const article = new NewsArticle(
      'article-1',
      'https://example.com/article-1',
      'Test Article',
      'Test content',
      'Test Author',
      'https://example.com/image.jpg',
      'source-1',
      status as ArticleStatus,
      false,
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-01T00:00:00Z')
    );
    
    this.articles = [article];
    await this.articleRepository.save(article);
    this.articleTitle = 'Test Article';
  },
);

Given(
  'the article has the title {string}',
  async function (this: NewsApprovalWorld, title: string) {
    this.articleTitle = title;
    const existingArticle = this.articles[0];
    if (existingArticle) {
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
        existingArticle.updatedAt
      );
      await this.articleRepository.update(article);
      this.articles = [article];
    }
  },
);

Given(
  'the administrator is a valid one',
  async function (this: NewsApprovalWorld) {
    // The Telegram polling adapter validates admins at the infrastructure boundary.
    // These approval use-case scenarios exercise only the domain transition.
  },
);

Given(
  'the article status is already {string}',
  async function (this: NewsApprovalWorld, status: string) {
    const existingArticle = this.articles[0];
    if (existingArticle) {
      const article = new NewsArticle(
        existingArticle.id,
        existingArticle.articleUrl,
        existingArticle.title,
        existingArticle.content,
        existingArticle.author,
        existingArticle.mainImageUrl,
        existingArticle.pullSourceId,
        status as ArticleStatus,
        existingArticle.notified,
        existingArticle.createdAt,
        existingArticle.updatedAt
      );
      await this.articleRepository.update(article);
      this.articles = [article];
    }
  },
);

When(
  'the administrator approves the article',
  async function (this: NewsApprovalWorld) {
    this.articleActionError = null;
    this.originalArticleUpdatedAt = this.articles[0]?.updatedAt ?? null;
    try {
      await this.approveArticleUseCase.execute('article-1');
    } catch (error) {
      this.articleActionError = error as Error;
    }
  },
);

When(
  'the administrator rejects the article',
  async function (this: NewsApprovalWorld) {
    this.articleActionError = null;
    this.originalArticleUpdatedAt = this.articles[0]?.updatedAt ?? null;
    try {
      await this.rejectArticleUseCase.execute('article-1');
    } catch (error) {
      this.articleActionError = error as Error;
    }
  },
);

When(
  'the administrator attempts to approve the article',
  async function (this: NewsApprovalWorld) {
    this.articleActionError = null;
    this.originalArticleUpdatedAt = this.articles[0]?.updatedAt ?? null;
    try {
      await this.approveArticleUseCase.execute('article-1');
    } catch (error) {
      this.articleActionError = error as Error;
    }
  },
);

Then(
  'the article status should change to {string}',
  async function (this: NewsApprovalWorld, expectedStatus: string) {
    const updatedArticle = await this.articleRepository.findById('article-1');
    
    if (!updatedArticle) {
      throw new Error('Article not found after update');
    }
    
    if (updatedArticle.status !== expectedStatus) {
      throw new Error(
        `Expected status ${expectedStatus} but got ${updatedArticle.status}`
      );
    }
  },
);

Then(
  'the article should be updated',
  async function (this: NewsApprovalWorld) {
    const updatedArticle = await this.articleRepository.findById('article-1');
    
    if (!updatedArticle) {
      throw new Error('Article not found after update');
    }
    
    if (
      this.originalArticleUpdatedAt &&
      updatedArticle.updatedAt.getTime() <= this.originalArticleUpdatedAt.getTime()
    ) {
      throw new Error('Expected updatedAt timestamp to be updated');
    }
  },
);

Then(
  'the article status should remain {string}',
  async function (this: NewsApprovalWorld, expectedStatus: string) {
    const updatedArticle = await this.articleRepository.findById('article-1');

    if (!updatedArticle) {
      throw new Error('Article not found');
    }

    if (updatedArticle.status !== expectedStatus) {
      throw new Error(
        `Expected status to remain ${expectedStatus} but got ${updatedArticle.status}`
      );
    }
  },
);

Then(
  'the article should be available for downstream polling by the other microservices',
  async function (this: NewsApprovalWorld) {
    const updatedArticle = await this.articleRepository.findById('article-1');
    
    if (!updatedArticle) {
      throw new Error('Article not found');
    }
    
    if (updatedArticle.status !== ArticleStatus.APPROVED) {
      throw new Error(
        `Expected article to be APPROVED for downstream polling but got ${updatedArticle.status}`
      );
    }
  },
);

Then(
  'the article should NOT be available for downstream polling',
  async function (this: NewsApprovalWorld) {
    const updatedArticle = await this.articleRepository.findById('article-1');
    
    if (!updatedArticle) {
      throw new Error('Article not found');
    }
    
    if (updatedArticle.status === ArticleStatus.APPROVED) {
      throw new Error('Expected article to NOT be APPROVED for downstream polling');
    }
  },
);

Then(
  'an approval error should be recorded',
  async function (this: NewsApprovalWorld) {
    if (!this.articleActionError) {
      throw new Error('Expected an approval error but got none');
    }
    
    if (!(this.articleActionError instanceof ArgumentError)) {
      throw new Error(
        `Expected ArgumentError but got ${this.articleActionError.constructor.name}`
      );
    }
  },
);
