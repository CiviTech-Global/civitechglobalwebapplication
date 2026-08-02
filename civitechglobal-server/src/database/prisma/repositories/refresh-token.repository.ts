import { prisma } from '../../../config/database.js';

const refreshTokenDelegate = prisma.refreshToken;

export const refreshTokenRepository = {
  findMany: refreshTokenDelegate.findMany.bind(refreshTokenDelegate),
  count: refreshTokenDelegate.count.bind(refreshTokenDelegate),
  findUnique: refreshTokenDelegate.findUnique.bind(refreshTokenDelegate),
  findFirst: refreshTokenDelegate.findFirst.bind(refreshTokenDelegate),
  create: refreshTokenDelegate.create.bind(refreshTokenDelegate),
  update: refreshTokenDelegate.update.bind(refreshTokenDelegate),
  updateMany: refreshTokenDelegate.updateMany.bind(refreshTokenDelegate),
  deleteMany: refreshTokenDelegate.deleteMany.bind(refreshTokenDelegate),
};
