import { isStrongPassword, normalizeEmail } from './auth-rules';

describe('isStrongPassword', () => {
  it.each(['Passw0rd!', 'a1!aaaaa', 'Ünïcode9#x', 'long password 1 with space!'])(
    'accepts %p',
    (pw) => expect(isStrongPassword(pw)).toBe(true),
  );

  it.each([
    ['too short', 'Pa1!'],
    ['no letter', '12345678!'],
    ['no number', 'Password!'],
    ['no special', 'Password1'],
    ['whitespace is not special', 'Password1 '],
    ['too long', `Aa1!${'x'.repeat(130)}`],
    ['not a string', 12345678],
  ])('rejects %s', (_label, pw) => expect(isStrongPassword(pw)).toBe(false));
});

describe('normalizeEmail', () => {
  it('trims and lowercases', () =>
    expect(normalizeEmail('  John@Example.COM ')).toBe('john@example.com'));
});
