import { createHash, randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import type { AppConfig } from '../../config/configuration';
import type { AccessTokenPayload, RefreshTokenPayload } from './auth.types';

export interface TokenPair {
  accessToken: string;
  /** seconds */
  accessExpiresIn: number;
  refreshToken: string;
  /** milliseconds - feeds the cookie `maxAge` */
  refreshMaxAgeMs: number;
}

type Ttl = JwtSignOptions['expiresIn'];

@Injectable()
export class TokensService {
  private readonly auth: AppConfig['auth'];

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService<AppConfig, true>,
  ) {
    this.auth = config.get('auth', { infer: true });
  }

  async issuePair(userId: string, email: string): Promise<TokenPair> {
    const access: AccessTokenPayload = { sub: userId, email };
    const refresh: RefreshTokenPayload = { sub: userId, jti: randomUUID() };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(access, {
        secret: this.auth.accessSecret,
        expiresIn: this.auth.accessTtl as Ttl,
        algorithm: 'HS256',
      }),
      this.jwt.signAsync(refresh, {
        secret: this.auth.refreshSecret,
        expiresIn: this.auth.refreshTtl as Ttl,
        algorithm: 'HS256',
      }),
    ]);

    return {
      accessToken,
      accessExpiresIn: this.secondsLeft(accessToken),
      refreshToken,
      refreshMaxAgeMs: this.secondsLeft(refreshToken) * 1000,
    };
  }

  /** @throws if the signature is invalid or the token expired. */
  verifyRefresh(token: string): Promise<RefreshTokenPayload> {
    return this.jwt.verifyAsync<RefreshTokenPayload>(token, {
      secret: this.auth.refreshSecret,
      algorithms: ['HS256'],
    });
  }

  /**
   * Refresh tokens are high-entropy random-ish JWTs, so a fast sha256 is the right tool (a slow
   * KDF only matters for low-entropy secrets like passwords). A DB leak alone can't mint sessions.
   */
  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private secondsLeft(token: string): number {
    const { exp } = this.jwt.decode<{ exp: number }>(token);
    return Math.max(0, exp - Math.floor(Date.now() / 1000));
  }
}
