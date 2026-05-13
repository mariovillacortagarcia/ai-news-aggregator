# 📰 AI News Aggregator (Enterprise Backend)

![Status](https://img.shields.io/badge/Status-WIP-orange?style=for-the-badge)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Nx](https://img.shields.io/badge/Nx-143055?style=for-the-badge&logo=nx&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)

An Enterprise-grade automated news aggregator and AI-powered editorial system. Built with Domain-Driven Design (DDD) and Hexagonal Architecture inside an Nx monorepo.

## 🧠 System Architecture

This monorepo orchestrates three decoupled NestJS microservices that coordinate through persisted state in Supabase/PostgreSQL. Each downstream microservice polls the shared database for rows that became ready in the previous stage.

1. **📥 Ingestion Microservice**: Runs scheduled background jobs that reactively consume RSS feeds and periodically scrape configured HTML sources from Supabase/PostgreSQL (using HTTP fetch + Cheerio). Filters candidate articles and sends batch notifications via Telegram Bot for Human-in-the-Loop approval flow.
2. **🤖 Agentic Generation Microservice**: Powered by LangGraph and cost-efficient LLMs (GPT-4o-mini / Gemini 1.5 Flash). Polls approved articles from the shared database and runs them through an AI editorial room with two autonomous agents: a _Writer Agent_ (content generation) and a _Reviewer Agent_ (SEO and editorial guidelines enforcement).
3. **🚀 Publishing Microservice**: Polls approved editorial content from the shared database and publishes it to external CMS platforms (e.g., WordPress REST API) with rich metadata.

## 🛠️ Tech Stack & Patterns

- **Framework:** NestJS (TypeScript) inside an **Nx Monorepo**.
- **Architecture:** Hexagonal Architecture (Ports and Adapters) & Domain-Driven Design (DDD).
- **Communication:** DB polling between bounded contexts using persisted status transitions.
- **Scheduling:** **@nestjs/schedule** for cron-based background jobs (pull sources, notifications, approval polling).
- **Database:** **Supabase** (PostgreSQL) for state management and immutable backups.
- **AI Orchestration:** **LangGraph** (TypeScript ecosystem) generating Structured Outputs (JSON).
- **Deployment:** Hosted on **Railway** as continuous background worker processes.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Supabase project URL and keys
- OpenAI / Google Gemini API keys

### Installation & Execution

```bash

# Install dependencies

npm install

# Setup environment variables

# The repo already includes a .env file you can edit locally.

# Run microservices locally via Nx

npx nx serve ingestion-microservice
npx nx serve agents-microservice
npx nx serve publishing-microservice
```

## 📦 NPM Scripts (Ingestion Microservice)

For simplified development workflow, the following NPM scripts are available in the root `package.json`:

### Build & Start
```bash
npm run build:ingestion          # Build the microservice for production
npm run start:ingestion          # Build + start in production mode
npm run dev:ingestion            # Development mode with hot-reload
```

### Testing
```bash
npm run test:ingestion           # Run unit tests (123 tests)
npm run test:ingestion:watch     # Run tests in watch mode
npm run test:ingestion:coverage  # Run tests with coverage report
npm run e2e:ingestion            # Run E2E integration tests (3 tests)
npm run e2e:ingestion:watch      # Run E2E tests in watch mode
```

### Linting & BDD
```bash
npm run lint:ingestion           # Run ESLint on the codebase
npm run cucumber:ingestion       # Run BDD tests with Cucumber (3 feature files)
```

### Global Commands (All Microservices)
```bash
npm run build:all                # Build all projects in the monorepo
npm run test:all                 # Run tests for all projects
npm run e2e:all                  # Run E2E tests for all projects
```

### Recommended Workflows

**Daily Development:**
```bash
npm run dev:ingestion            # Start dev server with hot-reload
npm run test:ingestion:watch     # Auto-rerun tests on file changes
```

**Pre-Commit:**
```bash
npm run test:ingestion           # Quick unit tests
npm run lint:ingestion           # Code linting
```

**Pre-Deploy:**
```bash
npm run build:ingestion          # Production build
npm run e2e:ingestion            # Full E2E test suite
```

### Ingestion Pull Sources

Pull sources are configured in the database, not sent to the service through an
HTTP endpoint. The ingestion microservice runs a background scheduler every
`PULL_SOURCES_POLL_INTERVAL_MS` milliseconds, loads enabled due rows from the
`pull_sources` table and extracts article data using the configured selectors.

Default Supabase tables:

- `news_articles`: persisted candidate/approved/rejected articles.
- `pull_sources`: persisted polling configuration.

`pull_sources` expected columns:

| Column | Example |
|---|---|
| `id` | `techcrunch-ai` |
| `source_url` | `https://techcrunch.com/category/artificial-intelligence/` |
| `title_selector` | `h1` |
| `link_selector` | `link[rel="canonical"]` |
| `content_selector` | `article` |
| `main_image_url_selector` | `meta[property="og:image"]` |
| `original_author_selector` | `.byline a` |
| `enabled` | `true` |
| `check_interval_seconds` | `900` |
| `last_checked_at` | `null` |

Relevant env vars:

\`\`\`bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_NEWS_ARTICLES_TABLE=news_articles
SUPABASE_PULL_SOURCES_TABLE=pull_sources
PULL_SOURCES_POLL_INTERVAL_MS=300000
PULL_SOURCES_SCHEDULER_ENABLED=true
\`\`\`

### Telegram Bot

The ingestion microservice sends approval notifications through Telegram using
a scheduled scheduler. The notification process runs every hour (configurable)
and sends batches of pending candidate articles to the configured admin chat.

Required env vars:

```bash
TELEGRAM_BOT_TOKEN=...
TELEGRAM_ADMIN_CHAT_ID=<telegram-chat-id>
TELEGRAM_ADMIN_USER_IDS=<telegram-user-id>,<telegram-user-id>
```

Backward compatibility:

- `TELEGRAM_ADMIN_USER_IDS` is the preferred setting.
- `TELEGRAM_ADMIN_USER_ID` is still accepted as fallback for a single admin.

The approval/rejection flow is handled through Telegram inline buttons that
trigger use cases directly within the microservice.

## 🛡️ Architectural Decisions

- **DB Polling Between Micros:** The cross-microservice contract is persisted state, not message queues or HTTP calls. Ingestion leaves `NewsArticle` rows in `APPROVED`, Agents leaves `EditorialContent` rows in `APPROVED_BY_AGENT`, and Publishing polls those repositories on a schedule.
- **Hexagonal Isolation:** The core domain is strictly framework-agnostic. Swapping Supabase for MongoDB or WordPress for a social media integration requires zero changes to the core business rules.
- **Hybrid LLM Strategy:** Leverages small, fast, and cheap models tuned for structured outputs to handle massive text processing economically, saving larger models only for complex reasoning tasks.
- **Scheduled Jobs:** All background processes (RSS/HTML pulling, Telegram notifications, article approval polling) use @nestjs/schedule instead of message queues for simplicity and direct database coordination.

## 📊 Database Schema

### news_articles (ingestion → agents)
Managed by ingestion-microservice, consumed by agents-microservice.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `title` | TEXT | Article title |
| `article_url` | TEXT | Original article URL |
| `content` | TEXT | Article content |
| `main_image_url` | TEXT | Main image URL |
| `original_author` | TEXT | Original author name |
| `source_id` | TEXT | Source identifier |
| `status` | TEXT | CANDIDATE, APPROVED, REJECTED |
| `notified` | BOOLEAN | Telegram notification sent |
| `pending_generation` | BOOLEAN | **Agents polling flag** - true when APPROVED and waiting for AI generation |

### editorial_contents (agents → publishing)
Created by agents-microservice, consumed by publishing-microservice.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `source_article_id` | UUID | FK to news_articles |
| `source_title` | TEXT | Original article title |
| `source_content` | TEXT | Original article content |
| `main_image_url` | TEXT | Image URL |
| `original_author` | TEXT | Original author |
| `generated_title` | TEXT | AI-generated title |
| `generated_summary` | TEXT | AI-generated summary |
| `status` | TEXT | PENDING, GENERATING, REVIEWING, APPROVED_BY_AGENT, FAILED |
| `rewrite_attempts` | INTEGER | Number of rewrite attempts |
| `pending_publication` | BOOLEAN | **Publishing polling flag** - true when APPROVED_BY_AGENT |

### published_articles (publishing output)
Created by publishing-microservice for tracking.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `source_content_id` | UUID | FK to editorial_contents |
| `generated_title` | TEXT | Published title |
| `generated_summary` | TEXT | Published content |
| `main_image_url` | TEXT | Image URL |
| `original_author` | TEXT | Original author |
| `target` | TEXT | WORDPRESS |
| `status` | TEXT | PENDING, PUBLISHING, PUBLISHED, FAILED |
| `external_id` | TEXT | External CMS post ID |
| `attempts` | INTEGER | Publishing attempts |

### pull_sources (ingestion configuration)
Configuration for pull-based sources (HTML scraping).

| Column | Type | Description |
|---|---|---|
| `id` | TEXT | Unique identifier |
| `source_url` | TEXT | URL to scrape |
| `title_selector` | TEXT | CSS selector for title |
| `link_selector` | TEXT | CSS selector for canonical link |
| `content_selector` | TEXT | CSS selector for content |
| `main_image_url_selector` | TEXT | CSS selector for image |
| `original_author_selector` | TEXT | CSS selector for author |
| `enabled` | BOOLEAN | Enable/disable source |
| `check_interval_seconds` | INTEGER | Polling interval |
| `last_checked_at` | TIMESTAMPTZ | Last check timestamp |

## 🔧 Environment Variables

### Ingestion Microservice

\`\`\`bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_NEWS_ARTICLES_TABLE=news_articles
SUPABASE_PULL_SOURCES_TABLE=pull_sources

# Scheduler
PULL_SOURCES_POLL_INTERVAL_MS=300000
PULL_SOURCES_SCHEDULER_ENABLED=true

# Telegram Bot
TELEGRAM_BOT_TOKEN=...
TELEGRAM_ADMIN_CHAT_ID=<telegram-chat-id>
TELEGRAM_ADMIN_USER_IDS=<telegram-user-id>,<telegram-user-id>
\`\`\`

### Agents Microservice

\`\`\`bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_NEWS_ARTICLES_TABLE=news_articles
SUPABASE_EDITORIAL_CONTENTS_TABLE=editorial_contents

# Scheduler
APPROVED_ARTICLES_POLL_INTERVAL_MS=60000
APPROVED_ARTICLES_SCHEDULER_ENABLED=true

# LLM Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
GOOGLE_API_KEY=...
GOOGLE_MODEL=gemini-1.5-flash
LLM_PROVIDER=openai
\`\`\`

### Publishing Microservice

\`\`\`bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_EDITORIAL_CONTENTS_TABLE=editorial_contents
SUPABASE_PUBLISHED_ARTICLES_TABLE=published_articles

# Scheduler
APPROVED_CONTENT_POLL_INTERVAL_MS=60000
APPROVED_CONTENT_SCHEDULER_ENABLED=true

# WordPress CMS
WORDPRESS_URL=https://your-wordpress-site.com
WORDPRESS_USERNAME=your_username
WORDPRESS_APPLICATION_PASSWORD=your_app_password
\`\`\`

## 📦 Running Migrations

SQL migrations should be applied to your Supabase database in order:

```bash
# Via Supabase CLI
supabase db push

# Or manually via psql
psql -h db.xxx.supabase.co -U postgres -d postgres -f 001_add_pending_generation_to_news_articles.sql
psql -h db.xxx.supabase.co -U postgres -d postgres -f 002_create_editorial_contents_table.sql
psql -h db.xxx.supabase.co -U postgres -d postgres -f 003_create_published_articles_table.sql
```

Required tables:

- `news_articles`: managed by ingestion-microservice, consumed by agents-microservice
- `editorial_contents`: created by agents-microservice, consumed by publishing-microservice
- `published_articles`: created by publishing-microservice for tracking
- `pull_sources`: configuration for pull-based sources (HTML scraping)
