import { cloneElement, useId, type ReactElement, type ReactNode } from 'react';
import { Label } from './label';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: ReactNode;
  /** A single input element; it receives id + aria wiring automatically. */
  children: ReactElement<Record<string, unknown>>;
}

/** Label + control + error, with the accessibility attributes wired once, here. */
export function FormField({ label, error, hint, children }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
      {hint}
    </div>
  );
}
