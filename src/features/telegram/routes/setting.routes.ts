import { Telegraf, Markup } from 'telegraf';
import { MessageTemplete, Translate } from '../../../data/handler/template/message';
import EncryptionRepository from '../../../data/repository/encryption';
import TradeRepository from '../../../data/repository/wallet/trade';
import WalletRepository from '../../../data/repository/wallet/wallet';
import TelegramService from '../telegram.service';
import { Language } from '../../../data/repository/database/models/user';

export const useSettingBotRoutes = ({bot, walletRepository, tradeRepository, encryptionRepository, telegramService} : {
    bot: Telegraf,
    walletRepository: WalletRepository,
    tradeRepository: TradeRepository,
    encryptionRepository: EncryptionRepository;
    telegramService: TelegramService
}) => {
    bot.action('setting-menu', async (ctx) => {
        try {
            const translate = new Translate()
            const keyboard = (translate: Translate) => Markup.inlineKeyboard([
                Markup.button.callback(translate.c({en: '🗑️ Delete account', tch: '🗑️刪除帳戶'}), 'delete-account'),
                Markup.button.callback(translate.c({en: '🔐 Set password', tch: '🔐設定密碼'}), 'set-password'),
                Markup.button.callback(translate.c({en: 'Change language', tch: '改變語言'}), 'change-language'),
                Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'menu'),
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', keyboard(translate));

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.userOpensChat({ telegram_id });
            if (!response.user) return ctx.reply(response.message, keyboard(translate));

            translate.changeLanguage(response.user.default_language)

            const { text, entities } = MessageTemplete.generateWalletEntities(translate.c({
                en: "Settings ⚙️: Tailor GoatBot in your style! Customize, tweak, and make it truly yours.",
                tch: "設定⚙️：按照您的風格自訂 GoatBot！ 客製化、調整並使其真正屬於您。"
            }), response.user.wallets, response.user.default_language)
            ctx.reply(text, { ...keyboard(translate), entities, disable_web_page_preview: true });
        } catch (err) {
            console.log(err)
        }
    });

    bot.action('change-language', async (ctx) => {
        try {
            const translate = new Translate()
            const keyboard = (translate: Translate) => Markup.inlineKeyboard([
                [ Markup.button.callback(translate.c({en: 'English', tch: 'English'}), 'set-langauge-english') ],
                [ Markup.button.callback(translate.c({en: 'Chinese', tch: 'Chinese'}), 'set-langauge-chinese') ],
                [ Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'setting-menu') ],
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', keyboard(translate));

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.userOpensChat({ telegram_id });
            if (!response.user) return ctx.reply(response.message, keyboard(translate));

            translate.changeLanguage(response.user.default_language)

            ctx.reply(MessageTemplete.defaultMessage(translate.c({
                en: "Select any of the options",
                tch: "選擇任意選項"
            }), response.user.default_language), keyboard(translate));
        } catch (err) {
            console.log(err)
        }
    });

    bot.action('set-langauge-english', async (ctx) => {
        try {
            const translate = new Translate()
            const keyboard = (translate: Translate) => Markup.inlineKeyboard([
                Markup.button.callback(translate.c({en: '🗑️ Delete account', tch: '🗑️刪除帳戶'}), 'delete-account'),
                Markup.button.callback(translate.c({en: '🔐 Set password', tch: '🔐設定密碼'}), 'set-password'),
                Markup.button.callback(translate.c({en: 'Change language', tch: '改變語言'}), 'change-language'),
                Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'menu'),
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', keyboard(translate));

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.changeLanguage({ telegram_id, langauge: Language.english });
            if (!response.user) return ctx.reply(response.message, keyboard(translate));

            translate.changeLanguage(response.user.default_language)

            ctx.reply(MessageTemplete.defaultMessage(translate.c({
                en: "Select any of the options",
                tch: "選擇任意選項"
            }), response.user.default_language), keyboard(translate));
        } catch (err) {
            console.log(err)
        }
    });

    bot.action('set-langauge-chinese', async (ctx) => {
        try {
            const translate = new Translate()
            const keyboard = (translate: Translate) => Markup.inlineKeyboard([
                Markup.button.callback(translate.c({en: '🗑️ Delete account', tch: '🗑️刪除帳戶'}), 'delete-account'),
                Markup.button.callback(translate.c({en: '🔐 Set password', tch: '🔐設定密碼'}), 'set-password'),
                Markup.button.callback(translate.c({en: 'Change language', tch: '改變語言'}), 'change-language'),
                Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'menu'),
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', keyboard(translate));

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.changeLanguage({ telegram_id, langauge: Language.traditional_chinese });
            if (!response.user) return ctx.reply(response.message, keyboard(translate));

            translate.changeLanguage(response.user.default_language)

            ctx.reply(MessageTemplete.defaultMessage(translate.c({
                en: "Select any of the options",
                tch: "選擇任意選項"
            }), response.user.default_language), keyboard(translate));
        } catch (err) {
            console.log(err)
        }
    });
}