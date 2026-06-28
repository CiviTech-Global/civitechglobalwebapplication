import {
  insuranceCategoryRepository,
} from '../../database/prisma/repositories/insurance-category.repository.js';
import {
  insuranceSubcategoryRepository,
} from '../../database/prisma/repositories/insurance-subcategory.repository.js';

export const insuranceService = {
  getAllCategories: () => {
    return insuranceCategoryRepository.findAll();
  },

  getCategoryById: (id: string) => {
    return insuranceCategoryRepository.findById(id);
  },

  getSubcategoriesByCategoryId: (categoryId: string) => {
    return insuranceSubcategoryRepository.findByCategoryId(categoryId);
  },

  getSubcategoryById: (id: string) => {
    return insuranceSubcategoryRepository.findById(id);
  },
};
