import { leadRepository, type CreateLeadInput } from '../../database/prisma/repositories/lead.repository.js';
import { decryptLead, decryptLeads } from '../../utils/piiTransform.js';

export const leadService = {
  createLead: async (data: CreateLeadInput) => {
    const lead = await leadRepository.createFromBot(data);
    const decrypted = decryptLead(lead);
    if (!decrypted) throw new Error('Failed to decrypt created lead');
    return decrypted;
  },

  getLeadById: async (id: string) => {
    const lead = await leadRepository.findById(id);
    return lead ? decryptLead(lead) : null;
  },

  getLeadsByTelegramUserId: async (telegramUserId: string) => {
    const leads = await leadRepository.findByTelegramUserId(telegramUserId);
    return decryptLeads(leads);
  },
};
