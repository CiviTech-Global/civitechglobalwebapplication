import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/database.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('../config/redis.js', () => ({
  redis: {
    incr: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
  },
}));

import { login } from './auth.service.js';
import { prisma } from '../config/database.js';
import { redis } from '../config/redis.js';
import { comparePassword } from '../utils/password.js';

vi.mock('../utils/password.js', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

const mockedPrisma = prisma as unknown as {
  user: { findUnique: ReturnType<typeof vi.fn> };
};

const mockedRedis = redis as unknown as {
  incr: ReturnType<typeof vi.fn>;
  expire: ReturnType<typeof vi.fn>;
  ttl: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  del: ReturnType<typeof vi.fn>;
};

const mockedComparePassword = comparePassword as unknown as ReturnType<typeof vi.fn>;

describe('login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('locks the account after 5 failed attempts', async () => {
    mockedRedis.get.mockResolvedValue('5');
    mockedRedis.ttl.mockResolvedValue(900);

    await expect(login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow('Account locked');

    // Lockout is detected before any credential check
    expect(mockedPrisma.user.findUnique).not.toHaveBeenCalled();
    expect(mockedRedis.get).toHaveBeenCalledWith('login:failed:test@example.com');
    expect(mockedRedis.ttl).toHaveBeenCalledWith('login:failed:test@example.com');
  });

  it('clears failed attempts on successful login', async () => {
    mockedRedis.get.mockResolvedValue(null);
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashed',
      role: 'USER',
      permissions: [],
      tokenVersion: 0,
    });
    mockedComparePassword.mockResolvedValue(true);
    mockedRedis.del.mockResolvedValue(1);

    await login({ email: 'test@example.com', password: 'correct' });
    expect(mockedRedis.del).toHaveBeenCalledWith('login:failed:test@example.com');
  });
});
