import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { env } from '../config/env.js';

export interface TokenPayload {
  userId: string;
  role: string;
  permissions: string[];
  tokenVersion?: number;
}

export interface RefreshTokenPayload extends TokenPayload {
  jti: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m', algorithm: 'HS256' });
}

export function generateRefreshToken(payload: TokenPayload): { token: string; jti: string } {
  const jti = randomBytes(32).toString('hex');
  const token = jwt.sign({ ...payload, jti }, env.JWT_REFRESH_SECRET, { expiresIn: '7d', algorithm: 'HS256' });
  return { token, jti };
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }) as TokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] }) as RefreshTokenPayload;
}
