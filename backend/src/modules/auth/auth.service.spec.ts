import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { InMemoryUsersRepository } from '../users/infrastructure/in-memory/in-memory-users.repository';
import { UsersRepository } from '../users/users.repository';
import { AuthService } from './auth.service';
import { PasswordHasher } from './password-hasher.service';
import { TokensService } from './tokens.service';

/**
 * Real TokensService + real in-memory repository (the port's reference adapter); only the slow
 * argon2 hasher is stubbed. This tests behaviour, not mock call counts.
 */
describe('AuthService', () => {
  let service: AuthService;
  let users: InMemoryUsersRepository;
  let hasher: { hash: jest.Mock; verify: jest.Mock };

  const signUp = { email: 'jane@example.com', name: 'Jane Doe', password: 'Passw0rd!' };

  beforeEach(async () => {
    hasher = {
      hash: jest.fn((p: string) => Promise.resolve(`hashed:${p}`)),
      verify: jest.fn((h: string | undefined, p: string) => Promise.resolve(h === `hashed:${p}`)),
    };
    const config = {
      get: () => ({
        accessSecret: 'a'.repeat(32),
        accessTtl: '15m',
        refreshSecret: 'r'.repeat(32),
        refreshTtl: '7d',
        cookieSecure: false,
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        TokensService,
        JwtService,
        { provide: ConfigService, useValue: config },
        { provide: PasswordHasher, useValue: hasher },
        { provide: UsersRepository, useClass: InMemoryUsersRepository },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
    users = moduleRef.get(UsersRepository);
  });

  describe('signUp', () => {
    it('stores a hash (never the password) and returns a session without secrets', async () => {
      const session = await service.signUp(signUp);

      const stored = await users.findByEmail(signUp.email);
      expect(stored?.passwordHash).toBe('hashed:Passw0rd!');
      expect(stored?.refreshTokenHash).toMatch(/^[a-f0-9]{64}$/);
      expect(session.user).toEqual({
        id: stored?.id,
        email: signUp.email,
        name: signUp.name,
        createdAt: expect.any(Date),
      });
      expect(session.user).not.toHaveProperty('passwordHash');
      expect(session.tokens.accessExpiresIn).toBeGreaterThan(890);
    });

    it('rejects a duplicate email with 409', async () => {
      await service.signUp(signUp);
      await expect(service.signUp(signUp)).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('signIn', () => {
    beforeEach(() => service.signUp(signUp));

    it('returns a session for valid credentials', async () => {
      const session = await service.signIn({ email: signUp.email, password: signUp.password });
      expect(session.user.email).toBe(signUp.email);
    });

    it('uses one generic error for wrong password and unknown email', async () => {
      const wrongPw = service.signIn({ email: signUp.email, password: 'nope' });
      const unknown = service.signIn({ email: 'ghost@example.com', password: signUp.password });

      await expect(wrongPw).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
      await expect(unknown).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
      // Unknown email still runs a verify (timing-attack mitigation).
      expect(hasher.verify).toHaveBeenCalledWith(undefined, signUp.password);
    });
  });

  describe('refresh', () => {
    it('rotates: the new token works, the old one is single-use', async () => {
      const { tokens } = await service.signUp(signUp);

      const rotated = await service.refresh(tokens.refreshToken);
      expect(rotated.tokens.refreshToken).not.toBe(tokens.refreshToken);

      await expect(service.refresh(rotated.tokens.refreshToken)).resolves.toBeDefined();
    });

    it('detects reuse of a rotated token and revokes the whole session', async () => {
      const { tokens } = await service.signUp(signUp);
      const rotated = await service.refresh(tokens.refreshToken);

      await expect(service.refresh(tokens.refreshToken)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      // The legitimate (latest) token is now dead too - the attacker and victim are both out.
      await expect(service.refresh(rotated.tokens.refreshToken)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it.each([undefined, 'not-a-jwt'])('rejects %p', async (token) => {
      await expect(service.refresh(token)).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('signOut', () => {
    it('revokes the refresh token', async () => {
      const { tokens } = await service.signUp(signUp);
      await service.signOut(tokens.refreshToken);
      await expect(service.refresh(tokens.refreshToken)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('is idempotent for missing/invalid tokens', async () => {
      await expect(service.signOut(undefined)).resolves.toBeUndefined();
      await expect(service.signOut('garbage')).resolves.toBeUndefined();
    });
  });
});
