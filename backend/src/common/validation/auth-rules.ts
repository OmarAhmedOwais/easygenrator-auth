/**
 * Single source of truth for the credential rules from the task spec.
 * The frontend mirrors these in `frontend/src/features/auth/schemas.ts` - keep them in step.
 */
export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 50;
export const PASSWORD_MIN_LENGTH = 8;
/** argon2 has no 72-byte truncation like bcrypt, but an upper bound stops hash-DoS payloads. */
export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_RULES = {
  letter: /[A-Za-z]/,
  number: /\d/,
  /** Anything that is not a letter, digit or whitespace counts as "special". */
  special: /[^A-Za-z0-9\s]/,
} as const;

export const PASSWORD_RULES_MESSAGE =
  'Password must be at least 8 characters and contain at least one letter, one number and one special character';

export function isStrongPassword(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length >= PASSWORD_MIN_LENGTH &&
    value.length <= PASSWORD_MAX_LENGTH &&
    PASSWORD_RULES.letter.test(value) &&
    PASSWORD_RULES.number.test(value) &&
    PASSWORD_RULES.special.test(value)
  );
}

/** Emails are case-insensitive in practice; store and compare one canonical form. */
export const normalizeEmail = (email: string): string => email.trim().toLowerCase();
