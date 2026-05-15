Feature: News article summary generation
  As a content manager
  I want approved news articles to be summarized automatically
  So that they are ready for the next stage of the pipeline

  Background:
    Given a news article exists in the repository with status "APPROVED"
    And the article has the title "Quantum Computing Breakthrough"
    And the article has the following content:
      """
      Scientists have achieved a significant breakthrough in quantum computing, enabling faster processing and improved stability.
      This advancement could revolutionize various industries, including cryptography, drug discovery, and artificial intelligence.
      The new quantum processor is expected to be commercially available within the next few years, promising to enhance computational capabilities and drive innovation across multiple sectors.
      """

  Scenario: Successfully generating a summary for an approved article
    When the scheduled summarization process runs
    Then a summary should be generated and attached to the article
    And the article should be marked as summarized

  Scenario: Skipping articles that are not approved
    Given a news article exists in the repository with status "CANDIDATE"
    When the scheduled summarization process runs
    Then the article should not be summarized

  Scenario: Skipping articles that already have a summary
    Given the approved article already has a generated summary
    When the scheduled summarization process runs
    Then the article should not be summarized again
