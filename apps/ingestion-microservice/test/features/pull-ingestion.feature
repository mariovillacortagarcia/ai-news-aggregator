Feature: Pull News Ingestion
  As a content aggregation platform
  I want to periodically pull news articles from sources like RSS feeds, HTML websites or legacy APIs
  So that I can gather news articles to be approved and published on the platform

  Background:
    Given the system has a list of target sources configured for pulling

  Scenario: Successfully pulling and extracting a new article
    Given a configured source is reachable and has new content
    And the new article URL "https://example.com/news-1" does not exist in the system
    And the article was published after the source's last checked timestamp
    When the scheduled pulling process is triggered for this source
    Then the system should extract the news content successfully
    And a new article with status "CANDIDATE" should be created
    And the article should be saved

  Scenario: Skipping articles that have already been pulled
    Given a configured source is reachable
    And the article URL "https://example.com/news-old" already exists in the system
    And the article was published after the source's last checked timestamp
    When the scheduled pulling process is triggered for this source
    Then the system should identify the article as a duplicate
    And the article should not be saved

  Scenario: Handling source structure changes or connection failures
    Given a configured source that has changed its structure or is down
    When the scheduled pulling process is triggered for this source
    Then the system should inform about the failure to pull from the source
    And the system should gracefully terminate the job for this specific source
    And the rest of the pulling schedule should remain unaffected

  Scenario: Processing multiple due sources in a single cycle
    Given multiple pull sources are due for checking
    When the scheduled pulling process is triggered
    Then each due source should be processed
    And each source's last checked timestamp should be updated