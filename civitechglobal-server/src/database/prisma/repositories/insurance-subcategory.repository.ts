import { prisma } from '../../../config/database.js';

export const insuranceSubcategoryRepository = {
  findById: (id: string) => {
    return prisma.insuranceSubcategory.findUnique({
      where: { id },
      include: { category: true },
    });
  },

  findByCategoryId: (categoryId: string) => {
    return prisma.insuranceSubcategory.findMany({
      where: { categoryId },
      orderBy: { createdAt: 'asc' },
    });
  },
};
