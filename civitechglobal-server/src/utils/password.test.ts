import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from './password.js';

describe('Password utils', () => {
  it('hashes and verifies a password', async () => {
    const password = 'MyStrongPassword123!';
    const hashed = await hashPassword(password);

    expect(typeof hashed).toBe('string');
    expect(hashed).not.toBe(password);

    const isValid = await comparePassword(password, hashed);
    expect(isValid).toBe(true);
  });

  it('returns false for an incorrect password', async () => {
    const password = 'MyStrongPassword123!';
    const hashed = await hashPassword(password);

    const isValid = await comparePassword('wrong-password', hashed);
    expect(isValid).toBe(false);
  });
});
