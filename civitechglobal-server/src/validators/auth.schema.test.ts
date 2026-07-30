import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from './auth.schema.js';

const validInput = {
  email: 'user@example.com',
  password: 'StrongPass123!',
  firstName: 'John',
  lastName: 'Doe',
};

describe('registerSchema', () => {
  it('accepts a valid registration input', () => {
    expect(() => registerSchema.parse(validInput)).not.toThrow();
  });

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({ ...validInput, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects passwords shorter than 12 characters', () => {
    const result = registerSchema.safeParse({ ...validInput, password: 'Short1!' });
    expect(result.success).toBe(false);
  });

  it('returns a single password error for a short password', () => {
    const result = registerSchema.safeParse({ ...validInput, password: 'Short1!' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordErrors = result.error.issues.filter((issue) => issue.path[0] === 'password');
      expect(passwordErrors).toHaveLength(1);
    }
  });

  it('rejects passwords without an uppercase letter', () => {
    const result = registerSchema.safeParse({ ...validInput, password: 'lowercase123!' });
    expect(result.success).toBe(false);
  });

  it('rejects passwords without a lowercase letter', () => {
    const result = registerSchema.safeParse({ ...validInput, password: 'UPPERCASE123!' });
    expect(result.success).toBe(false);
  });

  it('rejects passwords without a number', () => {
    const result = registerSchema.safeParse({ ...validInput, password: 'NoNumberPass!' });
    expect(result.success).toBe(false);
  });

  it('rejects passwords without a special character', () => {
    const result = registerSchema.safeParse({ ...validInput, password: 'NoSpecial1234' });
    expect(result.success).toBe(false);
  });

  it('rejects passwords longer than 128 characters', () => {
    const result = registerSchema.safeParse({ ...validInput, password: 'A1!' + 'a'.repeat(130) });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts a valid login input', () => {
    expect(() => loginSchema.parse({ email: 'user@example.com', password: 'any' })).not.toThrow();
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'bad', password: 'any' });
    expect(result.success).toBe(false);
  });
});
