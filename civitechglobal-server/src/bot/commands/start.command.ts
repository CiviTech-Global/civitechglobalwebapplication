import type { BotContext } from '../types.js';
import { logger } from '../logger.js';

export const startCommand = async (ctx: BotContext) => {
  try {
    const firstName = ctx.from?.first_name || '';
    const welcomeMessage = firstName
      ? `سلام ${firstName} 👋\n\nبه سامانه خدمات بیمه خوش آمدید.`
      : 'سلام 👋\n\nبه سامانه خدمات بیمه خوش آمدید.';

    await ctx.reply(welcomeMessage);
    await ctx.conversation.enter('lead-conversation');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error({ errorMessage, errorStack, error }, 'Failed to enter lead conversation');
    await ctx.reply('متأسفانه خطایی رخ داد. لطفا دوباره تلاش کنید.');
  }
};
