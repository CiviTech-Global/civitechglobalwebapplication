import { prisma } from '../../../config/database.js';

export const insuranceCategoryRepository = {
  findAll: () => {
    return prisma.insuranceCategory.findMany({
      include: { subcategories: true },
      orderBy: { createdAt: 'asc' },
    });
  },

  findById: (id: string) => {
    return prisma.insuranceCategory.findUnique({
      where: { id },
      include: { subcategories: true },
    });
  },

  findByTitle: (title: string) => {
    return prisma.insuranceCategory.findUnique({
      where: { title },
      include: { subcategories: true },
    });
  },
};
