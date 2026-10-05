/** Raised by any adapter when the unique email constraint is violated. */
export class EmailAlreadyTakenError extends Error {
  constructor() {
    super('Email already registered');
    this.name = 'EmailAlreadyTakenError';
  }
}
