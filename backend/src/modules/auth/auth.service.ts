import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { EmailAlreadyTakenError } from '../users/domain/email-taken.error';
import { type PublicUser, toPublicUser, type User } from '../users/domain/user';
import { UsersRepository } from '../users/users.repository';
import type { SignInDto } from './dto/sign-in.dto';
import type { SignUpDto } from './dto/sign-up.dto';
import { PasswordHasher } from './password-hasher.service';
import { type TokenPair, TokensService } from './tokens.service';

export interface AuthSession {
  user: PublicUser;
  tokens: TokenPair;
}

const INVALID_CREDENTIALS = 'Invalid email or password';
const INVALID_SESSION = 'Session expired, please sign in again';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UsersRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokensService,
  ) {}

  async signUp(dto: SignUpDto): Promise<AuthSession> {
    const passwordHash = await this.hasher.hash(dto.password);
    let user: User;
    try {
      // No "find then insert": the unique index is the source of truth, so two concurrent
      // sign-ups with the same email can't both succeed.
      user = await this.users.create({ email: dto.email, name: dto.name, passwordHash });
    } catch (err) {
      if (err instanceof EmailAlreadyTakenError) throw new ConflictException(err.message);
      throw err;
    }
    this.logger.log({ userId: user.id }, 'User signed up');
    return this.startSession(user);
  }

  async signIn(dto: SignInDto): Promise<AuthSession> {
    const user = await this.users.findByEmail(dto.email);
    // Always run a verify (dummy hash for unknown emails) so response time doesn't reveal
    // which emails are registered; one generic message for both failure modes.
    const ok = await this.hasher.verify(user?.passwordHash, dto.password);
    if (!user || !ok) {
      this.logger.warn('Failed sign-in attempt');
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    return this.startSession(user);
  }

  /**
   * Refresh-token rotation with reuse detection. Each refresh token works exactly once: a
   * compare-and-swap replaces its hash with the new one. Presenting an already-rotated token
   * means it was stolen or replayed, so the whole session is revoked.
   */
  async refresh(refreshToken: string | undefined): Promise<AuthSession> {
    if (!refreshToken) throw new UnauthorizedException(INVALID_SESSION);

    const payload = await this.tokens.verifyRefresh(refreshToken).catch(() => {
      throw new UnauthorizedException(INVALID_SESSION);
    });

    const user = await this.users.findById(payload.sub);
    if (!user?.refreshTokenHash) throw new UnauthorizedException(INVALID_SESSION);

    const next = await this.tokens.issuePair(user.id, user.email);
    const rotated = await this.users.rotateRefreshTokenHash(
      user.id,
      this.tokens.hash(refreshToken),
      this.tokens.hash(next.refreshToken),
    );
    if (!rotated) {
      await this.users.setRefreshTokenHash(user.id, null);
      this.logger.warn({ userId: user.id }, 'Refresh token reuse detected - session revoked');
      throw new UnauthorizedException(INVALID_SESSION);
    }
    return { user: toPublicUser(user), tokens: next };
  }

  /** Idempotent: an invalid/missing token still "succeeds" - there is nothing to revoke. */
  async signOut(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    const payload = await this.tokens.verifyRefresh(refreshToken).catch(() => null);
    if (payload) await this.users.setRefreshTokenHash(payload.sub, null);
  }

  private async startSession(user: User): Promise<AuthSession> {
    const tokens = await this.tokens.issuePair(user.id, user.email);
    await this.users.setRefreshTokenHash(user.id, this.tokens.hash(tokens.refreshToken));
    return { user: toPublicUser(user), tokens };
  }
}
