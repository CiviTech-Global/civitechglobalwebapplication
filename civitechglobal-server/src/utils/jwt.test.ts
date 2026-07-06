import { describe, it, expect } from 'vitest';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from './jwt.js';

const payload = {
  userId: 'user-123',
  role: 'USER',
  permissions: ['products'],
};

describe('JWT utils', () => {
  it('generates and verifies an access token', () => {
    const token = generateAccessToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.permissions).toEqual(payload.permissions);
  });

  it('generates a refresh token with a unique jti', () => {
    const result = generateRefreshToken(payload);
    expect(typeof result.token).toBe('string');
    expect(typeof result.jti).toBe('string');
    expect(result.jti.length).toBe(64);

    const decoded = verifyRefreshToken(result.token);
    expect(decoded.jti).toBe(result.jti);
    expect(decoded.userId).toBe(payload.userId);
  });

  it('throws when verifying an invalid token', () => {
    expect(() => verifyAccessToken('invalid-token')).toThrow();
  });
});
