import { Telegraf, Markup } from 'telegraf';
import { MessageTemplete, Translate } from '../../../data/handler/template/message';
import EncryptionRepository from '../../../data/repository/encryption';
import TradeRepository from '../../../data/repository/wallet/trade';
import WalletRepository from '../../../data/repository/wallet/wallet';
import TelegramService from '../telegram.service';

export const useBotsBotRoutes = ({bot, telegramService} : {
    bot: Telegraf,
    walletRepository: WalletRepository,
    tradeRepository: TradeRepository,
    encryptionRepository: EncryptionRepository;
    telegramService: TelegramService
}) => {
    
    bot.action('bots-menu', async (ctx) => {
        try {
            const translate = new Translate()
            const keyboard = (translate: Translate) => Markup.inlineKeyboard([
                [   Markup.button.callback(translate.c({en: '🎯 Sniper bot', tch: '🎯 狙擊機器人'}), 'activate-sniper-bot'),
                    Markup.button.callback(translate.c({en: '🚀 Frontrunner bot', tch: '🚀 領跑者機器人'}), 'activate-frontrunner-bot')],
                [   Markup.button.callback(translate.c({en: '🪞 Mirror bot', tch: '🪞 鏡像機器人'}), 'activate-mirror-bot'),
                    Markup.button.callback(translate.c({en: '📊 Bot stats', tch: '📊 機器人統計數據'}), 'check-bot-performance')],
                [Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'menu')],
            ]);

            if (!ctx.chat) return ctx.reply(translate.c({en: 'unable to process message', tch: '無法處理訊息'}), keyboard(translate));

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.userOpensChat({ telegram_id });
            if (!response.user) return ctx.reply(response.message, keyboard(translate));

            translate.changeLanguage(response.user.default_language);

            const { text, entities } = MessageTemplete.generateWalletEntities( translate.c({
                en: '"Bot Center 🤖: Automate like a pro! Sniper 🎯, frontrunner 🏃, mirror 🪞 bots & beyond."',
                tch: '機器人中心🤖：像專業人士一樣自動化！ 狙擊手🎯、領先者🏃、鏡子🪞機器人等等。'
            }), response.user.wallets, response.user.default_language);
            ctx.reply(text, { ...keyboard, entities, disable_web_page_preview: true });
        } catch (err) {
            console.log(err)
        }
    });

    bot.action( `activate-sniper-bot`, async (ctx) => {
        try {
            const translate = new Translate()
            const initialKeyboard = Markup.inlineKeyboard([
                [Markup.button.callback('🔙 Back', 'bots-menu')],
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', initialKeyboard);

            const telegram_id = ctx.chat.id.toString();

            const response = await telegramService.claimReferral({ telegram_id });
            if (!response.user) return ctx.reply(response.message, initialKeyboard);

            translate.changeLanguage(response.user.default_language);

            ctx.reply(MessageTemplete.defaultMessage(`This feature is coming soon`, response.user.default_language), initialKeyboard);
        } catch (err) {
            console.log(err)
        }
    });

    bot.action( `activate-frontrunner-bot`, async (ctx) => {
        try {
            const translate = new Translate()
            const initialKeyboard = Markup.inlineKeyboard([
                [Markup.button.callback('🔙 Back', 'bots-menu')],
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', initialKeyboard);

            const telegram_id = ctx.chat.id.toString();

            const response = await telegramService.claimReferral({ telegram_id });
            if (!response.user) return ctx.reply(response.message, initialKeyboard);

            translate.changeLanguage(response.user.default_language)
            
            ctx.reply(MessageTemplete.defaultMessage(translate.c({
                en: 'This feature is coming soon',
                tch: '此功能即將推出'
            }), response.user.default_language), initialKeyboard);
        } catch (err) {
            console.log(err)
        }
    });

    bot.action( `activate-mirror-bot`, async (ctx) => {
        try {
            const translate = new Translate()
            const initialKeyboard = Markup.inlineKeyboard([
                [Markup.button.callback('🔙 Back', 'bots-menu')],
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', initialKeyboard);

            const telegram_id = ctx.chat.id.toString();

            const response = await telegramService.claimReferral({ telegram_id });
            if (!response.user) return ctx.reply(response.message, initialKeyboard);

            translate.changeLanguage(response.user.default_language)
            ctx.reply(MessageTemplete.defaultMessage(translate.c({
                en: 'This feature is coming soon',
                tch: '此功能即將推出'
            }), response.user.default_language), initialKeyboard);
        } catch (err) {
            console.log(err)
        }
    });

    bot.action( `check-bot-performance`, async (ctx) => {
        try {
            const translate = new Translate()
            const initialKeyboard = Markup.inlineKeyboard([
                [Markup.button.callback('🔙 Back', 'bots-menu')],
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', initialKeyboard);

            const telegram_id = ctx.chat.id.toString();

            const response = await telegramService.claimReferral({ telegram_id });
            if (!response.user) return ctx.reply(response.message, initialKeyboard);

            translate.changeLanguage(response.user.default_language)
            ctx.reply(MessageTemplete.defaultMessage(translate.c({
                en: 'This feature is coming soon',
                tch: '此功能即將推出'
            }), response.user.default_language), initialKeyboard);
        } catch (err) {
            console.log(err)
        }
    });
}