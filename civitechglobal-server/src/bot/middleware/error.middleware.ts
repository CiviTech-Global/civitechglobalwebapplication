import type { Context, MiddlewareFn } from 'grammy';
import { logger } from '../logger.js';

export const errorMiddleware: MiddlewareFn<Context> = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error({ errorMessage, errorStack, error, update: ctx.update }, 'Unhandled bot error');

    try {
      await ctx.reply(
        'متأسفانه خطایی رخ داد. لطفا دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.',
      );
    } catch (replyError) {
      const replyErrorMessage = replyError instanceof Error ? replyError.message : String(replyError);
      logger.error({ replyErrorMessage, replyError }, 'Failed to send error reply');
    }
  }
};
