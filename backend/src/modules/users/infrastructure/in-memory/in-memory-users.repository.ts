import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { EmailAlreadyTakenError } from '../../domain/email-taken.error';
import type { NewUser, User } from '../../domain/user';
import { UsersRepository } from '../../users.repository';

/**
 * Same contract as the Mongo adapter, backed by a Map. Used by e2e tests (no DB needed) and
 * selectable with DB_DRIVER=memory for a zero-dependency demo. Not for production.
 */
@Injectable()
export class InMemoryUsersRepository extends UsersRepository {
  private readonly users = new Map<string, User>();

  create(data: NewUser): Promise<User> {
    if ([...this.users.values()].some((u) => u.email === data.email)) {
      return Promise.reject(new EmailAlreadyTakenError());
    }
    const now = new Date();
    const user: User = {
      ...data,
      id: randomUUID(),
      refreshTokenHash: null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(user.id, user);
    return Promise.resolve({ ...user });
  }

  findById(id: string): Promise<User | null> {
    const u = this.users.get(id);
    return Promise.resolve(u ? { ...u } : null);
  }

  findByEmail(email: string): Promise<User | null> {
    const u = [...this.users.values()].find((x) => x.email === email);
    return Promise.resolve(u ? { ...u } : null);
  }

  setRefreshTokenHash(id: string, hash: string | null): Promise<void> {
    const u = this.users.get(id);
    if (u) this.users.set(id, { ...u, refreshTokenHash: hash, updatedAt: new Date() });
    return Promise.resolve();
  }

  rotateRefreshTokenHash(id: string, expected: string, next: string): Promise<boolean> {
    const u = this.users.get(id);
    if (!u || u.refreshTokenHash !== expected) return Promise.resolve(false);
    this.users.set(id, { ...u, refreshTokenHash: next, updatedAt: new Date() });
    return Promise.resolve(true);
  }
}
