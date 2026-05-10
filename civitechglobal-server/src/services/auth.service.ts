import { prisma } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { RegisterInput, LoginInput } from '../validators/auth.schema.js';

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError('Email already registered', 409);

  const hashed = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { ...input, password: hashed },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, permissions: true, createdAt: true },
  });

  const accessToken = generateAccessToken({ userId: user.id, role: user.role, permissions: user.permissions });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role, permissions: user.permissions });

  return { user, accessToken, refreshToken };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await comparePassword(input.password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const accessToken = generateAccessToken({ userId: user.id, role: user.role, permissions: user.permissions });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role, permissions: user.permissions });

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken, refreshToken };
}

export async function refreshTokens(token: string) {
  const payload = verifyRefreshToken(token);

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new AppError('User not found', 404);

  const accessToken = generateAccessToken({ userId: user.id, role: user.role, permissions: user.permissions });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role, permissions: user.permissions });

  return { accessToken, refreshToken };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, permissions: true, avatar: true, phone: true, createdAt: true },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
}
