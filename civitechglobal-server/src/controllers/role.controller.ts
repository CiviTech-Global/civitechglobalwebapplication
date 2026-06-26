import type { Request, Response, NextFunction } from 'express';
import * as roleService from '../services/role.service.js';
import { successResponse } from '../utils/apiResponse.js';

export async function getRoles(_req: Request, res: Response, next: NextFunction) {
  try {
    const roles = await roleService.getRoles();
    successResponse(res, roles, 'Roles fetched');
  } catch (err) { next(err); }
}

export async function getRoleById(req: Request, res: Response, next: NextFunction) {
  try {
    const role = await roleService.getRoleById(req.params.id as string);
    successResponse(res, role, 'Role fetched');
  } catch (err) { next(err); }
}

export async function createRole(req: Request, res: Response, next: NextFunction) {
  try {
    const role = await roleService.createRole(req.body);
    successResponse(res, role, 'Role created', 201);
  } catch (err) { next(err); }
}

export async function updateRole(req: Request, res: Response, next: NextFunction) {
  try {
    const role = await roleService.updateRole(req.params.id as string, req.body);
    successResponse(res, role, 'Role updated');
  } catch (err) { next(err); }
}

export async function deleteRole(req: Request, res: Response, next: NextFunction) {
  try {
    await roleService.deleteRole(req.params.id as string);
    successResponse(res, null, 'Role deleted');
  } catch (err) { next(err); }
}
