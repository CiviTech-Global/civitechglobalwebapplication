import { prisma } from '../../../config/database.js';

const siteContentDelegate = prisma.siteContent;

export const siteContentRepository = {
  findMany: siteContentDelegate.findMany.bind(siteContentDelegate),
  count: siteContentDelegate.count.bind(siteContentDelegate),
  findUnique: siteContentDelegate.findUnique.bind(siteContentDelegate),
  findFirst: siteContentDelegate.findFirst.bind(siteContentDelegate),
  create: siteContentDelegate.create.bind(siteContentDelegate),
  update: siteContentDelegate.update.bind(siteContentDelegate),
  upsert: siteContentDelegate.upsert.bind(siteContentDelegate),
};
