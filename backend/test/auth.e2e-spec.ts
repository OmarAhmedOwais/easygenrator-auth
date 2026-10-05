import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

/**
 * Full HTTP flow through the real app (same `configureApp` as production).
 * Env defaults come from vitest.config.e2e.ts (in-memory adapter unless DB_DRIVER=mongo).
 */
const cookieFrom = (res: request.Response): string => {
  const raw = res.headers['set-cookie'] as unknown as string[] | undefined;
  const cookie = raw?.find((c) => c.startsWith('refresh_token='));
  if (!cookie) throw new Error('no refresh cookie');
  return cookie.split(';')[0];
};

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const user = { email: 'Jane.Doe@Example.com', name: 'Jane Doe', password: 'Passw0rd!' };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule.forRoot()] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    if (process.env.DB_DRIVER === 'mongo') {
      const conn = app.get<Connection>(getConnectionToken());
      await conn.dropDatabase();
      await conn.syncIndexes();
    }
  });

  afterAll(() => app.close());

  describe('POST /api/auth/signup', () => {
    it.each([
      ['invalid email', { ...user, email: 'nope' }, 'Please provide a valid email address'],
      ['short name', { ...user, name: 'ab' }, 'Name must be between 3 and 50 characters'],
      ['short password', { ...user, password: 'Pa1!' }, 'Password must be at least 8'],
      ['no number', { ...user, password: 'Password!' }, 'one number'],
      ['no letter', { ...user, password: '12345678!' }, 'one letter'],
      ['no special char', { ...user, password: 'Password1' }, 'special character'],
    ])('400 on %s', async (_label, body, expected) => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(body)
        .expect(400);
      expect(res.body.message.join(' ')).toContain(expected);
    });

    it('400 on unknown properties (mass-assignment guard)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({ ...user, role: 'admin' })
        .expect(400);
      expect(res.body.message).toContain('property role should not exist');
    });

    it('201 creates the user, sets an httpOnly refresh cookie, never returns secrets', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(user)
        .expect(201);

      expect(res.body).toMatchObject({
        tokenType: 'Bearer',
        expiresIn: expect.any(Number),
        accessToken: expect.any(String),
        user: { email: 'jane.doe@example.com', name: 'Jane Doe' },
      });
      expect(JSON.stringify(res.body)).not.toMatch(/password|hash/i);

      const setCookie = (res.headers['set-cookie'] as unknown as string[]).join(';');
      expect(setCookie).toMatch(/refresh_token=/);
      expect(setCookie).toMatch(/HttpOnly/i);
      expect(setCookie).toMatch(/SameSite=Strict/i);
      expect(setCookie).toMatch(/Path=\/api\/auth/);
    });

    it('409 on duplicate email (case-insensitive)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({ ...user, email: 'JANE.DOE@example.com' })
        .expect(409);
    });
  });

  describe('POST /api/auth/signin', () => {
    it('200 with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({ email: user.email, password: user.password })
        .expect(200);
      expect(res.body.accessToken).toEqual(expect.any(String));
    });

    it.each([
      ['wrong password', { email: user.email, password: 'Wrong-pass1' }],
      ['unknown email', { email: 'ghost@example.com', password: user.password }],
    ])('401 with the same message on %s', async (_l, body) => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send(body)
        .expect(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('400 rejects NoSQL operator injection', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({ email: { $gt: '' }, password: { $gt: '' } })
        .expect(400);
    });
  });

  describe('protected GET /api/users/me', () => {
    it('401 without a token', () => request(app.getHttpServer()).get('/api/users/me').expect(401));

    it('401 with a tampered token', () =>
      request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.bad')
        .expect(401));

    it('200 with a valid token', async () => {
      const signin = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({ email: user.email, password: user.password });

      const res = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${signin.body.accessToken}`)
        .expect(200);
      expect(res.body).toEqual({
        id: expect.any(String),
        email: 'jane.doe@example.com',
        name: 'Jane Doe',
        createdAt: expect.any(String),
      });
    });
  });

  describe('session lifecycle: refresh rotation + sign out', () => {
    it('rotates the cookie, rejects replay, and signs out', async () => {
      const server = app.getHttpServer();
      const signin = await request(server)
        .post('/api/auth/signin')
        .send({ email: user.email, password: user.password })
        .expect(200);
      const first = cookieFrom(signin);

      const refreshed = await request(server)
        .post('/api/auth/refresh')
        .set('Cookie', first)
        .expect(200);
      const second = cookieFrom(refreshed);
      expect(second).not.toBe(first);
      expect(refreshed.body.accessToken).toEqual(expect.any(String));

      // Replaying the first (already rotated) cookie is rejected and revokes the session.
      await request(server).post('/api/auth/refresh').set('Cookie', first).expect(401);
      await request(server).post('/api/auth/refresh').set('Cookie', second).expect(401);

      // A fresh sign-in, then sign-out kills that session too.
      const again = cookieFrom(
        await request(server)
          .post('/api/auth/signin')
          .send({ email: user.email, password: user.password }),
      );
      await request(server).post('/api/auth/signout').set('Cookie', again).expect(204);
      await request(server).post('/api/auth/refresh').set('Cookie', again).expect(401);
    });

    it('401 on refresh without a cookie', () =>
      request(app.getHttpServer()).post('/api/auth/refresh').expect(401));
  });

  it('GET /api/health is public', () =>
    request(app.getHttpServer()).get('/api/health').expect(200));

  it('sets security headers (helmet) and a request id', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-request-id']).toEqual(expect.any(String));
  });
});
