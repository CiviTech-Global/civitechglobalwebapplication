import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getProducts(query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '10'), 10)));
  const skip = (page - 1) * limit;
  const category = query.category as string | undefined;
  const search = query.search as string | undefined;

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = category;
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, limit };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) throw new AppError('Product not found', 404);
  return product;
}

export async function createProduct(data: Record<string, unknown>) {
  return prisma.product.create({ data: data as any });
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError('Product not found', 404);
  return prisma.product.update({ where: { id }, data: data as any });
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError('Product not found', 404);
  return prisma.product.delete({ where: { id } });
}
