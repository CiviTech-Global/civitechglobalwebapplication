import {
  leadRepository,
  type CreateLeadInput,
} from '../../database/prisma/repositories/lead.repository.js';

export const leadService = {
  createLead: (data: CreateLeadInput) => {
    return leadRepository.create(data);
  },

  getLeadById: (id: string) => {
    return leadRepository.findById(id);
  },

  getLeadsByTelegramUserId: (telegramUserId: string) => {
    return leadRepository.findByTelegramUserId(telegramUserId);
  },
};
