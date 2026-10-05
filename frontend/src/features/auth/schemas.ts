import { z } from 'zod';

/**
 * Client-side mirror of `backend/src/common/validation/auth-rules.ts`. The backend is the
 * authority (it re-validates everything); this exists for instant feedback. Keep both in step.
 */
export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 50;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const passwordRules = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (v: string) => v.length >= PASSWORD_MIN_LENGTH,
  },
  { id: 'letter', label: 'At least one letter', test: (v: string) => /[A-Za-z]/.test(v) },
  { id: 'number', label: 'At least one number', test: (v: string) => /\d/.test(v) },
  {
    id: 'special',
    label: 'At least one special character',
    test: (v: string) => /[^A-Za-z0-9\s]/.test(v),
  },
] as const;

const email = z
  .string()
  .trim()
  .min(1, { error: 'Email is required' })
  .pipe(z.email({ error: 'Please enter a valid email address' }));

export const signUpSchema = z.object({
  email,
  name: z
    .string()
    .trim()
    .min(NAME_MIN_LENGTH, { error: `Name must be at least ${NAME_MIN_LENGTH} characters` })
    .max(NAME_MAX_LENGTH, { error: `Name must be at most ${NAME_MAX_LENGTH} characters` }),
  password: z
    .string()
    .max(PASSWORD_MAX_LENGTH, {
      error: `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
    })
    .superRefine((value, ctx) => {
      const failed = passwordRules.find((r) => !r.test(value));
      if (failed)
        ctx.addIssue({ code: 'custom', message: `Password needs: ${failed.label.toLowerCase()}` });
    }),
});

export const signInSchema = z.object({
  email,
  password: z.string().min(1, { error: 'Password is required' }),
});

export type SignUpValues = z.infer<typeof signUpSchema>;
export type SignInValues = z.infer<typeof signInSchema>;
