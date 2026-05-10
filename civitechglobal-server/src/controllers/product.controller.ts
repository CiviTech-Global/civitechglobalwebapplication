import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await productService.getProducts(req.query as Record<string, unknown>);
    paginatedResponse(res, result.products, result.total, result.page, result.limit);
  } catch (error) { next(error); }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.getProductBySlug(req.params.slug as string);
    successResponse(res, product);
  } catch (error) { next(error); }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.createProduct(req.body);
    successResponse(res, product, 'Product created', 201);
  } catch (error) { next(error); }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.updateProduct(req.params.id as string, req.body);
    successResponse(res, product, 'Product updated');
  } catch (error) { next(error); }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await productService.deleteProduct(req.params.id as string);
    successResponse(res, null, 'Product deleted');
  } catch (error) { next(error); }
}
