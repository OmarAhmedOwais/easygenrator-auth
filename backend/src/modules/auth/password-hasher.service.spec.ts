import { PasswordHasher } from './password-hasher.service';

describe('PasswordHasher (argon2id)', () => {
  const hasher = new PasswordHasher();
  beforeAll(() => hasher.onModuleInit());

  it('hashes with argon2id and verifies', async () => {
    const hash = await hasher.hash('Passw0rd!');
    expect(hash.startsWith('$argon2id$')).toBe(true);
    await expect(hasher.verify(hash, 'Passw0rd!')).resolves.toBe(true);
    await expect(hasher.verify(hash, 'wrong')).resolves.toBe(false);
  });

  it('salts: the same password gives different hashes', async () => {
    expect(await hasher.hash('Passw0rd!')).not.toBe(await hasher.hash('Passw0rd!'));
  });

  it('returns false (never throws) for unknown users or corrupt hashes', async () => {
    await expect(hasher.verify(undefined, 'Passw0rd!')).resolves.toBe(false);
    await expect(hasher.verify('not-a-hash', 'Passw0rd!')).resolves.toBe(false);
  });
});
