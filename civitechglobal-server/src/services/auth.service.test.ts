import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/database.js', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
      delete: vi.fn(),
    },
    refreshToken: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    adminRole: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
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
  user: { findFirst: ReturnType<typeof vi.fn> };
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
    expect(mockedPrisma.user.findFirst).not.toHaveBeenCalled();
    expect(mockedRedis.get).toHaveBeenCalledWith('login:failed:test@example.com');
    expect(mockedRedis.ttl).toHaveBeenCalledWith('login:failed:test@example.com');
  });

  it('clears failed attempts on successful login', async () => {
    mockedRedis.get.mockResolvedValue(null);
    mockedPrisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      email: null,
      emailHash: null,
      password: 'hashed',
      role: 'USER',
      permissions: [],
      tokenVersion: 0,
      firstName: null,
      lastName: null,
      avatar: null,
      phone: null,
      createdAt: new Date(),
    });
    mockedComparePassword.mockResolvedValue(true);
    mockedRedis.del.mockResolvedValue(1);

    await login({ email: 'test@example.com', password: 'correct' });
    expect(mockedRedis.del).toHaveBeenCalledWith('login:failed:test@example.com');
  });
});
