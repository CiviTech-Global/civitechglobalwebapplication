import { Request, Response, NextFunction } from 'express';
import * as serviceService from '../services/service.service.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

export async function getServices(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await serviceService.getServices(req.query as Record<string, unknown>);
    paginatedResponse(res, result.services, result.total, result.page, result.limit);
  } catch (error) { next(error); }
}

export async function getService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await serviceService.getServiceBySlug(req.params.slug as string);
    successResponse(res, service);
  } catch (error) { next(error); }
}

export async function createService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await serviceService.createService(req.body);
    successResponse(res, service, 'Service created', 201);
  } catch (error) { next(error); }
}

export async function updateService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await serviceService.updateService(req.params.id as string, req.body);
    successResponse(res, service, 'Service updated');
  } catch (error) { next(error); }
}

export async function deleteService(req: Request, res: Response, next: NextFunction) {
  try {
    await serviceService.deleteService(req.params.id as string);
    successResponse(res, null, 'Service deleted');
  } catch (error) { next(error); }
}
