import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.getUsers(req.query as Record<string, unknown>);
    paginatedResponse(res, result.users, result.total, result.page, result.limit);
  } catch (error) { next(error); }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getUserById(req.params.id as string);
    successResponse(res, user);
  } catch (error) { next(error); }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req.params.id as string) || req.user!.userId;
    const user = await userService.updateProfile(userId, req.body);
    successResponse(res, user, 'Profile updated');
  } catch (error) { next(error); }
}

export async function updateRole(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateUserRole(req.params.id as string, req.body.role);
    successResponse(res, user, 'Role updated');
  } catch (error) { next(error); }
}

export async function updatePermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateUserPermissions(req.params.id as string, req.body.permissions);
    successResponse(res, user, 'Permissions updated');
  } catch (error) { next(error); }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    await userService.deleteUser(req.params.id as string);
    successResponse(res, null, 'User deleted');
  } catch (error) { next(error); }
}

export async function createAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = await userService.createAdmin(req.body);
    successResponse(res, admin, 'Admin created', 201);
  } catch (error) { next(error); }
}

export async function assignAdminRole(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.assignAdminRole(req.params.id as string, req.body.adminRoleId);
    successResponse(res, user, 'Admin role assigned');
  } catch (error) { next(error); }
}
