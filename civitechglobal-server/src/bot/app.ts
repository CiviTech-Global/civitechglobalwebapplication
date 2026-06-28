import fastify from 'fastify';
import { Bot, GrammyError, HttpError } from 'grammy';
import { conversations, createConversation } from '@grammyjs/conversations';
import { session } from 'grammy';
import { botConfig } from './config.js';
import { logger } from './logger.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { startCommand } from './commands/start.command.js';
import { helpCommand } from './commands/help.command.js';
import { cancelCommand } from './commands/cancel.command.js';
import { leadConversation } from './conversations/lead.conversation.js';
import type { BotContext, SessionData } from './types.js';

export function createBot(): Bot<BotContext> {
  const bot = new Bot<BotContext>(botConfig.token);

  bot.use(errorMiddleware);

  bot.use(
    session({
      initial: (): SessionData => ({
        lead: {},
      }),
    }),
  );

  bot.use(conversations());
  bot.use(createConversation(leadConversation, 'lead-conversation'));

  bot.command('start', startCommand);
  bot.command('help', helpCommand);
  bot.command('cancel', cancelCommand);

  bot.on('message:text', async (ctx) => {
    if (ctx.msg.text.startsWith('/')) return;
    await ctx.reply('برای شروع درخواست بیمه روی /start کلیک کنید.');
  });

  bot.catch((error) => {
    if (error instanceof GrammyError) {
      logger.error({ error: error.description }, 'Grammy error');
    } else if (error instanceof HttpError) {
      logger.error({ error: error.error }, 'Telegram HTTP error');
    } else {
      logger.error({ error }, 'Bot error');
    }
  });

  return bot;
}

export async function createApp(): Promise<ReturnType<typeof fastify>> {
  const app = fastify({
    logger: {
      level: botConfig.isProduction ? 'info' : 'debug',
    },
  });
  const bot = createBot();

  app.get('/health', async () => ({ status: 'ok', service: 'telegram-bot' }));

  if (botConfig.mode === 'webhook' && botConfig.webhookUrl) {
    app.post('/webhook', async (request, reply) => {
      const update = request.body as any;
      await bot.handleUpdate(update);
      return reply.status(200).send({ ok: true });
    });

    await bot.api.setWebhook(botConfig.webhookUrl);
    logger.info({ webhookUrl: botConfig.webhookUrl }, 'Webhook set');
  }

  app.addHook('onReady', async () => {
    if (botConfig.mode !== 'webhook') {
      bot.start().catch((error) => {
        logger.error({ error }, 'Bot polling error');
      });
      logger.info('Bot started in polling mode');
    }
  });

  app.addHook('onClose', async () => {
    if (botConfig.mode !== 'webhook') {
      await bot.stop();
    }
    logger.info('Bot stopped');
  });

  return app;
}
