import {
  Given,
  Then,
  When,
} from '@cucumber/cucumber';
import { CustomWorld } from '../support/custom-world';
import { ArticleStatus, NewsArticle } from '../../src/core/domain/entities/news-article';
import { ArticleNotificationData } from '../../src/core/domain/ports/telegram-notification.port';

Given(
  'the notification system is configured with a valid Telegram bot token and administrators @usernames',
  async function (this: CustomWorld) {
    // Configuration is handled by the in-memory repository for testing
  },
);

Given(
  'the system is scheduled to run the notification process every hour',
  async function (this: CustomWorld) {
    // Scheduling is handled externally for testing
  },
);

Given(
  'there are articles in the repository with different statuses',
  async function (this: CustomWorld) {
    // Default background state - articles will be added by specific steps
  },
);

Given(
  'there are {int} articles with status {string}',
  async function (this: CustomWorld, count: number, status: string) {
    for (let i = 0; i < count; i++) {
      const article = new NewsArticle(
        `article-${Date.now()}-${i}`,
        `https://example.com/article-${i}`,
        `Article ${i + 1}`,
        `Content ${i + 1}`,
        `Author ${i + 1}`,
        `https://example.com/image${i}.jpg`,
        'source-1',
        status as ArticleStatus,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z')
      );
      this.articles.push(article);
      await this.articleRepository.save(article);
    }
  },
);

Given(
  '{int} of those articles have not been notified yet',
  async function (this: CustomWorld, unnotifiedCount: number) {
    const articlesToMarkAsNotified = this.articles.length - unnotifiedCount;
    
    for (let i = 0; i < articlesToMarkAsNotified; i++) {
      this.articles[i].notify();
      await this.articleRepository.update(this.articles[i]);
    }
  },
);

Given(
  'all of them have already been marked as {string}',
  async function (this: CustomWorld, status: string) {
    if (status === 'notified') {
      const allArticles = await this.articleRepository.find();
      for (const article of allArticles) {
        article.notify();
        await this.articleRepository.update(article);
      }
    }
  },
);

When(
  'the scheduled notification process is triggered',
  async function (this: CustomWorld) {
    try {
      await this.sendNotificationUseCase.execute();
      
      const lastNotification = this.telegramNotification.getLastNotification();
      if (lastNotification !== null && lastNotification.length > 0) {
        this.notificationSent = true;
        this.lastNotificationArticles = lastNotification;
      } else {
        this.notificationSent = false;
      }
    } catch (error) {
      this.notificationError = error as Error;
      this.notificationSent = false;
    }
  },
);

Then(
  'a notification should be sent to the administrator',
  async function (this: CustomWorld) {
    if (!this.notificationSent) {
      throw new Error('Expected notification to be sent but it was not');
    }
  },
);

Then(
  'the message should contain details for the {int} pending articles',
  async function (this: CustomWorld, expectedCount: number) {
    if (!this.lastNotificationArticles) {
      throw new Error('Expected notification articles to be available');
    }
    
    if (this.lastNotificationArticles.length !== expectedCount) {
      throw new Error(
        `Expected ${expectedCount} articles in notification but got ${this.lastNotificationArticles.length}`
      );
    }
  },
);

Then(
  'those {int} articles should be marked as {string}',
  async function (this: CustomWorld, count: number, status: string) {
    if (status === 'notified') {
      const allArticles = await this.articleRepository.find();
      const notifiedArticles = allArticles.filter(a => a.notified);
      
      if (notifiedArticles.length < count) {
        throw new Error(
          `Expected at least ${count} articles to be marked as notified but got ${notifiedArticles.length}`
        );
      }
    }
  },
);

Then(
  'no notification should be sent to the administrator',
  async function (this: CustomWorld) {
    if (this.notificationSent) {
      throw new Error('Expected no notification to be sent but one was sent');
    }
    
    const lastNotification = this.telegramNotification.getLastNotification();
    if (lastNotification !== null && lastNotification.length > 0) {
      throw new Error('Expected no notification articles but got some');
    }
  },
);
