import { ArgumentError } from '../errors/argument.error';
import { NewsArticle, ArticleStatus } from '../entities/news-article';

describe('NewsArticle', () => {
  describe('constructor', () => {
    it('should create a NewsArticle instance with correct properties', () => {
      const id = 'article-123';
      const articleUrl = 'https://example.com/article';
      const title = 'Example Article';
      const content = 'This is an example article.';
      const author = 'John Doe';
      const mainImageUrl = 'https://example.com/image.jpg';
      const pullSourceId = 'source-123';

      const newsArticle = new NewsArticle(
        id,
        articleUrl,
        title,
        content,
        author,
        mainImageUrl,
        pullSourceId
      );

      expect(newsArticle).toBeDefined();
    });
  });

  describe('id', () => {
    it('should return the id of the news article', () => {
      const id = 'article-123';
      const newsArticle = new NewsArticle(
        id,
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123'
      );

      expect(newsArticle.id).toBe(id);
    });

    it('should not allow nullable id of the news article', () => {
      expect(() => {
        new NewsArticle(
          '',
          'https://example.com/article',
          'Example Article',
          'This is an example article.',
          'John Doe',
          'https://example.com/image.jpg',
          'source-123'
        );
      }).toThrow(new ArgumentError('NewsArticle id cannot be empty'));
      expect(() => {
        new NewsArticle(
          null as any,
          'https://example.com/article',
          'Example Article',
          'This is an example article.',
          'John Doe',
          'https://example.com/image.jpg',
          'source-123'
        );
      }).toThrow(new ArgumentError('NewsArticle id cannot be empty'));

      expect(() => {
        new NewsArticle(
          undefined as any,
          'https://example.com/article',
          'Example Article',
          'This is an example article.',
          'John Doe',
          'https://example.com/image.jpg',
          'source-123'
        );
      }).toThrow(new ArgumentError('NewsArticle id cannot be empty'));
    });
  });

  describe('articleUrl', () => {
    it('should return the articleUrl of the news article', () => {
      const articleUrl = 'https://example.com/article';
      const newsArticle = new NewsArticle(
        'article-123',
        articleUrl,
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123'
      );

      expect(newsArticle.articleUrl).toBe(articleUrl);
    });

    it('should not allow nullable articleUrl of the news article', () => {
      expect(() => {
        new NewsArticle(
          'article-123',
          '',
          'Example Article',
          'This is an example article.',
          'John Doe',
          'https://example.com/image.jpg',
          'source-123'
        );
      }).toThrow(new ArgumentError('NewsArticle articleUrl cannot be empty'));
      expect(() => {
        new NewsArticle(
          'article-123',
          null as any,
          'Example Article',
          'This is an example article.',
          'John Doe',
          'https://example.com/image.jpg',
          'source-123'
        );
      }).toThrow(new ArgumentError('NewsArticle articleUrl cannot be empty'));

      expect(() => {
        new NewsArticle(
          'article-123',
          undefined as any,
          'Example Article',        'This is an example article.',      'John Doe',
            'https://example.com/image.jpg',
            'source-123'
        );
      }).toThrow(new ArgumentError('NewsArticle articleUrl cannot be empty'));
    });
  });

  describe('title', () => {
    it('should return the title of the news article', () => {
      const title = 'Example Article';
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        title,
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123'
      );

      expect(newsArticle.title).toBe(title);
    });

    it('should not allow nullable title of the news article', () => {
      expect(() => {
        new NewsArticle(
          'article-123',
          'https://example.com/article',
          '',
          'This is an example article.',
          'John Doe',
          'https://example.com/image.jpg',
          'source-123'
        );
      }).toThrow(new ArgumentError('NewsArticle title cannot be empty'));
      expect(() => {
        new NewsArticle(
          'article-123',
          'https://example.com/article',
          null as any,
          'This is an example article.',
          'John Doe',
          'https://example.com/image.jpg',
          'source-123'
        );
      }).toThrow(new ArgumentError('NewsArticle title cannot be empty'));

      expect(() => {
        new NewsArticle(
          'article-123',
          'https://example.com/article',
          undefined as any,
          'This is an example article.',
          'John Doe',
          'https://example.com/image.jpg',
          'source-123'
        );
      }).toThrow(new ArgumentError('NewsArticle title cannot be empty'));
    });
  });

  describe('content', () => {
    it('should return the content of the news article', () => {
      const content = 'This is an example article.';
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        content,
        'John Doe',
        'https://example.com/image.jpg',
        'source-123'
      );

      expect(newsArticle.content).toBe(content);
    });

    it('should not allow nullable content of the news article', () => {
      expect(() => {
        new NewsArticle(
          'article-123',
          'https://example.com/article',
          'Example Article',
          '',
          'John Doe',
          'https://example.com/image.jpg',
          'source-123'
        );
      }).toThrow(new ArgumentError('NewsArticle content cannot be empty'));
      expect(() => {
        new NewsArticle(
          'article-123',
          'https://example.com/article',
          'Example Article',
          null as any,
          'John Doe',
          'https://example.com/image.jpg',
          'source-123'
        );
      }).toThrow(new ArgumentError('NewsArticle content cannot be empty'));

      expect(() => {
        new NewsArticle(
          'article-123',
          'https://example.com/article',
          'Example Article',
          undefined as any,
          'John Doe',
          'https://example.com/image.jpg',
          'source-123'
        );
      }).toThrow(new ArgumentError('NewsArticle content cannot be empty'));
    });
    
  });

  describe('author', () => {
    it('should return the author of the news article', () => {
      const author = 'John Doe';
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        author,
        'https://example.com/image.jpg',
        'source-123'
      );

      expect(newsArticle.author).toBe(author);
    });

    it('should not allow nullable author of the news article', () => {
      expect(() => {
        new NewsArticle(
          'article-123',
          'https://example.com/article',
          'Example Article',
          'This is an example article.',
          '',
          'https://example.com/image.jpg',
          'source-123'
        );
      }).toThrow(new ArgumentError('NewsArticle author cannot be empty'));
      expect(() => {
        new NewsArticle(
          'article-123',
          'https://example.com/article',
          'Example Article',
          'This is an example article.',
          null as any,
          'https://example.com/image.jpg',
          'source-123'
        );
      }).toThrow(new ArgumentError('NewsArticle author cannot be empty'));

      expect(() => {
        new NewsArticle(
          'article-123',
          'https://example.com/article',
          'Example Article',
          'This is an example article.',
          undefined as any,
          'https://example.com/image.jpg',
          'source-123'
        );
      }).toThrow(new ArgumentError('NewsArticle author cannot be empty'));
    });
  });

  describe('mainImageUrl', () => {
    it('should return the mainImageUrl of the news article', () => {
      const mainImageUrl = 'https://example.com/image.jpg';
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        mainImageUrl,
        'source-123'
      );

      expect(newsArticle.mainImageUrl).toBe(mainImageUrl);
    });

    it('should allow empty mainImageUrl when the article has no image', () => {
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        '',
        'source-123'
      );

      expect(newsArticle.mainImageUrl).toBe('');
    });

    it('should normalize nullable mainImageUrl to an empty string', () => {
      const articleWithNullImage = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        null,
        'source-123'
      );

      const articleWithUndefinedImage = new NewsArticle(
        'article-456',
        'https://example.com/article-2',
        'Example Article 2',
        'This is another example article.',
        'John Doe',
        undefined,
        'source-123'
      );

      expect(articleWithNullImage.mainImageUrl).toBe('');
      expect(articleWithUndefinedImage.mainImageUrl).toBe('');
    });
  });

  describe('pullSourceId', () => {
    it('should return the pullSourceId of the news article', () => {
      const pullSourceId = 'source-123';
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        pullSourceId
      );

      expect(newsArticle.pullSourceId).toBe(pullSourceId);
    });

    it('should not allow nullable pullSourceId of the news article', () => {
      expect(() => {
        new NewsArticle(
          'article-123',
          'https://example.com/article',
          'Example Article',
          'This is an example article.',
          'John Doe',
          'https://example.com/image.jpg',
          ''
        );
      }).toThrow(new ArgumentError('NewsArticle pullSourceId cannot be empty'));
      expect(() => {
        new NewsArticle(
          'article-123',
          'https://example.com/article',
          'Example Article',
          'This is an example article.',
          'John Doe',
          'https://example.com/image.jpg',
          null as any
        );
      }).toThrow(new ArgumentError('NewsArticle pullSourceId cannot be empty'));

      expect(() => {
        new NewsArticle(
          'article-123',
          'https://example.com/article',
          'Example Article',
          'This is an example article.',
          'John Doe',
          'https://example.com/image.jpg',
          undefined as any
        );
      }).toThrow(new ArgumentError('NewsArticle pullSourceId cannot be empty'));
    });
  });

  describe('status', () => {
    it('should create a NewsArticle with status CANDIDATE by default', () => {
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123'
      );

      expect(newsArticle.status).toBe(ArticleStatus.CANDIDATE);
    });

    it('should create a NewsArticle with explicit status CANDIDATE', () => {
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123',
        ArticleStatus.CANDIDATE
      );

      expect(newsArticle.status).toBe(ArticleStatus.CANDIDATE);
    });

    it('should create a NewsArticle with status APPROVED', () => {
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123',
        ArticleStatus.APPROVED
      );

      expect(newsArticle.status).toBe(ArticleStatus.APPROVED);
    });

    it('should create a NewsArticle with status REJECTED', () => {
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123',
        ArticleStatus.REJECTED
      );

      expect(newsArticle.status).toBe(ArticleStatus.REJECTED);
    });

    it('should not allow invalid status values', () => {
      expect(() => {
        new NewsArticle(
          'article-123',
          'https://example.com/article',
          'Example Article',
          'This is an example article.',
          'John Doe',
          'https://example.com/image.jpg',
          'source-123',
          'INVALID' as any
        );
      }).toThrow(new ArgumentError('Invalid ArticleStatus'));
    });
  });

  describe('createdAt', () => {
    it('should create a NewsArticle with createdAt set to current date', () => {
      const before = new Date();
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123'
      );
      const after = new Date();

      expect(newsArticle.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(newsArticle.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should create a NewsArticle with explicit createdAt', () => {
      const createdAt = new Date('2024-01-01T00:00:00Z');
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123',
        ArticleStatus.CANDIDATE,
        false,
        createdAt
      );

      expect(newsArticle.createdAt).toBe(createdAt);
    });

    it('should not allow nullable createdAt', () => {
      expect(() => {
        new NewsArticle(
          'article-123',
          'https://example.com/article',
          'Example Article',
          'This is an example article.',
          'John Doe',
          'https://example.com/image.jpg',
          'source-123',
          ArticleStatus.CANDIDATE,
          false,
          null as any
        );
      }).toThrow(new ArgumentError('NewsArticle createdAt cannot be null'));
    });
  });

  describe('updatedAt', () => {
    it('should create a NewsArticle with updatedAt set to current date by default', () => {
      const before = new Date();
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123'
      );
      const after = new Date();

      expect(newsArticle.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(newsArticle.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should create a NewsArticle with explicit updatedAt', () => {
      const updatedAt = new Date('2024-01-01T00:00:00Z');
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123',
        ArticleStatus.CANDIDATE,
        false,
        new Date('2024-01-01T00:00:00Z'),
        updatedAt
      );

      expect(newsArticle.updatedAt).toBe(updatedAt);
    });

    it('should not allow nullable updatedAt', () => {
      expect(() => {
        new NewsArticle(
          'article-123',
          'https://example.com/article',
          'Example Article',
          'This is an example article.',
          'John Doe',
          'https://example.com/image.jpg',
          'source-123',
          ArticleStatus.CANDIDATE,
          false,
          new Date('2024-01-01T00:00:00Z'),
          null as any
        );
      }).toThrow(new ArgumentError('NewsArticle updatedAt cannot be null'));
    });
  });

  describe('notify', () => {
    it('should mark the article as notified', () => {
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123'
      );

      expect(newsArticle.notified).toBe(false);

      newsArticle.notify();

      expect(newsArticle.notified).toBe(true);
    });

    it('should update the updatedAt timestamp when notified', () => {
      const before = new Date('2024-01-01T00:00:00Z');
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123',
        ArticleStatus.CANDIDATE,
        false,
        before,
        before
      );

      newsArticle.notify();

      expect(newsArticle.updatedAt.getTime()).toBeGreaterThan(before.getTime());
    });
  });

  describe('approve', () => {
    it('should transition status from CANDIDATE to APPROVED', () => {
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123',
        ArticleStatus.CANDIDATE
      );

      newsArticle.approve();

      expect(newsArticle.status).toBe(ArticleStatus.APPROVED);
    });

    it('should update the updatedAt timestamp when approved', () => {
      const before = new Date('2024-01-01T00:00:00Z');
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123',
        ArticleStatus.CANDIDATE,
        false,
        before,
        before
      );

      newsArticle.approve();

      expect(newsArticle.updatedAt.getTime()).toBeGreaterThan(before.getTime());
    });

    it('should throw an error when trying to approve an already REJECTED article', () => {
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123',
        ArticleStatus.REJECTED
      );

      expect(() => newsArticle.approve()).toThrow(
        new ArgumentError('Cannot approve an article with status REJECTED')
      );
    });

    it('should throw an error when trying to approve an already APPROVED article', () => {
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123',
        ArticleStatus.APPROVED
      );

      expect(() => newsArticle.approve()).toThrow(
        new ArgumentError('Cannot approve an article with status APPROVED')
      );
    });
  });

  describe('reject', () => {
    it('should transition status from CANDIDATE to REJECTED', () => {
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123',
        ArticleStatus.CANDIDATE
      );

      newsArticle.reject();

      expect(newsArticle.status).toBe(ArticleStatus.REJECTED);
    });

    it('should update the updatedAt timestamp when rejected', () => {
      const before = new Date('2024-01-01T00:00:00Z');
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123',
        ArticleStatus.CANDIDATE,
        false,
        before,
        before
      );

      newsArticle.reject();

      expect(newsArticle.updatedAt.getTime()).toBeGreaterThan(before.getTime());
    });

    it('should throw an error when trying to reject an already APPROVED article', () => {
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123',
        ArticleStatus.APPROVED
      );

      expect(() => newsArticle.reject()).toThrow(
        new ArgumentError('Cannot reject an article with status APPROVED')
      );
    });

    it('should throw an error when trying to reject an already REJECTED article', () => {
      const newsArticle = new NewsArticle(
        'article-123',
        'https://example.com/article',
        'Example Article',
        'This is an example article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-123',
        ArticleStatus.REJECTED
      );

      expect(() => newsArticle.reject()).toThrow(
        new ArgumentError('Cannot reject an article with status REJECTED')
      );
    });
  });
});
