import type { NewUser, User } from './domain/user';

/**
 * Persistence PORT. Abstract class (not an interface) so it doubles as the DI token.
 * Adapters: `infrastructure/mongoose` (production) and `infrastructure/in-memory` (tests).
 * Services depend on this, never on an adapter or on Mongoose.
 */
export abstract class UsersRepository {
  /** @throws EmailAlreadyTakenError when the (normalised) email already exists. */
  abstract create(data: NewUser): Promise<User>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract setRefreshTokenHash(id: string, hash: string | null): Promise<void>;
  /**
   * Atomic compare-and-swap used by refresh-token rotation: only replaces the hash if it still
   * equals `expected`. Returns false when another request already rotated it (reuse/race).
   */
  abstract rotateRefreshTokenHash(id: string, expected: string, next: string): Promise<boolean>;
}
