import { useQuery } from '@tanstack/react-query';
import { LogOut, PartyPopper } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { BrandMark } from '@/components/brand-mark';
import { Button } from '@/components/ui/button';
import { authApi } from '../auth/api';
import { useAuth } from '../auth/auth-context';

export function AppPage() {
  const { state, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  // Hits the protected endpoint, proving the bearer token round-trip end to end.
  const me = useQuery({ queryKey: ['users', 'me'], queryFn: authApi.me });
  const user = me.data ?? state.user;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast.success('You have been signed out.');
    } finally {
      navigate('/signin', { replace: true });
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-indigo-50/70 to-background dark:from-indigo-950/30">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <BrandMark />
        <Button variant="outline" size="sm" onClick={handleSignOut} loading={signingOut}>
          {!signingOut && <LogOut className="size-4" aria-hidden />}
          Log out
        </Button>
      </header>

      <main className="mx-auto grid max-w-5xl place-items-center px-5 py-20">
        <section className="w-full max-w-xl rounded-2xl border border-border bg-card p-10 text-center shadow-xl shadow-indigo-500/5">
          <span className="mx-auto mb-6 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30">
            <PartyPopper className="size-7" aria-hidden />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to the application.</h1>
          {user && (
            <p className="mt-3 text-muted-foreground">
              Signed in as <span className="font-semibold text-foreground">{user.name}</span>{' '}
              <span className="text-sm">({user.email})</span>
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
