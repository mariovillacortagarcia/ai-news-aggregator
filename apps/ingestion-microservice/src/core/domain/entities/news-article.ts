import { ArgumentError } from '../errors/argument.error';

export enum ArticleStatus {
  CANDIDATE = 'CANDIDATE',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class NewsArticle {
  constructor(
    private readonly _id: string,
    private readonly _articleUrl: string,
    private readonly _title: string,
    private readonly _content: string,
    private readonly _author: string,
    private readonly _mainImageUrl: string,
    private readonly _pullSourceId: string,
    private _status: ArticleStatus = ArticleStatus.CANDIDATE,
    private _notified: boolean = false,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {
    if (!_id || _id.trim() === '') {
      throw new ArgumentError('NewsArticle id cannot be empty');
    }
    if (!_articleUrl || _articleUrl.trim() === '') {
      throw new ArgumentError('NewsArticle articleUrl cannot be empty');
    }
    if (!_title || _title.trim() === '') {
      throw new ArgumentError('NewsArticle title cannot be empty');
    }
    if (!_content || _content.trim() === '') {
      throw new ArgumentError('NewsArticle content cannot be empty');
    }
    if (!_author || _author.trim() === '') {
      throw new ArgumentError('NewsArticle author cannot be empty');
    }
    if (!_mainImageUrl || _mainImageUrl.trim() === '') {
      throw new ArgumentError('NewsArticle mainImageUrl cannot be empty');
    }
    if (!_pullSourceId || _pullSourceId.trim() === '') {
      throw new ArgumentError('NewsArticle pullSourceId cannot be empty');
    }
    if (!Object.values(ArticleStatus).includes(_status)) {
      throw new ArgumentError('Invalid ArticleStatus');
    }
    if (!_createdAt) {
      throw new ArgumentError('NewsArticle createdAt cannot be null');
    }
    if (!_updatedAt) {
      throw new ArgumentError('NewsArticle updatedAt cannot be null');
    }
  }

  get id(): string {
    return this._id;
  }

  get articleUrl(): string {
    return this._articleUrl;
  }

  get title(): string {
    return this._title;
  }

  get content(): string {
    return this._content;
  }

  get author(): string {
    return this._author;
  }

  get mainImageUrl(): string {
    return this._mainImageUrl;
  }

  get pullSourceId(): string {
    return this._pullSourceId;
  }

  get status(): ArticleStatus {
    return this._status;
  }

  get notified(): boolean {
    return this._notified;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  notify(): void {
    this._notified = true;
    this._updatedAt = new Date();
  }

  approve(): void {
    if (this._status === ArticleStatus.REJECTED) {
      throw new ArgumentError('Cannot approve an article with status REJECTED');
    }
    if (this._status === ArticleStatus.APPROVED) {
      throw new ArgumentError('Cannot approve an article with status APPROVED');
    }
    this._status = ArticleStatus.APPROVED;
    this._updatedAt = new Date();
  }

  reject(): void {
    if (this._status === ArticleStatus.APPROVED) {
      throw new ArgumentError('Cannot reject an article with status APPROVED');
    }
    if (this._status === ArticleStatus.REJECTED) {
      throw new ArgumentError('Cannot reject an article with status REJECTED');
    }
    this._status = ArticleStatus.REJECTED;
    this._updatedAt = new Date();
  }
}
