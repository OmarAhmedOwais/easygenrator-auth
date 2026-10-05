import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AppConfig } from '../../../config/configuration.js';
import type { AccessTokenPayload, AuthenticatedUser } from '../auth.types.js';

/**
 * Stateless access-token check (signature + expiry, HS256 pinned). No DB hit per request; the
 * 15-minute lifetime bounds how long a revoked session's access token stays usable.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('auth', { infer: true }).accessSecret,
      algorithms: ['HS256'],
    });
  }

  validate(payload: AccessTokenPayload): AuthenticatedUser {
    return { userId: payload.sub, email: payload.email };
  }
}
