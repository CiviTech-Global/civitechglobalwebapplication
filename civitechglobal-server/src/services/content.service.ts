import { siteContentRepository } from '../database/prisma/repositories/site-content.repository.js';

export async function getAllContent() {
  return siteContentRepository.findMany();
}

export async function getContentByKey(key: string) {
  return siteContentRepository.findUnique({ where: { key } });
}

export async function upsertContent(key: string, value: string) {
  return siteContentRepository.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
