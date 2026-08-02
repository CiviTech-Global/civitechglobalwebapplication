import { prisma } from '../../../config/database.js';

const orderDelegate = prisma.order;

export const orderRepository = {
  findMany: orderDelegate.findMany.bind(orderDelegate),
  count: orderDelegate.count.bind(orderDelegate),
  findUnique: orderDelegate.findUnique.bind(orderDelegate),
  findFirst: orderDelegate.findFirst.bind(orderDelegate),
  create: orderDelegate.create.bind(orderDelegate),
  update: orderDelegate.update.bind(orderDelegate),
  aggregate: orderDelegate.aggregate.bind(orderDelegate),
};
