import { describe, it, expect } from 'vitest';
import { isPasswordStrong, assertPasswordStrong, generateSecurePassword } from './passwordPolicy.js';

describe('isPasswordStrong', () => {
  it('accepts a valid complex password', () => {
    expect(isPasswordStrong('StrongPass123!')).toBe(true);
  });

  it('rejects passwords shorter than 12 characters', () => {
    expect(isPasswordStrong('Short1!')).toBe(false);
  });

  it('rejects passwords longer than 128 characters', () => {
    expect(isPasswordStrong('A1!' + 'a'.repeat(130))).toBe(false);
  });

  it('rejects passwords without an uppercase letter', () => {
    expect(isPasswordStrong('lowercase123!')).toBe(false);
  });

  it('rejects passwords without a lowercase letter', () => {
    expect(isPasswordStrong('UPPERCASE123!')).toBe(false);
  });

  it('rejects passwords without a number', () => {
    expect(isPasswordStrong('NoNumberPass!')).toBe(false);
  });

  it('rejects passwords without a special character', () => {
    expect(isPasswordStrong('NoSpecial1234')).toBe(false);
  });
});

describe('assertPasswordStrong', () => {
  it('does not throw for a valid password', () => {
    expect(() => assertPasswordStrong('StrongPass123!')).not.toThrow();
  });

  it('throws with a labeled message for a weak password', () => {
    expect(() => assertPasswordStrong('weak', 'ADMIN_PASSWORD')).toThrow('ADMIN_PASSWORD');
  });
});

describe('generateSecurePassword', () => {
  it('generates a password that satisfies the policy by default', () => {
    const password = generateSecurePassword();
    expect(password.length).toBe(16);
    expect(isPasswordStrong(password)).toBe(true);
  });

  it('supports custom lengths', () => {
    const password = generateSecurePassword(24);
    expect(password.length).toBe(24);
    expect(isPasswordStrong(password)).toBe(true);
  });

  it('throws when the requested length is below the minimum', () => {
    expect(() => generateSecurePassword(8)).toThrow();
  });

  it('throws when the requested length exceeds the maximum', () => {
    expect(() => generateSecurePassword(200)).toThrow();
  });

  it('generates different passwords across calls', () => {
    const a = generateSecurePassword();
    const b = generateSecurePassword();
    expect(a).not.toBe(b);
  });
});
