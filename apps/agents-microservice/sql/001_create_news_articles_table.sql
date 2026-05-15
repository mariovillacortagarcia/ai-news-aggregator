CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY,
  article_url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  main_image_url TEXT,
  pull_source_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('CANDIDATE', 'APPROVED', 'REJECTED')),
  notified BOOLEAN NOT NULL DEFAULT FALSE,
  generated_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
