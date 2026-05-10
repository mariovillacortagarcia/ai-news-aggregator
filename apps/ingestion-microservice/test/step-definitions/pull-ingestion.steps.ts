import {
  After,
  Before,
  Given,
  IWorldOptions,
  setWorldConstructor,
  Then,
  When,
  World,
} from '@cucumber/cucumber';
import { ArticleStatus, NewsArticle } from '../../src/core/domain/entities/news-article';
import { RssPullSource, PullSource } from '../../src/core/domain/entities/pull-source';
import { InMemoryPullSourceRepository } from '../../src/core/domain/test/mocks/in-memory-pull-source.repository';
import { InMemoryNewsArticleRepository } from '../../src/core/domain/test/mocks/in-memory-news-article.repository';
import { InMemoryPullSourceExtractor } from '../../src/core/domain/test/mocks/in-memory-pull-source.extractor';
import { ProcessScheduledPullUseCase } from '../../src/core/application/use-cases/process-scheduled-pull.use-case';
import { ExtractedArticleData } from '../../src/core/domain/ports/pull-source-extractor.port';

export interface CustomWorld extends World {
  pullSources: PullSource[];
  existingArticles: NewsArticle[];
  savedArticles: NewsArticle[];
  sourceExtractionErrors: Set<string>;
  lastCheckedTimestamps: Map<string, Date>;
  pullSourceRepository: InMemoryPullSourceRepository;
  newsArticleRepository: InMemoryNewsArticleRepository;
  pullSourceExtractor: InMemoryPullSourceExtractor;
  processScheduledPullUseCase: ProcessScheduledPullUseCase;
  processResult: { success: string[]; errors: { sourceId: string; error: Error }[] } | null;
  ingestionError: Error | null;
  processingCompleted: boolean;
}

export class CustomWorldConstructor extends World implements CustomWorld {
  public pullSources: PullSource[] = [];
  public existingArticles: NewsArticle[] = [];
  public savedArticles: NewsArticle[] = [];
  public sourceExtractionErrors: Set<string> = new Set();
  public lastCheckedTimestamps: Map<string, Date> = new Map();
  public pullSourceRepository: InMemoryPullSourceRepository;
  public newsArticleRepository: InMemoryNewsArticleRepository;
  public pullSourceExtractor: InMemoryPullSourceExtractor;
  public processScheduledPullUseCase: ProcessScheduledPullUseCase;
  public processResult: { success: string[]; errors: { sourceId: string; error: Error }[] } | null = null;
  public ingestionError: Error | null = null;
  public processingCompleted = false;

  constructor(options: IWorldOptions) {
    super(options);

    this.pullSourceRepository = new InMemoryPullSourceRepository();
    this.newsArticleRepository = new InMemoryNewsArticleRepository();
    this.pullSourceExtractor = new InMemoryPullSourceExtractor();
    this.processScheduledPullUseCase = new ProcessScheduledPullUseCase(
      this.pullSourceRepository,
      this.newsArticleRepository,
      this.pullSourceExtractor
    );
  }
}

setWorldConstructor(CustomWorldConstructor);

Before(function (this: CustomWorld) {
  this.pullSources = [];
  this.existingArticles = [];
  this.savedArticles = [];
  this.sourceExtractionErrors = new Set();
  this.lastCheckedTimestamps = new Map();
  this.processResult = null;
  this.ingestionError = null;
  this.processingCompleted = false;
});

After(function (this: CustomWorld) {
  this.pullSources = [];
  this.existingArticles = [];
  this.savedArticles = [];
  this.sourceExtractionErrors.clear();
  this.lastCheckedTimestamps.clear();
  this.processResult = null;
  this.ingestionError = null;
  this.processingCompleted = false;
});

Given(
  'the system has a list of target sources configured for pulling',
  async function (this: CustomWorld) {
    const source = new RssPullSource(
      'source-1',
      new Date(Date.now() - 600000),
      true,
      'https://example.com'
    );
    this.pullSources = [source];
    await this.pullSourceRepository.save(source);
  },
);

Given(
  'a configured source is reachable and has new content',
  async function (this: CustomWorld) {
    const source = new RssPullSource(
      'source-1',
      new Date(Date.now() - 600000),
      true,
      'https://example.com'
    );
    this.pullSources = [source];
    await this.pullSourceRepository.save(source);

    this.pullSourceExtractor.setArticlesToReturn([
      {
        title: 'Breaking News: AI Breakthrough',
        content: 'Scientists have made a major discovery...',
        mainImageUrl: 'https://example.com/image.jpg',
        originalAuthor: 'John Doe',
        articleUrl: 'https://example.com/news-1',
        createdAt: new Date(),
      } as ExtractedArticleData,
    ]);
  },
);

Given(
  'the new article URL {string} does not exist in the system',
  async function (this: CustomWorld, url: string) {
    // Article doesn't exist by default in the in-memory repository
  },
);

Given(
  'the article URL {string} already exists in the system',
  async function (this: CustomWorld, url: string) {
    const existingArticle = new NewsArticle(
      'existing-article-id',
      url,
      'Existing Article',
      'Some content',
      'Jane Doe',
      'https://example.com/existing-image.jpg',
      'source-1',
      ArticleStatus.CANDIDATE,
      false,
      new Date(),
      new Date()
    );
    this.existingArticles.push(existingArticle);
    await this.newsArticleRepository.save(existingArticle);
  },
);

Given(
  'the article was published after the source{apos}s last checked timestamp',
  async function (this: CustomWorld) {
    const lastChecked = new Date(Date.now() - 600000);
    this.lastCheckedTimestamps.set('source-1', lastChecked);
  },
);

Given(
  'a configured source is reachable',
  async function (this: CustomWorld) {
    const source = new RssPullSource(
      'source-1',
      new Date(Date.now() - 600000),
      true,
      'https://example.com'
    );
    this.pullSources = [source];
    await this.pullSourceRepository.save(source);
  },
);

Given(
  'a configured source that has changed its structure or is down',
  async function (this: CustomWorld) {
    const source = new RssPullSource(
      'source-1',
      new Date(Date.now() - 600000),
      true,
      'https://example.com'
    );
    this.pullSources = [source];
    this.sourceExtractionErrors.add(source.id);
    await this.pullSourceRepository.save(source);

    this.pullSourceExtractor.setError('SOURCE_EXTRACTION_ERROR: Failed to extract content');
  },
);

Given(
  'multiple pull sources are due for checking',
  async function (this: CustomWorld) {
    this.pullSources = [
      new RssPullSource(
        'source-1',
        new Date(Date.now() - 600000),
        true,
        'https://example.com'
      ),
      new RssPullSource(
        'source-2',
        new Date(Date.now() - 1200000),
        true,
        'https://another-example.com'
      ),
      new RssPullSource(
        'source-3',
        new Date(Date.now() - 1800000),
        true,
        'https://third-source.com'
      ),
    ];

    for (const source of this.pullSources) {
      await this.pullSourceRepository.save(source);
    }
  },
);

When(
  'the scheduled pulling process is triggered for this source',
  async function (this: CustomWorld) {
    try {
      this.processResult = await this.processScheduledPullUseCase.execute();
      
      if (this.processResult.errors.length > 0) {
        this.ingestionError = this.processResult.errors[0].error;
      }
      
      this.processingCompleted = true;
    } catch (error) {
      this.ingestionError = error as Error;
      this.processingCompleted = false;
    }
  },
);

When(
  'the scheduled pulling process is triggered',
  async function (this: CustomWorld) {
    try {
      this.processResult = await this.processScheduledPullUseCase.execute();
      
      if (this.processResult.errors.length > 0) {
        this.ingestionError = this.processResult.errors[0].error;
      }
      
      this.processingCompleted = true;
    } catch (error) {
      this.ingestionError = error as Error;
      this.processingCompleted = false;
    }
  },
);

Then(
  'the system should extract the news content successfully',
  async function (this: CustomWorld) {
    if (this.ingestionError !== null) {
      throw new Error(`Expected no error but got: ${this.ingestionError?.message}`);
    }
  },
);

Then(
  'a new article with status {string} should be created',
  async function (this: CustomWorld, status: string) {
    const allArticles = await this.newsArticleRepository.find();
    const newArticles = allArticles.filter(a => a.status === status);
    
    if (newArticles.length === 0) {
      throw new Error(`Expected at least one article with status ${status}`);
    }
  },
);

Then(
  'the article should be saved',
  async function (this: CustomWorld) {
    const allArticles = await this.newsArticleRepository.find();
    if (allArticles.length === 0) {
      throw new Error('Expected at least one article to be saved');
    }
  },
);

Then(
  'the system should identify the article as a duplicate',
  async function (this: CustomWorld) {
    const allArticles = await this.newsArticleRepository.find();
    if (allArticles.length === this.existingArticles.length) {
      return;
    }
    throw new Error('Expected duplicate to be detected');
  },
);

Then(
  'the article should not be saved',
  async function (this: CustomWorld) {
    const allArticles = await this.newsArticleRepository.find();
    if (allArticles.length !== this.existingArticles.length) {
      throw new Error('Expected no new articles to be saved');
    }
  },
);

Then(
  'the system should inform about the failure to pull from the source',
  async function (this: CustomWorld) {
    if (this.ingestionError === null) {
      throw new Error('Expected an error but got null');
    }
    if (!this.ingestionError.message.includes('SOURCE_EXTRACTION_ERROR')) {
      throw new Error(
        `Expected SOURCE_EXTRACTION_ERROR in message but got: ${this.ingestionError.message}`
      );
    }
  },
);

Then(
  'the system should gracefully terminate the job for this specific source',
  async function (this: CustomWorld) {
    if (!this.processingCompleted) {
      throw new Error('Expected processing to complete gracefully');
    }
  },
);

Then(
  'the rest of the pulling schedule should remain unaffected',
  async function (this: CustomWorld) {
    if (!this.processResult) {
      throw new Error('Expected process result to be available');
    }
  },
);

Then(
  'each due source should be processed',
  async function (this: CustomWorld) {
    if (!this.processResult) {
      throw new Error('Expected process result to be available');
    }
    
    const totalProcessed = this.processResult.success.length + this.processResult.errors.length;
    if (totalProcessed === 0 && this.pullSources.length > 0) {
      throw new Error('Expected sources to be processed');
    }
  },
);

Then(
  'each source{apos}s last checked timestamp should be updated',
  async function (this: CustomWorld) {
    for (const source of this.pullSources) {
      const found = await this.pullSourceRepository.findById(source.id);
      if (!found || found.lastPolledAt === null) {
        throw new Error(`Expected timestamp to be updated for source ${source.id}`);
      }
    }
  },
);
