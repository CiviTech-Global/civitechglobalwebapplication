import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { encryptRequired, hashForSearch, normalizeEmail } from '../utils/pii.js';
import { decryptTicket, decryptTickets, decryptUser } from '../utils/piiTransform.js';

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
  const ticket = await prisma.ticket.create({
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

export async function getUserTickets(userId: string, query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '10'), 10)));
  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    }),
    prisma.ticket.count({ where: { userId } }),
  ]);

  return { tickets: decryptTickets(tickets), total, page, limit };
}

export async function getAllTickets(query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '10'), 10)));
  const skip = (page - 1) * limit;
  const status = query.status as string | undefined;
  const priority = query.priority as string | undefined;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: userSelect },
        _count: { select: { messages: true } },
      },
    }),
    prisma.ticket.count({ where }),
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

  const ticket = await prisma.ticket.findFirst({
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
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new AppError('Ticket not found', 404);

  if (!isStaff && ticket.userId !== userId) {
    throw new AppError('Access denied', 403);
  }

  const message = await prisma.ticketMessage.create({
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
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) throw new AppError('Ticket not found', 404);
  const updated = await prisma.ticket.update({ where: { id }, data: data as Prisma.TicketUpdateInput });
  return decryptTicket(updated);
}
