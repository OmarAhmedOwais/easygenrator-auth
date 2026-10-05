/**
 * Persistence-agnostic user record. Nothing in here knows about Mongoose; adapters map
 * their own documents to and from this shape.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  /** sha256 of the currently valid refresh token; null when signed out. */
  refreshTokenHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type NewUser = Pick<User, 'email' | 'name' | 'passwordHash'>;

/** What may leave the API. Secrets (hashes) are structurally impossible to serialise. */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export const toPublicUser = (u: User): PublicUser => ({
  id: u.id,
  email: u.email,
  name: u.name,
  createdAt: u.createdAt,
});
