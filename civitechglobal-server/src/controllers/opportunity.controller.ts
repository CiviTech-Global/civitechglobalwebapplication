import { Request, Response, NextFunction } from 'express';
import * as opportunityService from '../services/opportunity.service.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

export async function getOpportunities(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await opportunityService.getOpportunities(req.query as Record<string, unknown>);
    paginatedResponse(res, result.opportunities, result.total, result.page, result.limit);
  } catch (error) { next(error); }
}

export async function getAllOpportunities(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await opportunityService.getAllOpportunities(req.query as Record<string, unknown>);
    paginatedResponse(res, result.opportunities, result.total, result.page, result.limit);
  } catch (error) { next(error); }
}

export async function getOpportunity(req: Request, res: Response, next: NextFunction) {
  try {
    const opportunity = await opportunityService.getOpportunityBySlug(req.params.slug as string);
    successResponse(res, opportunity);
  } catch (error) { next(error); }
}

export async function createOpportunity(req: Request, res: Response, next: NextFunction) {
  try {
    const opportunity = await opportunityService.createOpportunity(req.body);
    successResponse(res, opportunity, 'Opportunity created', 201);
  } catch (error) { next(error); }
}

export async function updateOpportunity(req: Request, res: Response, next: NextFunction) {
  try {
    const opportunity = await opportunityService.updateOpportunity(req.params.id as string, req.body);
    successResponse(res, opportunity, 'Opportunity updated');
  } catch (error) { next(error); }
}

export async function deleteOpportunity(req: Request, res: Response, next: NextFunction) {
  try {
    await opportunityService.deleteOpportunity(req.params.id as string);
    successResponse(res, null, 'Opportunity deleted');
  } catch (error) { next(error); }
}

export async function apply(req: Request, res: Response, next: NextFunction) {
  try {
    const application = await opportunityService.applyToOpportunity(req.user!.userId, req.params.id as string, req.body);
    successResponse(res, application, 'Application submitted', 201);
  } catch (error) { next(error); }
}

export async function getApplications(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await opportunityService.getApplications(req.query as Record<string, unknown>);
    paginatedResponse(res, result.applications, result.total, result.page, result.limit);
  } catch (error) { next(error); }
}

export async function getUserApplications(req: Request, res: Response, next: NextFunction) {
  try {
    const applications = await opportunityService.getUserApplications(req.user!.userId);
    successResponse(res, applications);
  } catch (error) { next(error); }
}

export async function updateApplicationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const application = await opportunityService.updateApplicationStatus(req.params.id as string, req.body.status);
    successResponse(res, application, 'Application status updated');
  } catch (error) { next(error); }
}
