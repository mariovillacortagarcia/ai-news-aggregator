export class ArticleNotFoundError extends Error {
  constructor(articleId: string) {
    super(`Article with id "${articleId}" not found`);
    this.name = 'ArticleNotFoundError';
  }
}
