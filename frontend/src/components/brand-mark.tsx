import { LockKeyhole } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-semibold tracking-tight', className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30">
        <LockKeyhole className="size-4" aria-hidden />
      </span>
      Easygen Auth
    </span>
  );
}
