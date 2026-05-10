import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    successResponse(res, { user: result.user, accessToken: result.accessToken }, 'Registration successful', 201);
  } catch (error) { next(error); }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    successResponse(res, { user: result.user, accessToken: result.accessToken }, 'Login successful');
  } catch (error) { next(error); }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      res.status(401).json({ success: false, message: 'Refresh token required' });
      return;
    }
    const result = await authService.refreshTokens(token);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    successResponse(res, { accessToken: result.accessToken }, 'Token refreshed');
  } catch (error) { next(error); }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('refreshToken', { path: '/' });
  successResponse(res, null, 'Logged out successfully');
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.userId);
    successResponse(res, user);
  } catch (error) { next(error); }
}
