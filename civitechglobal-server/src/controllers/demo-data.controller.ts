import type { Request, Response, NextFunction } from 'express';
import * as demoDataService from '../services/demo-data.service.js';
import { successResponse } from '../utils/apiResponse.js';

export async function seedDemoData(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await demoDataService.seedDemoData();
    successResponse(res, result, result.message, result.seeded ? 201 : 200);
  } catch (err) { next(err); }
}

export async function clearDemoData(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await demoDataService.clearDemoData();
    successResponse(res, result, result.message);
  } catch (err) { next(err); }
}

export async function getDemoStatus(_req: Request, res: Response, next: NextFunction) {
  try {
    const status = await demoDataService.getDemoStatus();
    successResponse(res, status, 'Demo data status');
  } catch (err) { next(err); }
}
