import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export async function createTicket(data: { subject: string; email: string; message: string }, userId?: string) {
  return prisma.ticket.create({
    data: {
      subject: data.subject,
      email: data.email,
      userId,
      messages: { create: { content: data.message, userId, isStaff: false } },
    },
    include: { messages: true },
  });
}

export async function getUserTickets(userId: string, query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '10'), 10)));
  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where: { userId }, skip, take: limit, orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    }),
    prisma.ticket.count({ where: { userId } }),
  ]);

  return { tickets, total, page, limit };
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
      where, skip, take: limit, orderBy: { updatedAt: 'desc' },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } }, _count: { select: { messages: true } } },
    }),
    prisma.ticket.count({ where }),
  ]);

  return { tickets, total, page, limit };
}

export async function getTicketById(id: string, userId?: string) {
  const where: Record<string, unknown> = { id };
  if (userId) where.userId = userId;

  const ticket = await prisma.ticket.findFirst({
    where,
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      messages: { include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } }, orderBy: { createdAt: 'asc' } },
    },
  });
  if (!ticket) throw new AppError('Ticket not found', 404);
  return ticket;
}

export async function addTicketMessage(ticketId: string, userId: string, content: string, isStaff: boolean) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new AppError('Ticket not found', 404);

  return prisma.ticketMessage.create({
    data: { ticketId, userId, content, isStaff },
    include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } },
  });
}

export async function updateTicketStatus(id: string, data: { status?: string; priority?: string }) {
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) throw new AppError('Ticket not found', 404);
  return prisma.ticket.update({ where: { id }, data: data as any });
}
