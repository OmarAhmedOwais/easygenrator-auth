import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-xs transition-colors',
        'placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25',
        'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20',
        className,
      )}
      {...props}
    />
  );
}
