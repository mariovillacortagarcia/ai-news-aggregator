Feature: News Article Approval Logic
  As an administrator
  I want to review candidate news articles and decide whether to approve or reject them
  So that only relevant and high-quality news is processed by the AI agents

  Background:
    Given a news article exists in the repository with status "CANDIDATE"
    And the article has the title "Quantum Computing Breakthrough"

  Scenario: Successfully approving a candidate article
    When the administrator approves the article
    Then the article status should change to "APPROVED"
    And the article should be updated
    And the article should be available for downstream polling by the other microservices

  Scenario: Rejecting an irrelevant article
    When the administrator rejects the article
    Then the article status should change to "REJECTED"
    And the article should be updated
    And the article should NOT be available for downstream polling

  Scenario: Preventing approval of an already rejected article
    Given the article status is already "REJECTED"
    When the administrator attempts to approve the article
    Then the article status should remain "REJECTED"
    And an approval error should be recorded
    And the article should NOT be available for downstream polling
