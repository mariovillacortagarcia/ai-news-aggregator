// Domain - Entities
export * from './core/domain/entities/news-article';

// Domain - Ports
export * from './core/domain/ports/news-article-repository.port';

// Domain - Errors
export * from './core/domain/errors/article-not-found.error';
export * from './core/domain/errors/argument.error';

// Domain - Test Mocks
export * from './core/domain/test/mocks/in-memory-news-article.repository';

// Infrastructure - Adapters
export * from './infrastructure/adapters/persistence/supabase-news-article.repository';

// Infrastructure - DI
export * from './infrastructure/di/persistence.module';

// Infrastructure - Config
export * from './infrastructure/config/supabase-client.provider';
