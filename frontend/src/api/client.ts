/**
 * The one fetch wrapper. Every request goes through `apiFetch`, which:
 *  - prefixes the API base (same-origin `/api` by default) and sends cookies (`credentials`)
 *  - attaches `Authorization: Bearer <accessToken>` when a session exists
 *  - on 401, performs ONE single-flight refresh (concurrent callers share it) and replays the
 *    request once; if refresh fails the session is cleared and the app falls back to sign-in
 *  - normalises failures into `ApiError` and returns `undefined` for 204s
 */
import { ApiError, type ApiErrorBody } from './errors';
import { getAccessToken, setAccessToken } from './session';
import type { AuthResponse } from './types';

const API_BASE = `${(import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')}/api`;

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Skip the 401 -> refresh -> retry dance (used by the auth endpoints themselves). */
  skipRefresh?: boolean;
}

async function send<T>(path: string, { body, skipRefresh, headers, ...init }: RequestOptions) {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return { res, skipRefresh, parse: () => parse<T>(res) };
}

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data: unknown = text ? JSON.parse(text) : undefined;
  if (!res.ok) throw new ApiError(res.status, data as Partial<ApiErrorBody> | undefined);
  return data as T;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const first = await send<T>(path, options);
  if (first.res.status !== 401 || options.skipRefresh || !getAccessToken()) return first.parse();

  const refreshed = await refreshSession().catch(() => null);
  if (!refreshed) {
    setAccessToken(null);
    return first.parse(); // surfaces the original 401
  }
  return (await send<T>(path, options)).parse();
}

/* ------------------------------ refresh ------------------------------ */

let inFlight: Promise<AuthResponse> | null = null;

/**
 * Exchanges the refresh cookie for a new access token. Single-flight inside the tab, and
 * serialised ACROSS tabs with the Web Locks API: the backend rotates refresh tokens and treats a
 * replayed one as theft (revoking the session), so two tabs must never refresh concurrently with
 * the same cookie. Inside the lock the browser already sends the newest cookie.
 */
export function refreshSession(): Promise<AuthResponse> {
  inFlight ??= withCrossTabLock(async () => {
    const { res, parse } = await send<AuthResponse>('/auth/refresh', { method: 'POST' });
    const data = await parse();
    if (res.ok) setAccessToken(data.accessToken);
    return data;
  }).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

function withCrossTabLock<T>(fn: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
  return locks ? locks.request('auth-refresh', fn) : fn();
}
