import type { BotContext } from '../types.js';

export const cancelCommand = async (ctx: BotContext) => {
  await ctx.conversation.exit('lead-conversation');
  await ctx.reply('فرآیند لغو شد. برای شروع مجدد روی /start کلیک کنید.');
};
