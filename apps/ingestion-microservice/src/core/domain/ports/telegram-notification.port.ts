export interface ArticleNotificationData {
  articleId: string;
  title: string;
  articleUrl: string;
  mainImageUrl: string;
  originalAuthor: string;
}

export interface TelegramNotificationPort {
  sendBatchNotification(articles: ArticleNotificationData[]): Promise<void>;
}
