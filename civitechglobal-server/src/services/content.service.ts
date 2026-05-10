import { prisma } from '../config/database.js';

export async function getAllContent() {
  return prisma.siteContent.findMany();
}

export async function getContentByKey(key: string) {
  return prisma.siteContent.findUnique({ where: { key } });
}

export async function upsertContent(key: string, value: string) {
  return prisma.siteContent.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
