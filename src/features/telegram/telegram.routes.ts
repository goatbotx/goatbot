import { Telegraf, Markup } from 'telegraf';
import { MessageTemplete, Translate } from '../../data/handler/template/message';
import { UserModel } from '../../data/repository/database/models/user';
import EncryptionRepository from '../../data/repository/encryption';
import TradeRepository from '../../data/repository/wallet/trade';
import WalletRepository from '../../data/repository/wallet/wallet';
import { useBotsBotRoutes } from './routes/bots.routes';
import { useEarnBotRoutes } from './routes/earn.routes';
import { useSettingBotRoutes } from './routes/setting.routes';
import { useTradeBotRoutes } from './routes/trade.routes';
import { useWalletBotRoutes } from './routes/wallet.routes';
import TelegramService from './telegram.service';

export const useTelegramBot = () => {
    const YOUR_BOT_TOKEN = process.env.YOUR_BOT_TOKEN!;

    const bot = new Telegraf(YOUR_BOT_TOKEN);
    const walletRepository = new WalletRepository();
    const tradeRepository = new TradeRepository();
    const encryptionRepository = new EncryptionRepository();
    const telegramService = new TelegramService({ userModel: UserModel, walletRepository, tradeRepository, encryptionRepository });
    
    bot.start(async (ctx) => {
        const translate = new Translate();
        const keyboard = (translate: Translate) => {
            return Markup.inlineKeyboard([
                [   Markup.button.callback(translate.c({en: '💼 Wallet hubx', tch: '💼 皮夾集線器'}), 'wallet-menu'),
                    Markup.button.callback(translate.c({en: '💹 Start trading', tch: '💹 開始交易'}), 'trade-menu'),
                ],
                [   Markup.button.callback(translate.c({en: '🤖 Bot center', tch: '🤖 機器人中心'}), 'bots-menu'),
                    Markup.button.callback(translate.c({en: '💰 Earn rewards', tch: '💰 賺取獎勵'}), 'earn-menu')],
                [Markup.button.callback(translate.c({en: '🔧 Settings & tools', tch: '🔧 設定和工具'}), 'setting-menu')],
            ]);
        }
        if (!ctx.chat) return;
        const telegram_id = ctx.chat.id.toString();

        const response = await telegramService.userOpensChat({ telegram_id });
        if (!response.user) return bot.telegram.sendMessage(telegram_id, response.message);

        translate.changeLanguage(response.user.default_language);

        const { text, entities } = MessageTemplete.generateWalletEntities(translate.c({
            en: "Elevate Your Crypto Trades with GOATBOT Greatest Of All Telegram Bots",
            tch: "使用所有 Telegram 機器人中最出色的 GOATBOT 提升您的加密貨幣交易",
        }), response.user.wallets, response.user.default_language)
        ctx.reply(text, { ...keyboard(translate), entities, disable_web_page_preview: true });
    });

    bot.action('menu', async (ctx) => {    
        const translate = new Translate();
        const keyboard = (translate: Translate) => {
            return Markup.inlineKeyboard([
                [   Markup.button.callback(translate.c({en: '💼 Wallet hub', tch: '💼 皮夾集線器'}), 'wallet-menu'),
                    Markup.button.callback(translate.c({en: '💹 Start trading', tch: '💹 開始交易'}), 'trade-menu'),
                ],
                [   Markup.button.callback(translate.c({en: '🤖 Bot center', tch: '🤖 機器人中心'}), 'bots-menu'),
                    Markup.button.callback(translate.c({en: '💰 Earn rewards', tch: '💰 賺取獎勵'}), 'earn-menu')],
                [Markup.button.callback(translate.c({en: '🔧 Settings & tools', tch: '🔧 設定和工具'}), 'setting-menu')],
            ]);
        }

        if (!ctx.chat) return ctx.reply('unable to process message', keyboard(translate));

        const telegram_id = ctx.chat.id.toString();
        const response = await telegramService.userOpensChat({ telegram_id });
        if (!response.user) return ctx.reply(response.message, keyboard(translate));

        translate.changeLanguage(response.user.default_language)

        const { text, entities } = MessageTemplete.generateWalletEntities(translate.c({
            en: "Elevate Your Crypto Trades with GOATBOT Greatest Of All Telegram Bots",
            tch: "使用所有 Telegram 機器人中最出色的 GOATBOT 提升您的加密貨幣交易",
        }), response.user.wallets, response.user.default_language)
        ctx.reply(text, { ...keyboard(translate), entities, disable_web_page_preview: true });
    });

    useWalletBotRoutes({bot, walletRepository, tradeRepository, encryptionRepository, telegramService});

    useTradeBotRoutes({bot, walletRepository, tradeRepository, encryptionRepository, telegramService});

    useBotsBotRoutes({bot, walletRepository, tradeRepository, encryptionRepository, telegramService});

    useEarnBotRoutes({bot, walletRepository, tradeRepository, encryptionRepository, telegramService});

    useSettingBotRoutes({bot, walletRepository, tradeRepository, encryptionRepository, telegramService});

    bot.launch();
}
