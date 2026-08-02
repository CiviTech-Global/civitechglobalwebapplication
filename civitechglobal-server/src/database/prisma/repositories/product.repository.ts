import { prisma } from '../../../config/database.js';

const productDelegate = prisma.product;

export const productRepository = {
  findMany: productDelegate.findMany.bind(productDelegate),
  count: productDelegate.count.bind(productDelegate),
  findUnique: productDelegate.findUnique.bind(productDelegate),
  findFirst: productDelegate.findFirst.bind(productDelegate),
  create: productDelegate.create.bind(productDelegate),
  update: productDelegate.update.bind(productDelegate),
};
