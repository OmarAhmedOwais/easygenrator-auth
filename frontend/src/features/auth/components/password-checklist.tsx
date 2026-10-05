import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { passwordRules } from '../schemas';

/** Live feedback against the exact rules the backend enforces. */
export function PasswordChecklist({ value }: { value: string }) {
  const passed = passwordRules.filter((r) => r.test(value)).length;
  return (
    <div className="space-y-2 pt-1" aria-live="polite">
      <div className="flex gap-1" aria-hidden>
        {passwordRules.map((r, i) => (
          <span
            key={r.id}
            className={cn(
              'h-1 flex-1 rounded-full bg-muted transition-colors',
              i < passed && (passed === passwordRules.length ? 'bg-success' : 'bg-primary'),
            )}
          />
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {passwordRules.map((rule) => {
          const ok = rule.test(value);
          return (
            <li
              key={rule.id}
              data-passed={ok}
              className={cn(
                'flex items-center gap-1.5 text-xs transition-colors',
                ok ? 'text-success' : 'text-muted-foreground',
              )}
            >
              {ok ? (
                <Check className="size-3.5" aria-hidden />
              ) : (
                <Circle className="size-3" aria-hidden />
              )}
              <span>
                {rule.label}
                <span className="sr-only">{ok ? ' (met)' : ' (not met)'}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
