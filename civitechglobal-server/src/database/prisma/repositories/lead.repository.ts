import { prisma } from '../../../config/database.js';
import type { LeadStatus } from '@prisma/client';

export interface CreateLeadInput {
  telegramUserId: string;
  telegramUsername?: string | null;
  telegramFirstName?: string | null;
  categoryId: string;
  subcategoryId: string;
  fullName: string;
  phoneNumber: string;
  city: string;
  preferredContactTime: string;
  notes?: string | null;
  status?: LeadStatus;
}

export const leadRepository = {
  create: (data: CreateLeadInput) => {
    return prisma.lead.create({
      data: {
        telegramUserId: data.telegramUserId,
        telegramUsername: data.telegramUsername,
        telegramFirstName: data.telegramFirstName,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        city: data.city,
        preferredContactTime: data.preferredContactTime,
        notes: data.notes,
        status: data.status || 'NEW',
      },
      include: {
        category: true,
        subcategory: true,
      },
    });
  },

  findById: (id: string) => {
    return prisma.lead.findUnique({
      where: { id },
      include: { category: true, subcategory: true },
    });
  },

  findByTelegramUserId: (telegramUserId: string) => {
    return prisma.lead.findMany({
      where: { telegramUserId },
      include: { category: true, subcategory: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  updateStatus: (id: string, status: LeadStatus) => {
    return prisma.lead.update({
      where: { id },
      data: { status },
    });
  },
};
