import { prisma } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { RegisterInput, LoginInput } from '../validators/auth.schema.js';

const REFRESH_TOKEN_TTL_DAYS = 7;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function getRefreshTokenExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_TOKEN_TTL_DAYS);
  return d;
}

// In-memory failed login tracker (per-email). In production, use Redis.
const failedAttempts = new Map<string, { count: number; lockedUntil: number | null }>();

function recordFailedAttempt(email: string): void {
  const entry = failedAttempts.get(email) || { count: 0, lockedUntil: null };
  entry.count += 1;
  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
  }
  failedAttempts.set(email, entry);
}

function clearFailedAttempts(email: string): void {
  failedAttempts.delete(email);
}

function checkLockout(email: string): void {
  const entry = failedAttempts.get(email);
  if (!entry) return;
  if (entry.lockedUntil && entry.lockedUntil > Date.now()) {
    const waitSeconds = Math.ceil((entry.lockedUntil - Date.now()) / 1000);
    throw new AppError(`Account locked. Try again in ${waitSeconds} seconds.`, 429);
  }
  if (entry.lockedUntil && entry.lockedUntil <= Date.now()) {
    failedAttempts.delete(email);
  }
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError('Email already registered', 409);

  const hashed = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { ...input, password: hashed },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      permissions: true,
      tokenVersion: true,
      createdAt: true,
    },
  });

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
    permissions: user.permissions,
    tokenVersion: user.tokenVersion,
  });
  const { token: refreshToken, jti } = generateRefreshToken({
    userId: user.id,
    role: user.role,
    permissions: user.permissions,
    tokenVersion: user.tokenVersion,
  });

  await prisma.refreshToken.create({
    data: {
      token: jti,
      userId: user.id,
      expiresAt: getRefreshTokenExpiresAt(),
    },
  });

  return { user, accessToken, refreshToken };
}

export async function login(input: LoginInput) {
  checkLockout(input.email);

  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await comparePassword(input.password, user.password);
  if (!valid) {
    recordFailedAttempt(input.email);
    throw new AppError('Invalid credentials', 401);
  }

  clearFailedAttempts(input.email);

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
    permissions: user.permissions,
    tokenVersion: user.tokenVersion,
  });
  const { token: refreshToken, jti } = generateRefreshToken({
    userId: user.id,
    role: user.role,
    permissions: user.permissions,
    tokenVersion: user.tokenVersion,
  });

  await prisma.refreshToken.create({
    data: {
      token: jti,
      userId: user.id,
      expiresAt: getRefreshTokenExpiresAt(),
    },
  });

  const { password: _password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken, refreshToken };
}

export async function refreshTokens(oldRefreshToken: string) {
  const payload = verifyRefreshToken(oldRefreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: payload.jti },
  });

  if (!storedToken) throw new AppError('Invalid refresh token', 401);
  if (storedToken.revokedAt) throw new AppError('Refresh token revoked', 401);
  if (storedToken.expiresAt < new Date()) throw new AppError('Refresh token expired', 401);

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new AppError('User not found', 404);

  // Check token version hasn't been invalidated
  if (payload.tokenVersion !== undefined && user.tokenVersion !== payload.tokenVersion) {
    throw new AppError('Refresh token revoked', 401);
  }

  // Rotate: revoke old token and issue a new one
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
    permissions: user.permissions,
    tokenVersion: user.tokenVersion,
  });
  const { token: refreshToken, jti } = generateRefreshToken({
    userId: user.id,
    role: user.role,
    permissions: user.permissions,
    tokenVersion: user.tokenVersion,
  });

  await prisma.refreshToken.create({
    data: {
      token: jti,
      userId: user.id,
      expiresAt: getRefreshTokenExpiresAt(),
    },
  });

  return { accessToken, refreshToken };
}

export async function revokeRefreshToken(refreshToken: string) {
  try {
    const payload = verifyRefreshToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { token: payload.jti },
      data: { revokedAt: new Date() },
    });
  } catch {
    // Ignore invalid tokens on logout
  }
}

export async function revokeAllUserRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { revokedAt: new Date() },
  });
  // Increment token version to invalidate all outstanding access tokens
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      permissions: true,
      avatar: true,
      phone: true,
      createdAt: true,
    },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
}
