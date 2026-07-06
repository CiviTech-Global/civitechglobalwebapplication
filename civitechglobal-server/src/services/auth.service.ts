import { prisma } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { RegisterInput, LoginInput } from '../validators/auth.schema.js';

const REFRESH_TOKEN_TTL_DAYS = 7;

function getRefreshTokenExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_TOKEN_TTL_DAYS);
  return d;
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError('Email already registered', 409);

  const hashed = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { ...input, password: hashed },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, permissions: true, createdAt: true },
  });

  const accessToken = generateAccessToken({ userId: user.id, role: user.role, permissions: user.permissions });
  const { token: refreshToken, jti } = generateRefreshToken({
    userId: user.id,
    role: user.role,
    permissions: user.permissions,
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
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await comparePassword(input.password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const accessToken = generateAccessToken({ userId: user.id, role: user.role, permissions: user.permissions });
  const { token: refreshToken, jti } = generateRefreshToken({
    userId: user.id,
    role: user.role,
    permissions: user.permissions,
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

  // Rotate: revoke old token and issue a new one
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  const accessToken = generateAccessToken({ userId: user.id, role: user.role, permissions: user.permissions });
  const { token: refreshToken, jti } = generateRefreshToken({
    userId: user.id,
    role: user.role,
    permissions: user.permissions,
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
