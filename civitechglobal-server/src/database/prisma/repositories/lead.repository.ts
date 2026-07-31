import { prisma } from '../../../config/database.js';
import type { LeadStatus } from '@prisma/client';
import { encrypt, encryptRequired, hashForSearch, normalizePhone } from '../../../utils/pii.js';

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

function encryptLeadData(data: CreateLeadInput) {
  return {
    telegramUserId: data.telegramUserId,
    telegramUsername: data.telegramUsername ? encrypt(data.telegramUsername) : null,
    telegramFirstName: data.telegramFirstName ? encrypt(data.telegramFirstName) : null,
    categoryId: data.categoryId,
    subcategoryId: data.subcategoryId,
    fullName: encryptRequired(data.fullName),
    phoneNumber: encryptRequired(data.phoneNumber),
    phoneNumberHash: hashForSearch(normalizePhone(data.phoneNumber)),
    city: encryptRequired(data.city),
    preferredContactTime: data.preferredContactTime,
    notes: data.notes,
    status: data.status || 'NEW',
  };
}

export const leadRepository = {
  create: (data: CreateLeadInput) => {
    return prisma.lead.create({
      data: encryptLeadData(data),
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
