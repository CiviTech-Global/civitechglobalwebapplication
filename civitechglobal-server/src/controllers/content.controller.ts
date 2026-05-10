import { Request, Response, NextFunction } from 'express';
import * as contentService from '../services/content.service.js';
import { successResponse } from '../utils/apiResponse.js';

export async function getAllContent(_req: Request, res: Response, next: NextFunction) {
  try {
    const content = await contentService.getAllContent();
    successResponse(res, content);
  } catch (error) { next(error); }
}

export async function getContent(req: Request, res: Response, next: NextFunction) {
  try {
    const content = await contentService.getContentByKey(req.params.key as string);
    successResponse(res, content);
  } catch (error) { next(error); }
}

export async function updateContent(req: Request, res: Response, next: NextFunction) {
  try {
    const content = await contentService.upsertContent(req.params.key as string, req.body.value);
    successResponse(res, content, 'Content updated');
  } catch (error) { next(error); }
}
