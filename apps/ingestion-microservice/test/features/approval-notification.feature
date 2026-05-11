Feature: Periodic News Approval Notification
  As the ingestion microservice
  I want to periodically pull pending news articles to notify the administrators
  So that they can review and approve news in batches via Telegram

  Background:
    Given the notification system is configured with a valid Telegram bot token and administrators @usernames
    And the system is scheduled to run the notification process every hour
    And there are articles in the repository with different statuses

  Scenario: Sending a batch notification for pending candidates
    Given there are 5 articles with status "CANDIDATE"
    And 3 of those articles have not been notified yet
    When the scheduled notification process is triggered
    Then a notification should be sent to the administrator
    And the message should contain details for the 3 pending articles
    And those 3 articles should be marked as "notified"

  Scenario: No notification sent when all candidates are already notified
    Given there are 2 articles with status "CANDIDATE"
    And all of them have already been marked as "notified"
    When the scheduled notification process is triggered
    Then no notification should be sent to the administrator

  Scenario: No notification sent when there are no candidate articles
    Given there are 0 articles with status "CANDIDATE"
    When the scheduled notification process is triggered
    Then no notification should be sent to the administrator
