import { Navigate, Outlet, useLocation } from 'react-router';
import { FullPageSpinner } from '@/components/full-page-spinner';
import { useAuth } from '../auth-context';

/** Only signed-in users; others go to /signin and come back afterwards. */
export function RequireAuth() {
  const { state } = useAuth();
  const location = useLocation();
  if (state.status === 'loading') return <FullPageSpinner />;
  if (state.status === 'unauthenticated') {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/** Sign-in / sign-up pages: a signed-in user has no business there. */
export function RedirectIfAuthenticated() {
  const { state } = useAuth();
  if (state.status === 'loading') return <FullPageSpinner />;
  if (state.status === 'authenticated') return <Navigate to="/app" replace />;
  return <Outlet />;
}
