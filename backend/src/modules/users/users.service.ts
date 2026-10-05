import { Injectable, NotFoundException } from '@nestjs/common';
import { type PublicUser, toPublicUser } from './domain/user.js';
import { UsersRepository } from './users.repository.js';

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  async getProfile(id: string): Promise<PublicUser> {
    const user = await this.users.findById(id);
    // A valid token for a deleted user: treat as not found rather than leaking a 500.
    if (!user) throw new NotFoundException('User not found');
    return toPublicUser(user);
  }
}
