CREATE INDEX IF NOT EXISTS idx_news_articles_status
ON news_articles (status);

CREATE INDEX IF NOT EXISTS idx_news_articles_approved_unsummarized
ON news_articles (status)
WHERE status = 'APPROVED' AND generated_summary IS NULL;
