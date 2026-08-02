import { prisma } from '../../../config/database.js';

const opportunityDelegate = prisma.opportunity;
const applicationDelegate = prisma.opportunityApplication;

export const opportunityRepository = {
  findMany: opportunityDelegate.findMany.bind(opportunityDelegate),
  count: opportunityDelegate.count.bind(opportunityDelegate),
  findUnique: opportunityDelegate.findUnique.bind(opportunityDelegate),
  findFirst: opportunityDelegate.findFirst.bind(opportunityDelegate),
  create: opportunityDelegate.create.bind(opportunityDelegate),
  update: opportunityDelegate.update.bind(opportunityDelegate),
};

export const opportunityApplicationRepository = {
  findMany: applicationDelegate.findMany.bind(applicationDelegate),
  count: applicationDelegate.count.bind(applicationDelegate),
  findUnique: applicationDelegate.findUnique.bind(applicationDelegate),
  findFirst: applicationDelegate.findFirst.bind(applicationDelegate),
  create: applicationDelegate.create.bind(applicationDelegate),
  update: applicationDelegate.update.bind(applicationDelegate),
};
