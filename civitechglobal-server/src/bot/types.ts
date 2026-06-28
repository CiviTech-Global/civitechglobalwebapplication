import type { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import type { Context, SessionFlavor } from 'grammy';

export type PreferredContactTime = 'صبح' | 'ظهر' | 'عصر';

export interface LeadData {
  categoryId?: string;
  categoryTitle?: string;
  subcategoryId?: string;
  subcategoryTitle?: string;
  fullName?: string;
  phoneNumber?: string;
  city?: string;
  preferredContactTime?: PreferredContactTime;
  notes?: string;
}

export interface SessionData {
  lead: LeadData;
}

type BaseContext = Context & SessionFlavor<SessionData>;
export type BotContext = BaseContext & ConversationFlavor<BaseContext>;
export type BotConversation = Conversation<BaseContext, BotContext>;
