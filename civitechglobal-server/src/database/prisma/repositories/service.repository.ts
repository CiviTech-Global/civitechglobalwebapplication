import { prisma } from '../../../config/database.js';

const serviceDelegate = prisma.service;

export const serviceRepository = {
  findMany: serviceDelegate.findMany.bind(serviceDelegate),
  count: serviceDelegate.count.bind(serviceDelegate),
  findUnique: serviceDelegate.findUnique.bind(serviceDelegate),
  findFirst: serviceDelegate.findFirst.bind(serviceDelegate),
  create: serviceDelegate.create.bind(serviceDelegate),
  update: serviceDelegate.update.bind(serviceDelegate),
};
