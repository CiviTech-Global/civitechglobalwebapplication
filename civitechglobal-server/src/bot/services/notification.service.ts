import type { Api } from 'grammy';
import type { Lead } from '@prisma/client';
import { botConfig } from '../config.js';
import { logger } from '../logger.js';

function toPersianDate(date: Date): string {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function formatLeadNotification(lead: Lead & { category: { title: string }; subcategory: { title: string } }): string {
  return [
    '🛎 درخواست جدید بیمه',
    '',
    `دسته: ${lead.category.title}`,
    `زیرشاخه: ${lead.subcategory.title}`,
    `نام: ${lead.fullName}`,
    `شماره تماس: ${lead.phoneNumber}`,
    `شهر: ${lead.city}`,
    `زمان تماس: ${lead.preferredContactTime}`,
    `تاریخ: ${toPersianDate(lead.createdAt)}`,
    lead.notes ? `توضیحات: ${lead.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export const notificationService = {
  notifyAdmins: async (api: Api, lead: Lead & { category: { title: string }; subcategory: { title: string } }) => {
    const message = formatLeadNotification(lead);
    const adminIds = botConfig.adminUserIds;

    if (adminIds.length === 0) {
      logger.warn('No admin Telegram user IDs configured; skipping admin notification.');
      return;
    }

    for (const adminId of adminIds) {
      try {
        await api.sendMessage(adminId, message);
        logger.info({ adminId, leadId: lead.id }, 'Admin notification sent');
      } catch (error) {
        logger.error({ adminId, leadId: lead.id, error }, 'Failed to send admin notification');
      }
    }
  },
};
