import { Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import { encryptRequired, hashForSearch, normalizeEmail } from '../utils/pii.js';
import { decryptTicket, decryptTickets, decryptUser } from '../utils/piiTransform.js';
import { ticketRepository, ticketMessageRepository } from '../database/prisma/repositories/ticket.repository.js';
import type { PaginationQuery } from '../validators/common.schema.js';
import type { TicketListQuery } from '../validators/ticket.schema.js';

const userSelect = {
  id: true,
  email: true,
  emailHash: true,
  firstName: true,
  lastName: true,
  role: true,
} as const;

export async function createTicket(data: { subject: string; email: string; message: string }, userId?: string) {
  const email = data.email;
  const ticket = await ticketRepository.create({
    data: {
      subject: data.subject,
      email: encryptRequired(email),
      emailHash: hashForSearch(normalizeEmail(email)),
      userId,
      messages: { create: { content: data.message, userId, isStaff: false } },
    },
    include: { messages: true },
  });

  return decryptTicket(ticket);
}

export async function getUserTickets(userId: string, query: PaginationQuery) {
  const page = Math.max(1, query.page);
  const limit = Math.min(50, Math.max(1, query.limit));
  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    ticketRepository.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    }),
    ticketRepository.count({ where: { userId } }),
  ]);

  return { tickets: decryptTickets(tickets), total, page, limit };
}

export async function getAllTickets(query: TicketListQuery) {
  const page = Math.max(1, query.page);
  const limit = Math.min(50, Math.max(1, query.limit));
  const skip = (page - 1) * limit;
  const status = query.status;
  const priority = query.priority;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const [tickets, total] = await Promise.all([
    ticketRepository.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: userSelect },
        _count: { select: { messages: true } },
      },
    }),
    ticketRepository.count({ where }),
  ]);

  return {
    tickets: tickets.map((t) => ({
      ...decryptTicket(t),
      user: t.user ? decryptUser(t.user) : null,
    })),
    total,
    page,
    limit,
  };
}

export async function getTicketById(id: string, userId?: string) {
  const where: Record<string, unknown> = { id };
  if (userId) where.userId = userId;

  const ticket = await ticketRepository.findFirst({
    where,
    include: {
      user: { select: userSelect },
      messages: {
        include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  if (!ticket) throw new AppError('Ticket not found', 404);

  return {
    ...decryptTicket(ticket),
    user: ticket.user ? decryptUser(ticket.user) : null,
    messages: ticket.messages.map((m) => {
      const msgUser = m.user;
      return {
        ...m,
        user: msgUser
          ? (() => {
              const { firstName, lastName } = msgUser;
              return {
                ...msgUser,
                firstName: firstName ? decryptUser({ firstName }).firstName : null,
                lastName: lastName ? decryptUser({ lastName }).lastName : null,
              };
            })()
          : null,
      };
    }),
  };
}

export async function addTicketMessage(ticketId: string, userId: string, content: string, isStaff: boolean) {
  const ticket = await ticketRepository.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new AppError('Ticket not found', 404);

  if (!isStaff && ticket.userId !== userId) {
    throw new AppError('Access denied', 403);
  }

  const message = await ticketMessageRepository.create({
    data: { ticketId, userId, content, isStaff },
    include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } },
  });

  const msgUser = message.user;
  return {
    ...message,
    user: msgUser
      ? (() => {
          const { firstName, lastName } = msgUser;
          return {
            ...msgUser,
            firstName: firstName ? decryptUser({ firstName }).firstName : null,
            lastName: lastName ? decryptUser({ lastName }).lastName : null,
          };
        })()
      : null,
  };
}

export async function updateTicketStatus(id: string, data: { status?: string; priority?: string }) {
  const ticket = await ticketRepository.findUnique({ where: { id } });
  if (!ticket) throw new AppError('Ticket not found', 404);
  const updated = await ticketRepository.update({ where: { id }, data: data as Prisma.TicketUpdateInput });
  return decryptTicket(updated);
}
