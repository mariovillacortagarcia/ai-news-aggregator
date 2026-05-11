import { ArgumentError } from '../errors/argument.error';

export abstract class PullSource {
  constructor(
    private readonly _id: string,
    private readonly _lastPolledAt: Date | null,
    private readonly _isActive: boolean,
  ) {
    if (!_id || _id.trim() === '') {
      throw new ArgumentError('PullSource id cannot be empty');
    }
  }

  get id(): string {
    return this._id;
  }

  get lastPolledAt(): Date | null {
    return this._lastPolledAt;
  }

  get isActive(): boolean {
    return this._isActive;
  }
}

export class RssPullSource extends PullSource {
  constructor(
    id: string,
    lastPolledAt: Date | null,
    isActive: boolean,
    private readonly _sourceUrl: string,
  ) {
    super(id, lastPolledAt, isActive);
    if (!_sourceUrl || _sourceUrl.trim() === '') {
      throw new ArgumentError('RssPullSource sourceUrl cannot be empty');
    }
  }

  get sourceUrl(): string {
    return this._sourceUrl;
  }
}

export class HtmlPullSource extends PullSource {
  constructor(
    id: string,
    lastPolledAt: Date | null,
    isActive: boolean,
    private readonly _sourceUrl: string,
    private readonly _classIdentifiers: {
      title: string;
      content: string;
      mainImageUrl: string;
      originalAuthor: string;
      createdAt: string;
    },
  ) {
    super(id, lastPolledAt, isActive);
    if (!_sourceUrl || _sourceUrl.trim() === '') {
      throw new ArgumentError('HtmlPullSource sourceUrl cannot be empty');
    }
    if (!_classIdentifiers) {
      throw new ArgumentError('HtmlPullSource classIdentifiers cannot be null');
    }
  }

  get sourceUrl(): string {
    return this._sourceUrl;
  }

  get classIdentifiers(): {
    title: string;
    content: string;
    mainImageUrl: string;
    originalAuthor: string;
    createdAt: string;
  } {
    return this._classIdentifiers;
  }
}
