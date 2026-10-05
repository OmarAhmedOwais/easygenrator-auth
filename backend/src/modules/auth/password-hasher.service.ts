import { Injectable, type OnModuleInit } from '@nestjs/common';
import * as argon2 from 'argon2';

/**
 * argon2id with OWASP-recommended parameters. Isolated behind a service so tests can stub
 * the (intentionally slow) hashing.
 */
@Injectable()
export class PasswordHasher implements OnModuleInit {
  private static readonly OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 19_456, // 19 MiB
    timeCost: 2,
    parallelism: 1,
  } satisfies argon2.HashOptions;

  /** Verified against when the email is unknown, so "no such user" costs the same time. */
  private dummyHash = '';

  async onModuleInit(): Promise<void> {
    this.dummyHash = await this.hash(`dummy-${Date.now()}-${Math.random()}`);
  }

  hash(plain: string): Promise<string> {
    return argon2.hash(plain, { ...PasswordHasher.OPTIONS, raw: false });
  }

  async verify(hash: string | undefined, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash ?? this.dummyHash, plain);
    } catch {
      return false;
    }
  }
}
