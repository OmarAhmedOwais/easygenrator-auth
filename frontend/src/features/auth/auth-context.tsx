import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { onAccessTokenChange, setAccessToken } from '@/api/session';
import type { AuthResponse, User } from '@/api/types';
import { authApi } from './api';
import type { SignInValues, SignUpValues } from './schemas';

export type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated'; user: null };

interface AuthContextValue extends Readonly<{ state: AuthState }> {
  signIn: (values: SignInValues) => Promise<void>;
  signUp: (values: SignUpValues) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null });

  const adopt = useCallback((res: AuthResponse) => {
    setAccessToken(res.accessToken);
    setState({ status: 'authenticated', user: res.user });
  }, []);

  // Restore the session on load from the httpOnly refresh cookie.
  useEffect(() => {
    let active = true;
    authApi
      .refresh()
      .then((res) => active && adopt(res))
      .catch(() => active && setState({ status: 'unauthenticated', user: null }));
    return () => {
      active = false;
    };
  }, [adopt]);

  // If the API client gives up on a session (refresh failed), drop to signed-out everywhere.
  useEffect(
    () =>
      onAccessTokenChange((token) => {
        if (token === null) setState({ status: 'unauthenticated', user: null });
      }),
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      signIn: async (values) => adopt(await authApi.signIn(values)),
      signUp: async (values) => adopt(await authApi.signUp(values)),
      signOut: async () => {
        try {
          await authApi.signOut();
        } finally {
          setAccessToken(null);
          queryClient.clear(); // no cached data from this user survives sign-out
        }
      },
    }),
    [state, adopt, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
