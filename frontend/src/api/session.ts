/**
 * The access token lives in MEMORY only (never localStorage), so an XSS payload can't read a
 * long-lived credential out of storage. A page reload simply restores it from the httpOnly
 * refresh cookie via POST /api/auth/refresh.
 */
let accessToken: string | null = null;
type Listener = (token: string | null) => void;
const listeners = new Set<Listener>();

export const getAccessToken = (): string | null => accessToken;

export function setAccessToken(token: string | null): void {
  accessToken = token;
  listeners.forEach((l) => l(token));
}

export function onAccessTokenChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
