export class SendNotificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SendNotificationError';
  }
}
