import { prisma } from '../../../config/database.js';

const userDelegate = prisma.user;
const adminRoleDelegate = prisma.adminRole;

export const userRepository = {
  findMany: userDelegate.findMany.bind(userDelegate),
  count: userDelegate.count.bind(userDelegate),
  findUnique: userDelegate.findUnique.bind(userDelegate),
  findFirst: userDelegate.findFirst.bind(userDelegate),
  create: userDelegate.create.bind(userDelegate),
  update: userDelegate.update.bind(userDelegate),
  updateMany: userDelegate.updateMany.bind(userDelegate),
  deleteMany: userDelegate.deleteMany.bind(userDelegate),
};

export const adminRoleRepository = {
  findMany: adminRoleDelegate.findMany.bind(adminRoleDelegate),
  count: adminRoleDelegate.count.bind(adminRoleDelegate),
  findUnique: adminRoleDelegate.findUnique.bind(adminRoleDelegate),
  findFirst: adminRoleDelegate.findFirst.bind(adminRoleDelegate),
  create: adminRoleDelegate.create.bind(adminRoleDelegate),
  update: adminRoleDelegate.update.bind(adminRoleDelegate),
};
