import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, hashForSearch, normalizeEmail, normalizePhone, verifyHash, sha256Hex } from './pii.js';

describe('PII utilities', () => {
  it('encrypts and decrypts a value', () => {
    const original = 'test@example.com';
    const encrypted = encrypt(original);
    expect(encrypted).not.toBeNull();
    expect(encrypted).not.toBe(original);
    expect(decrypt(encrypted)).toBe(original);
  });

  it('returns null for null/empty inputs', () => {
    expect(encrypt(null)).toBeNull();
    expect(encrypt(undefined)).toBeNull();
    expect(encrypt('')).toBeNull();
    expect(decrypt(null)).toBeNull();
    expect(hashForSearch('')).toBeNull();
  });

  it('produces deterministic search hashes', () => {
    const h1 = hashForSearch('User@Example.com');
    const h2 = hashForSearch('User@Example.com');
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(64);
  });

  it('normalizes email addresses', () => {
    expect(normalizeEmail('  User@EXAMPLE.com ')).toBe('user@example.com');
  });

  it('normalizes phone numbers', () => {
    expect(normalizePhone('+1 (555) 123-4567')).toBe('+15551234567');
    expect(normalizePhone('0912 345 6789')).toBe('09123456789');
  });

  it('verifies a hash in constant time', () => {
    const value = 'secret@example.com';
    const hash = hashForSearch(value)!;
    expect(verifyHash(value, hash)).toBe(true);
    expect(verifyHash('other@example.com', hash)).toBe(false);
  });

  it('produces sha256 hex', () => {
    expect(sha256Hex('hello')).toHaveLength(64);
  });
});
