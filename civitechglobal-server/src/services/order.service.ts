import { OrderStatus } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import { decryptUser } from '../utils/piiTransform.js';
import { productRepository } from '../database/prisma/repositories/product.repository.js';
import { orderRepository } from '../database/prisma/repositories/order.repository.js';
import type { OrderListQuery } from '../validators/order.schema.js';
import type { PaginationQuery } from '../validators/common.schema.js';

export async function createOrder(
  userId: string,
  data: { items: { productId: string; quantity: number }[]; notes?: string },
) {
  const productIds = data.items.map((i) => i.productId);
  const products = await productRepository.findMany({ where: { id: { in: productIds } } });

  if (products.length !== productIds.length) throw new AppError('One or more products not found', 404);

  const itemsWithPrices = data.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return { productId: item.productId, quantity: item.quantity, price: product.price ?? 0 };
  });

  const total = itemsWithPrices.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return orderRepository.create({
    data: {
      userId,
      total,
      notes: data.notes,
      items: { create: itemsWithPrices },
    },
    include: { items: { include: { product: true } } },
  });
}

export async function getUserOrders(userId: string, query: PaginationQuery) {
  const page = Math.max(1, query.page);
  const limit = Math.min(50, Math.max(1, query.limit));
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    orderRepository.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: { select: { id: true, name: true, image: true } } } } },
    }),
    orderRepository.count({ where: { userId } }),
  ]);

  return { orders, total, page, limit };
}

export async function getAllOrders(query: OrderListQuery) {
  const page = Math.max(1, query.page);
  const limit = Math.min(50, Math.max(1, query.limit));
  const skip = (page - 1) * limit;
  const status = query.status;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    orderRepository.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        items: { include: { product: { select: { id: true, name: true } } } },
      },
    }),
    orderRepository.count({ where }),
  ]);

  return {
    orders: orders.map((o) => ({ ...o, user: o.user ? decryptUser(o.user) : null })),
    total,
    page,
    limit,
  };
}

export async function getOrderById(id: string, userId?: string) {
  const where: Record<string, unknown> = { id };
  if (userId) where.userId = userId;

  const order = await orderRepository.findFirst({
    where,
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      items: { include: { product: true } },
    },
  });
  if (!order) throw new AppError('Order not found', 404);
  return { ...order, user: order.user ? decryptUser(order.user) : null };
}

export async function updateOrderStatus(id: string, status: string) {
  const order = await orderRepository.findUnique({ where: { id } });
  if (!order) throw new AppError('Order not found', 404);
  return orderRepository.update({ where: { id }, data: { status: status as OrderStatus } });
}
