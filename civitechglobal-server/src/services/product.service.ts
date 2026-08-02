import { Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import { productRepository } from '../database/prisma/repositories/product.repository.js';
import type { ProductListQuery } from '../validators/product.schema.js';

export async function getProducts(query: ProductListQuery) {
  const page = Math.max(1, query.page);
  const limit = Math.min(50, Math.max(1, query.limit));
  const skip = (page - 1) * limit;
  const category = query.category;
  const search = query.search;

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = category;
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const [products, total] = await Promise.all([
    productRepository.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    productRepository.count({ where }),
  ]);

  return { products, total, page, limit };
}

export async function getProductBySlug(slug: string) {
  const product = await productRepository.findUnique({ where: { slug } });
  if (!product) throw new AppError('Product not found', 404);
  return product;
}

export async function createProduct(data: Record<string, unknown>) {
  return productRepository.create({ data: data as Prisma.ProductCreateInput });
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  const product = await productRepository.findUnique({ where: { id } });
  if (!product) throw new AppError('Product not found', 404);
  return productRepository.update({ where: { id }, data: data as Prisma.ProductUpdateInput });
}

export async function deleteProduct(id: string) {
  const product = await productRepository.findUnique({ where: { id } });
  if (!product) throw new AppError('Product not found', 404);
  return productRepository.update({ where: { id }, data: { deletedAt: new Date() } });
}
