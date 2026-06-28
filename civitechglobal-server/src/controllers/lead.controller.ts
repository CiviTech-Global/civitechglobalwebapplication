import { Request, Response, NextFunction } from 'express';
import * as leadService from '../services/lead.service.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

export async function getAllLeads(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await leadService.getAllLeads(req.query as Record<string, unknown>);
    paginatedResponse(res, result.leads, result.total, result.page, result.limit);
  } catch (error) {
    next(error);
  }
}

export async function getLead(req: Request, res: Response, next: NextFunction) {
  try {
    const lead = await leadService.getLeadById(req.params.id as string);
    successResponse(res, lead);
  } catch (error) {
    next(error);
  }
}

export async function updateLeadStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const lead = await leadService.updateLeadStatus(req.params.id as string, req.body.status);
    successResponse(res, lead, 'Lead status updated');
  } catch (error) {
    next(error);
  }
}

export async function getLeadStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await leadService.getLeadStats();
    successResponse(res, stats);
  } catch (error) {
    next(error);
  }
}
