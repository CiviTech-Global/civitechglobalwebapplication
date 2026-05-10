import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/order.service.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.createOrder(req.user!.userId, req.body);
    successResponse(res, order, 'Order created', 201);
  } catch (error) { next(error); }
}

export async function getUserOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await orderService.getUserOrders(req.user!.userId, req.query as Record<string, unknown>);
    paginatedResponse(res, result.orders, result.total, result.page, result.limit);
  } catch (error) { next(error); }
}

export async function getAllOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await orderService.getAllOrders(req.query as Record<string, unknown>);
    paginatedResponse(res, result.orders, result.total, result.page, result.limit);
  } catch (error) { next(error); }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN';
    const order = await orderService.getOrderById(req.params.id as string, isAdmin ? undefined : req.user!.userId);
    successResponse(res, order);
  } catch (error) { next(error); }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.updateOrderStatus(req.params.id as string, req.body.status);
    successResponse(res, order, 'Order status updated');
  } catch (error) { next(error); }
}
