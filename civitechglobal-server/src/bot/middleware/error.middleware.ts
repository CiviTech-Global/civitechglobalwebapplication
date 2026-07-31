import type { Context, MiddlewareFn } from 'grammy';
import { logger } from '../logger.js';

export const errorMiddleware: MiddlewareFn<Context> = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      {
        errorMessage,
        chatId: ctx.chat?.id,
        userId: ctx.from?.id,
        updateType: (ctx as { updateType?: string }).updateType,
      },
      'Unhandled bot error',
    );

    try {
      await ctx.reply('متأسفانه خطایی رخ داد. لطفا دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.');
    } catch (replyError) {
      const replyErrorMessage = replyError instanceof Error ? replyError.message : String(replyError);
      logger.error({ replyErrorMessage }, 'Failed to send error reply');
    }
  }
};
