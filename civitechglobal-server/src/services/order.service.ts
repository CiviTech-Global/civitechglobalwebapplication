import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export async function createOrder(userId: string, data: { items: { productId: string; quantity: number }[]; notes?: string }) {
  const productIds = data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  if (products.length !== productIds.length) throw new AppError('One or more products not found', 404);

  const itemsWithPrices = data.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return { productId: item.productId, quantity: item.quantity, price: product.price ?? 0 };
  });

  const total = itemsWithPrices.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return prisma.order.create({
    data: {
      userId,
      total,
      notes: data.notes,
      items: { create: itemsWithPrices },
    },
    include: { items: { include: { product: true } } },
  });
}

export async function getUserOrders(userId: string, query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '10'), 10)));
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId }, skip, take: limit, orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: { select: { id: true, name: true, image: true } } } } },
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return { orders, total, page, limit };
}

export async function getAllOrders(query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '10'), 10)));
  const skip = (page - 1) * limit;
  const status = query.status as string | undefined;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } }, items: { include: { product: { select: { id: true, name: true } } } } },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, page, limit };
}

export async function getOrderById(id: string, userId?: string) {
  const where: Record<string, unknown> = { id };
  if (userId) where.userId = userId;

  const order = await prisma.order.findFirst({
    where,
    include: { user: { select: { id: true, email: true, firstName: true, lastName: true } }, items: { include: { product: true } } },
  });
  if (!order) throw new AppError('Order not found', 404);
  return order;
}

export async function updateOrderStatus(id: string, status: string) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new AppError('Order not found', 404);
  return prisma.order.update({ where: { id }, data: { status: status as any } });
}
