export class DbError extends Error {
  constructor() {
    super('We could not save or load this information. Please try again.');
    this.name = 'DbError';
  }
}

export function friendlyError(error: unknown): string {
  return error instanceof DbError ? error.message : 'Something went wrong. Please try again.';
}
