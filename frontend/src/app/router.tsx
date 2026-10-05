import { createBrowserRouter, Navigate } from 'react-router';
import { RedirectIfAuthenticated, RequireAuth } from '@/features/auth/routes/guards';
import { SignInPage } from '@/features/auth/pages/sign-in-page';
import { SignUpPage } from '@/features/auth/pages/sign-up-page';
import { AppPage } from '@/features/home/app-page';
import { NotFoundPage } from '@/pages/not-found-page';

export const routes = [
  { path: '/', element: <Navigate to="/app" replace /> },
  {
    element: <RedirectIfAuthenticated />,
    children: [
      { path: '/signin', element: <SignInPage /> },
      { path: '/signup', element: <SignUpPage /> },
    ],
  },
  { element: <RequireAuth />, children: [{ path: '/app', element: <AppPage /> }] },
  { path: '*', element: <NotFoundPage /> },
];

export const router = createBrowserRouter(routes);
