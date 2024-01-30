import { Telegraf, Markup } from 'telegraf';
import { MessageEarnTemplate, MessageTemplete, Translate } from '../../../data/handler/template/message';
import EncryptionRepository from '../../../data/repository/encryption';
import TradeRepository from '../../../data/repository/wallet/trade';
import WalletRepository from '../../../data/repository/wallet/wallet';
import TelegramService from '../telegram.service';

export const useEarnBotRoutes = ({bot, telegramService} : {
    bot: Telegraf,
    walletRepository: WalletRepository,
    tradeRepository: TradeRepository,
    encryptionRepository: EncryptionRepository;
    telegramService: TelegramService
}) => {
    bot.action('earn-menu', async (ctx) => {
        try {
            const translate = new Translate()
            const keyboard = Markup.inlineKeyboard([
                [Markup.button.callback(translate.c({en: '👫 Refer & earn', tch: '👫 推薦並賺取'}), 'refer-friends-and-earn')],
                [Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'menu')],
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', keyboard);

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.userOpensChat({ telegram_id });
            if (!response.user) return ctx.reply(response.message, keyboard);

            const { text, entities } = MessageTemplete.generateWalletEntities(translate.c({
                en: "Earning 🌱: Grow your seeds into mighty oaks! Dive into referrals 🤝 & stake your claim",
                tch: "賺取🌱：將你的種子培育成強壯的橡樹！ 深入了解推薦🤝並提出您的主張"
            }), response.user.wallets, response.user.default_language);
            ctx.reply(text, { ...keyboard, entities, disable_web_page_preview: true });
        } catch (err) {
            console.log(err)
        }
    });

    bot.action('refer-friends-and-earn', async (ctx) => {
        try {
            const translate = new Translate()
            const intialKeyboard = Markup.inlineKeyboard([
                [ Markup.button.callback('🔙 Back', 'menu') ],
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', intialKeyboard);

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.userOpensChat({ telegram_id });
            const tokenResponse = await telegramService.generateUserIDToken({ telegram_id });
            if (!response.user) return ctx.reply(response.message, intialKeyboard);
            if (!tokenResponse.token) return ctx.reply(tokenResponse.message!, intialKeyboard);

            const urlHost = getUrlForDomainEarn({ token: tokenResponse.token, type: 'add_refer_code'});
            console.log(urlHost);

            const keyboard = Markup.inlineKeyboard([
                [ Markup.button.callback(translate.c({en: '💼 Claim reward', tch: '💼 領取獎勵'}), "cliam_user_reward") ],
                [ Markup.button.webApp(translate.c({en: '📈 Enter ref code', tch: '📈 輸入參考代碼'}), urlHost) ],
                [ Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'earn-menu') ],
            ]);

            ctx.reply(MessageEarnTemplate.generateReferalMessage(response.user, response.user.default_language), keyboard);
        } catch (err) {
            console.log(err)
        }
    });

    bot.action('cliam_user_reward', async (ctx) => {
        try {
            const translate = new Translate()
            const intialKeyboard = Markup.inlineKeyboard([
                [ Markup.button.callback('🔙 Back', 'menu') ],
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', intialKeyboard);

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.claimReferral({ telegram_id });
            const tokenResponse = telegramService.generateUserIDToken({ telegram_id });
            if (!response.user) return ctx.reply(response.message, intialKeyboard);
            if (!tokenResponse.token) return ctx.reply(tokenResponse.message!, intialKeyboard);

            const urlHost = getUrlForDomainEarn({ token: tokenResponse.token, type: 'add_refer_code'});

            translate.changeLanguage(response.user.default_language);

            const keyboard = Markup.inlineKeyboard([
                [ Markup.button.callback(translate.c({en: '💼 Claim reward', tch: '💼 領取獎勵'}), "cliam_user_reward") ],
                [ Markup.button.webApp(translate.c({en: '📈 Enter ref code', tch: '📈 輸入參考代碼'}), urlHost) ],
                [ Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'earn-menu') ],
            ]);

            ctx.reply(MessageTemplete.defaultMessage(translate.c(
                {en: "Claim rewards is coming soon",
                tch: "領取獎勵即將到來"
            }), response.user.default_language), keyboard);
        } catch (err) {
            console.log(err)
        }
    });
}

type UrlTypeWallet = 'add_refer_code';

const getUrlForDomainEarn = ({ token, type }:{ token: string, type: UrlTypeWallet }) => {
    const url = `${process.env.INTEGRATION_WEB_HOST}/integrations/${type}?token=${token}`;
    return url;
}