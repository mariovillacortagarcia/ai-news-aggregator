# news-article

Shared library for news article domain entities and infrastructure adapters.

## Structure

```
libs/news-article/src/
├── core/
│   └── domain/
│       ├── entities/          # Domain entities (NewsArticle, ArticleStatus)
│       ├── ports/             # Repository interfaces
│       ├── errors/            # Domain errors
│       └── test/              # Domain tests and mocks
└── infrastructure/
    ├── adapters/              # Infrastructure adapters (Supabase)
    ├── config/                # Configuration providers
    └── di/                    # Dependency injection modules
```

## Exports

### Domain

- `NewsArticle` - Core domain entity
- `ArticleStatus` - Article status enum (CANDIDATE, APPROVED, REJECTED)
- `NewsArticleRepositoryPort` - Repository interface
- `ArticleNotFoundError` - Error thrown when article not found
- `ArgumentError` - Validation error

### Infrastructure

- `NewsArticleSupabaseClientProvider` - Supabase client provider
- `SupabaseNewsArticleRepository` - Supabase implementation of repository
- `NewsArticlePersistenceModule` - NestJS module for persistence

## Usage

```typescript
import { NewsArticle, NewsArticleRepositoryPort, NewsArticlePersistenceModule } from '@ai-news-aggregator/news-article';

@Module({
  imports: [NewsArticlePersistenceModule],
})
export class MyModule {}
```

## Configuration

The Supabase provider requires the following environment variables:

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- `SUPABASE_NEWS_ARTICLES_TABLE` - Table name (default: 'news_articles')

## Application Layer

Application use cases (ApproveArticleUseCase, RejectArticleUseCase, GetArticlesToNotifyUseCase) are specific to each microservice and are located in `apps/ingestion-microservice/src/core/application/use-cases/`.
