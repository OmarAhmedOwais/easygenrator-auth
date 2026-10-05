import { apiFetch, refreshSession } from '@/api/client';
import type { AuthResponse, User } from '@/api/types';
import type { SignInValues, SignUpValues } from './schemas';

export const authApi = {
  signUp: (body: SignUpValues) =>
    apiFetch<AuthResponse>('/auth/signup', { method: 'POST', body, skipRefresh: true }),
  signIn: (body: SignInValues) =>
    apiFetch<AuthResponse>('/auth/signin', { method: 'POST', body, skipRefresh: true }),
  signOut: () => apiFetch<void>('/auth/signout', { method: 'POST', skipRefresh: true }),
  refresh: refreshSession,
  me: () => apiFetch<User>('/users/me'),
};
