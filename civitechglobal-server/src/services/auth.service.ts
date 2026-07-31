import { createHash } from 'crypto';
import { prisma } from '../config/database.js';
import { redis } from '../config/redis.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { authFailures } from '../config/metrics.js';
import { RegisterInput, LoginInput } from '../validators/auth.schema.js';
import { encryptRequired, hashForSearch, normalizeEmail } from '../utils/pii.js';
import { decryptUser } from '../utils/piiTransform.js';
import { runAsSystem } from '../utils/requestContext.js';

const REFRESH_TOKEN_TTL_DAYS = 7;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 15 * 60; // 15 minutes

function getRefreshTokenExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_TOKEN_TTL_DAYS);
  return d;
}

function failedAttemptsKey(email: string): string {
  return `login:failed:${email.toLowerCase()}`;
}

function hashJti(jti: string): string {
  return createHash('sha256').update(jti).digest('hex');
}

async function recordFailedAttempt(email: string): Promise<void> {
  const key = failedAttemptsKey(email);
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, LOCKOUT_DURATION_SECONDS);
  }
}

async function clearFailedAttempts(email: string): Promise<void> {
  await redis.del(failedAttemptsKey(email));
}

async function checkLockout(email: string): Promise<void> {
  const key = failedAttemptsKey(email);
  const countStr = await redis.get(key);
  if (!countStr) return;

  const count = parseInt(countStr, 10);
  if (count >= MAX_FAILED_ATTEMPTS) {
    const ttl = await redis.ttl(key);
    if (ttl > 0) {
      authFailures.inc({ reason: 'lockout' });
      throw new AppError(`Account locked. Try again in ${ttl} seconds.`, 429);
    }
    await redis.del(key);
  }
}

function userEmailHash(email: string): string | null {
  return hashForSearch(normalizeEmail(email));
}

function userResponseFields() {
  return {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    permissions: true,
    tokenVersion: true,
    avatar: true,
    phone: true,
    createdAt: true,
    emailHash: true,
    phoneHash: true,
  } as const;
}

export async function register(input: RegisterInput) {
  return runAsSystem(async () => {
    const emailHash = userEmailHash(input.email);
    const existing = await prisma.user.findFirst({
      where: { emailHash: emailHash ?? undefined },
    });
    if (existing) throw new AppError('Email already registered', 409);

    const hashed = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        email: encryptRequired(input.email),
        emailHash,
        password: hashed,
        firstName: encryptRequired(input.firstName),
        lastName: encryptRequired(input.lastName),
      },
      select: userResponseFields(),
    });

    const decryptedUser = decryptUser(user);
    if (!decryptedUser) throw new AppError('Failed to create user', 500);

    const accessToken = generateAccessToken({
      userId: decryptedUser.id,
      role: decryptedUser.role,
      permissions: decryptedUser.permissions,
      tokenVersion: decryptedUser.tokenVersion,
    });
    const { token: refreshToken, jti } = generateRefreshToken({
      userId: decryptedUser.id,
      role: decryptedUser.role,
      permissions: decryptedUser.permissions,
      tokenVersion: decryptedUser.tokenVersion,
    });

    await prisma.refreshToken.create({
      data: {
        token: hashJti(jti),
        userId: decryptedUser.id,
        expiresAt: getRefreshTokenExpiresAt(),
      },
    });

    return { user: decryptedUser, accessToken, refreshToken };
  });
}

export async function login(input: LoginInput) {
  return runAsSystem(async () => {
    await checkLockout(input.email);

    const emailHash = userEmailHash(input.email);
    const user = await prisma.user.findFirst({
      where: { emailHash: emailHash ?? undefined },
    });
    if (!user) {
      await recordFailedAttempt(input.email);
      authFailures.inc({ reason: 'invalid_credentials' });
      throw new AppError('Invalid credentials', 401);
    }

    const valid = await comparePassword(input.password, user.password);
    if (!valid) {
      await recordFailedAttempt(input.email);
      authFailures.inc({ reason: 'invalid_credentials' });
      throw new AppError('Invalid credentials', 401);
    }

    await clearFailedAttempts(input.email);

    const decryptedUser = decryptUser(user);
    if (!decryptedUser) throw new AppError('Failed to load user', 500);

    const accessToken = generateAccessToken({
      userId: decryptedUser.id,
      role: decryptedUser.role,
      permissions: decryptedUser.permissions,
      tokenVersion: decryptedUser.tokenVersion,
    });
    const { token: refreshToken, jti } = generateRefreshToken({
      userId: decryptedUser.id,
      role: decryptedUser.role,
      permissions: decryptedUser.permissions,
      tokenVersion: decryptedUser.tokenVersion,
    });

    await prisma.refreshToken.create({
      data: {
        token: hashJti(jti),
        userId: decryptedUser.id,
        expiresAt: getRefreshTokenExpiresAt(),
      },
    });

    const { password: _password, ...userWithoutPassword } = decryptedUser;
    return { user: userWithoutPassword, accessToken, refreshToken };
  });
}

export async function refreshTokens(oldRefreshToken: string) {
  return runAsSystem(async () => {
    const payload = verifyRefreshToken(oldRefreshToken);
    const tokenHash = hashJti(payload.jti);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: tokenHash },
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

    const decryptedUser = decryptUser(user);
    if (!decryptedUser) throw new AppError('Failed to load user', 500);

    // Rotate: revoke old token and issue a new one
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const accessToken = generateAccessToken({
      userId: decryptedUser.id,
      role: decryptedUser.role,
      permissions: decryptedUser.permissions,
      tokenVersion: decryptedUser.tokenVersion,
    });
    const { token: refreshToken, jti } = generateRefreshToken({
      userId: decryptedUser.id,
      role: decryptedUser.role,
      permissions: decryptedUser.permissions,
      tokenVersion: decryptedUser.tokenVersion,
    });

    await prisma.refreshToken.create({
      data: {
        token: hashJti(jti),
        userId: decryptedUser.id,
        expiresAt: getRefreshTokenExpiresAt(),
      },
    });

    return { accessToken, refreshToken };
  });
}

export async function revokeRefreshToken(refreshToken: string) {
  return runAsSystem(async () => {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const tokenHash = hashJti(payload.jti);
      await prisma.refreshToken.updateMany({
        where: { token: tokenHash },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Ignore invalid tokens on logout
    }
  });
}

export async function revokeAllUserRefreshTokens(userId: string) {
  return runAsSystem(async () => {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
    // Increment token version to invalidate all outstanding access tokens
    await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userResponseFields(),
  });
  if (!user) throw new AppError('User not found', 404);
  const decryptedUser = decryptUser(user);
  if (!decryptedUser) throw new AppError('Failed to load user', 500);
  return decryptedUser;
}
