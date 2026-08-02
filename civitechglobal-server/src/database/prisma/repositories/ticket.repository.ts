import { prisma } from '../../../config/database.js';

const ticketDelegate = prisma.ticket;
const ticketMessageDelegate = prisma.ticketMessage;

export const ticketRepository = {
  findMany: ticketDelegate.findMany.bind(ticketDelegate),
  count: ticketDelegate.count.bind(ticketDelegate),
  findUnique: ticketDelegate.findUnique.bind(ticketDelegate),
  findFirst: ticketDelegate.findFirst.bind(ticketDelegate),
  create: ticketDelegate.create.bind(ticketDelegate),
  update: ticketDelegate.update.bind(ticketDelegate),
};

export const ticketMessageRepository = {
  findMany: ticketMessageDelegate.findMany.bind(ticketMessageDelegate),
  count: ticketMessageDelegate.count.bind(ticketMessageDelegate),
  findUnique: ticketMessageDelegate.findUnique.bind(ticketMessageDelegate),
  findFirst: ticketMessageDelegate.findFirst.bind(ticketMessageDelegate),
  create: ticketMessageDelegate.create.bind(ticketMessageDelegate),
  update: ticketMessageDelegate.update.bind(ticketMessageDelegate),
};
