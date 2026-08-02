import { Request, Response, NextFunction } from 'express';
import * as ticketService from '../services/ticket.service.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';
import type { PaginationQuery } from '../validators/common.schema.js';
import type { TicketListQuery } from '../validators/ticket.schema.js';

export async function createTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await ticketService.createTicket(req.body, req.user?.userId);
    successResponse(res, ticket, 'Ticket created', 201);
  } catch (error) {
    next(error);
  }
}

export async function getUserTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ticketService.getUserTickets(req.user!.userId, req.query as unknown as PaginationQuery);
    paginatedResponse(res, result.tickets, result.total, result.page, result.limit);
  } catch (error) {
    next(error);
  }
}

export async function getAllTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ticketService.getAllTickets(req.query as unknown as TicketListQuery);
    paginatedResponse(res, result.tickets, result.total, result.page, result.limit);
  } catch (error) {
    next(error);
  }
}

export async function getTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN';
    const ticket = await ticketService.getTicketById(req.params.id as string, isAdmin ? undefined : req.user!.userId);
    successResponse(res, ticket);
  } catch (error) {
    next(error);
  }
}

export async function addMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const isStaff = req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN';
    if (!isStaff) {
      await ticketService.getTicketById(req.params.id as string, req.user!.userId);
    }
    const message = await ticketService.addTicketMessage(
      req.params.id as string,
      req.user!.userId,
      req.body.content,
      isStaff,
    );
    successResponse(res, message, 'Message added', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateTicketStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await ticketService.updateTicketStatus(req.params.id as string, req.body);
    successResponse(res, ticket, 'Ticket updated');
  } catch (error) {
    next(error);
  }
}
