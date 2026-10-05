import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { authResponse, mockApi, noSession, renderApp, user } from '@/test/utils';

describe('route guards', () => {
  it('sends signed-out users from /app to the sign-in page', async () => {
    mockApi({ 'POST /api/auth/refresh': () => noSession });
    const router = renderApp('/app');
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/signin');
  });

  it('restores the session from the refresh cookie on load', async () => {
    mockApi({
      'POST /api/auth/refresh': () => ({ status: 200, body: authResponse() }),
      'GET /api/users/me': () => ({ status: 200, body: user }),
    });
    renderApp('/signin');
    expect(await screen.findByText('Welcome to the application.')).toBeInTheDocument();
  });
});

describe('sign up', () => {
  it('validates fields and shows live password rules', async () => {
    mockApi({ 'POST /api/auth/refresh': () => noSession });
    renderApp('/signup');
    const ue = userEvent.setup();

    await ue.click(await screen.findByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Name must be at least 3 characters')).toBeInTheDocument();

    await ue.type(screen.getByLabelText('Password'), 'abc1');
    expect(screen.getByText('At least one letter').closest('li')).toHaveAttribute(
      'data-passed',
      'true',
    );
    expect(screen.getByText('At least one number').closest('li')).toHaveAttribute(
      'data-passed',
      'true',
    );
    expect(screen.getByText('At least one special character').closest('li')).toHaveAttribute(
      'data-passed',
      'false',
    );
  });

  it('creates the account and lands on the application page', async () => {
    let body: unknown;
    mockApi({
      'POST /api/auth/refresh': () => noSession,
      'POST /api/auth/signup': (init) => {
        body = JSON.parse(String(init?.body));
        return { status: 201, body: authResponse() };
      },
      'GET /api/users/me': () => ({ status: 200, body: user }),
    });
    renderApp('/signup');
    const ue = userEvent.setup();

    await ue.type(await screen.findByLabelText('Email'), 'jane@example.com');
    await ue.type(screen.getByLabelText('Name'), 'Jane Doe');
    await ue.type(screen.getByLabelText('Password'), 'Passw0rd!');
    await ue.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Welcome to the application.')).toBeInTheDocument();
    expect(body).toEqual({ email: 'jane@example.com', name: 'Jane Doe', password: 'Passw0rd!' });
  });

  it('maps a 409 to the email field', async () => {
    mockApi({
      'POST /api/auth/refresh': () => noSession,
      'POST /api/auth/signup': () => ({
        status: 409,
        body: { statusCode: 409, message: 'Email already registered' },
      }),
    });
    renderApp('/signup');
    const ue = userEvent.setup();
    await ue.type(await screen.findByLabelText('Email'), 'jane@example.com');
    await ue.type(screen.getByLabelText('Name'), 'Jane Doe');
    await ue.type(screen.getByLabelText('Password'), 'Passw0rd!');
    await ue.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText(/already registered/)).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('sign in / log out', () => {
  it('shows the server error for bad credentials', async () => {
    mockApi({
      'POST /api/auth/refresh': () => noSession,
      'POST /api/auth/signin': () => ({
        status: 401,
        body: { statusCode: 401, message: 'Invalid email or password' },
      }),
    });
    renderApp('/signin');
    const ue = userEvent.setup();
    await ue.type(await screen.findByLabelText('Email'), 'jane@example.com');
    await ue.type(screen.getByLabelText('Password'), 'whatever');
    await ue.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });

  it('signs in, then logs out back to the sign-in page', async () => {
    const fetchMock = mockApi({
      'POST /api/auth/refresh': () => noSession,
      'POST /api/auth/signin': () => ({ status: 200, body: authResponse() }),
      'GET /api/users/me': () => ({ status: 200, body: user }),
      'POST /api/auth/signout': () => ({ status: 204 }),
    });
    const router = renderApp('/signin');
    const ue = userEvent.setup();
    await ue.type(await screen.findByLabelText('Email'), 'jane@example.com');
    await ue.type(screen.getByLabelText('Password'), 'Passw0rd!');
    await ue.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Welcome to the application.')).toBeInTheDocument();

    await ue.click(screen.getByRole('button', { name: /log out/i }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/signin'));
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/signout'),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
