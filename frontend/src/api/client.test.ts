import { describe, expect, it } from 'vitest';
import { authResponse, mockApi, noSession, user } from '@/test/utils';
import { apiFetch, refreshSession } from './client';
import { ApiError } from './errors';
import { getAccessToken, setAccessToken } from './session';

const authHeader = (init?: RequestInit) => new Headers(init?.headers).get('Authorization');

describe('apiFetch', () => {
  it('sends the bearer token and cookies', async () => {
    setAccessToken('t1');
    const fetchMock = mockApi({ 'GET /api/users/me': () => ({ status: 200, body: user }) });

    await expect(apiFetch('/users/me')).resolves.toEqual(user);
    const init = fetchMock.mock.calls[0][1];
    expect(authHeader(init)).toBe('Bearer t1');
    expect(init?.credentials).toBe('include');
  });

  it('on 401 refreshes once and replays the request with the new token', async () => {
    setAccessToken('expired');
    const fetchMock = mockApi({
      'GET /api/users/me': (init) =>
        authHeader(init) === 'Bearer fresh' ? { status: 200, body: user } : noSession,
      'POST /api/auth/refresh': () => ({ status: 200, body: authResponse('fresh') }),
    });

    await expect(apiFetch('/users/me')).resolves.toEqual(user);
    expect(getAccessToken()).toBe('fresh');
    expect(fetchMock).toHaveBeenCalledTimes(3); // original, refresh, replay
  });

  it('clears the session when refresh fails and surfaces the 401', async () => {
    setAccessToken('expired');
    mockApi({ 'GET /api/users/me': () => noSession, 'POST /api/auth/refresh': () => noSession });

    await expect(apiFetch('/users/me')).rejects.toMatchObject({ status: 401 });
    expect(getAccessToken()).toBeNull();
  });

  it('normalises validation errors into ApiError.messages', async () => {
    mockApi({
      'POST /api/auth/signup': () => ({
        status: 400,
        body: { statusCode: 400, error: 'Bad Request', message: ['a', 'b'] },
      }),
    });
    const err = await apiFetch('/auth/signup', { method: 'POST', body: {} }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).messages).toEqual(['a', 'b']);
  });
});

describe('refreshSession', () => {
  it('is single-flight: concurrent callers share one request', async () => {
    const fetchMock = mockApi({
      'POST /api/auth/refresh': () => ({ status: 200, body: authResponse() }),
    });
    await Promise.all([refreshSession(), refreshSession(), refreshSession()]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
