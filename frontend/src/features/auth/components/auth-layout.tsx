import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { BrandMark } from '@/components/brand-mark';

interface AuthLayoutProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
}

const highlights = [
  { icon: ShieldCheck, text: 'Passwords hashed with argon2id' },
  { icon: CheckCircle2, text: 'Short-lived tokens, rotating sessions' },
  { icon: Sparkles, text: 'Built with React, NestJS and MongoDB' },
];

/** Split screen: brand panel (large screens) + the form card. */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-24 size-[28rem] rounded-full bg-white/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -bottom-40 size-[32rem] rounded-full bg-fuchsia-300/25 blur-3xl"
        />
        <BrandMark className="relative text-lg [&>span]:bg-white/20 [&>span]:from-transparent [&>span]:to-transparent" />
        <div className="relative max-w-md space-y-6">
          <h2 className="text-4xl leading-tight font-bold">
            Create courses faster.
            <br />
            Start with a secure account.
          </h2>
          <ul className="space-y-3">
            {highlights.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm"
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="text-sm font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/70">
          Full-stack assessment · {new Date().getFullYear()}
        </p>
      </aside>

      <main className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <BrandMark className="mb-10 lg:hidden" />
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1.5 mb-8 text-sm text-muted-foreground">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
