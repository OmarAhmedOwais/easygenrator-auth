import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { isApiError } from '@/api/errors';
import { AuthProvider } from '@/features/auth/auth-context';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Retrying 4xx is pointless (and a 401 is already handled by the API client).
            retry: (count, error) => !(isApiError(error) && error.status < 500) && count < 2,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
