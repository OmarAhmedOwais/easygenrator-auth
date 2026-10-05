import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';
import { Providers } from '@/app/providers';
import { routes } from '@/app/router';

type Handler = (init: RequestInit | undefined) => { status: number; body?: unknown };

/**
 * Minimal fetch fake keyed by "METHOD /api/path". Unmatched requests fail loudly so a test
 * never passes by accident against an endpoint it didn't mean to call.
 */
export function mockApi(handlers: Record<string, Handler>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), 'http://localhost');
    const key = `${init?.method ?? 'GET'} ${url.pathname}`;
    const handler = handlers[key];
    if (!handler) throw new Error(`Unhandled request: ${key}`);
    const { status, body } = handler(init);
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export const user = {
  id: 'u1',
  email: 'jane@example.com',
  name: 'Jane Doe',
  createdAt: '2026-10-05T00:00:00.000Z',
};

export const authResponse = (token = 'access-1') => ({
  accessToken: token,
  tokenType: 'Bearer',
  expiresIn: 900,
  user,
});

export const noSession = { status: 401, body: { statusCode: 401, message: 'Session expired' } };

export function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
  return router;
}
