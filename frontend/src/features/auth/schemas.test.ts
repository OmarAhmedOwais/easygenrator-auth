import { describe, expect, it } from 'vitest';
import { signInSchema, signUpSchema } from './schemas';

const valid = { email: 'jane@example.com', name: 'Jane', password: 'Passw0rd!' };

describe('signUpSchema', () => {
  it('accepts valid input and trims email/name', () => {
    const parsed = signUpSchema.parse({ ...valid, email: '  jane@example.com ', name: ' Jane ' });
    expect(parsed).toEqual(valid);
  });

  it.each([
    ['invalid email', { email: 'jane@' }, 'valid email'],
    ['name < 3 chars', { name: 'Jo' }, 'at least 3'],
    ['password < 8 chars', { password: 'Pa1!' }, 'at least 8 characters'],
    ['password without letter', { password: '1234567!' }, 'one letter'],
    ['password without number', { password: 'Password!' }, 'one number'],
    ['password without special', { password: 'Password1' }, 'special character'],
  ])('rejects %s', (_label, override, message) => {
    const result = signUpSchema.safeParse({ ...valid, ...override });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain(message);
  });
});

describe('signInSchema', () => {
  it('requires both fields', () => {
    expect(signInSchema.safeParse({ email: '', password: '' }).success).toBe(false);
  });
});
