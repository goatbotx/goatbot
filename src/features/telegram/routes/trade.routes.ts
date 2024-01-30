import { Telegraf, Markup } from 'telegraf';
import { MessageTemplete, Translate } from '../../../data/handler/template/message';
import EncryptionRepository from '../../../data/repository/encryption';
import TradeRepository from '../../../data/repository/wallet/trade';
import WalletRepository from '../../../data/repository/wallet/wallet';
import TelegramService from '../telegram.service';

export const useTradeBotRoutes = ({bot, walletRepository, tradeRepository, encryptionRepository, telegramService} : {
    bot: Telegraf,
    walletRepository: WalletRepository,
    tradeRepository: TradeRepository,
    encryptionRepository: EncryptionRepository;
    telegramService: TelegramService
}) => {
    bot.action('trade-menu', async (ctx) => {
        try {
            const translate = new Translate()
            const keyboard = (translate: Translate) => Markup.inlineKeyboard([
                [   Markup.button.callback(translate.c({en: '🟢 Swap', tch: '🟢交換'}), 'market-order-menu'),
                    Markup.button.callback(translate.c({en: '🟠 Limit order', tch: '🟠 限價訂單'}), 'limit-order-menu')
                ],
                [Markup.button.callback(translate.c({en: '📜 View transactions ', tch: '📜 看交易'}), 'view-transaction-history')],
                [Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'menu'),]
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', keyboard(translate));

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.userOpensChat({ telegram_id });
            if (!response.user) return ctx.reply(response.message, keyboard(translate));

            translate.changeLanguage(response.user.default_language);

            const { text, entities } = MessageTemplete.generateWalletEntities(translate.c({
                en: "Trading 📈: Dive into the financial oceans! Market Buy 🛍 & sell 🏷, Limit Buy 🛍 & sell 🏷, and keep a hawk's 👁 on your trades.",
                tch: "交易📈：潛入金融海洋！ 市場買入🛍和賣出🏷，限價買入🛍和賣出🏷，並對您的交易保持鷹派👁。"
            }), response.user.wallets, response.user.default_language);
            ctx.reply(text, { ...keyboard, entities, disable_web_page_preview: true });
        } catch (err) {
            console.log(err)
        }
    });

    bot.action('market-order-menu', async (ctx) => {
        try {
            const translate = new Translate()
            const initialKeyboard = (translate: Translate) => Markup.inlineKeyboard([
                [Markup.button.callback(translate.c({en: 'Buy', tch: '買'}), 'buy-market-order-menu')],
                [Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'trade-menu')],
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', initialKeyboard(translate));

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.userOpensChat({ telegram_id });
            if (!response.user) return ctx.reply(response.message, initialKeyboard(translate));
            
            translate.changeLanguage(response.user.default_language);

            const keyboard = Markup.inlineKeyboard([[
                ...response.user.wallets.map((wallet, index) => {
                    const linkResponse = telegramService.generateUserIDToken({ telegram_id, wallet_address: wallet.address });
                    const urlHost = getUrlForDomainTrade({ token: linkResponse.token?? "", wallet: wallet.address?? "", type: 'market_swap'});
                    console.log(urlHost);
                    return Markup.button.webApp(` Wallet ${index+1}`, urlHost);
                })],
                [Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'trade-menu')],
            ]);

            const { text, entities } = MessageTemplete.generateWalletEntities(translate.c({
                en: "🐐 GoatBot | Swap Now 💸\n\n"+
                    "Got profits or adjusting your assets? Easily swap your holdings with GoatBot.\n\n"+
                    
                    "🔄 How to Swap:\n"+
                    "- Click /swap to start.\n"+
                    "- Enter token contract address.\n"+
                    "- Choose pair & amount.\n"+
                    "- Confirm & execute.\n\n"+
                    
                    "Ready to swap? Click /swap now!\n",
                tch: "🐐 GoatBot | 立即兌換 💸\n\n"+
                    "「獲得利潤或調整您的資產？使用 GoatBot 輕鬆交換您的持股。\n\n"+
                
                    "🔄 如何交換：\n"+
                    "- 點選 /swap 開始。\n"+
                    "- 輸入代幣合約地址。\n"+
                    "- 選擇配對和數量。\n"+
                    "- 確認並執行。\n\n"+
                
                    "準備好交換了嗎？立即點擊 /swap！\n"
            }) , response.user.wallets, response.user.default_language, false);

            ctx.reply(text, { ...keyboard, entities, disable_web_page_preview: true });
        } catch (err) {
            console.log(err)
        }
    });

    bot.action('limit-order-menu', async (ctx) => {
        try {
            const translate = new Translate()
            const initialKeyboard = Markup.inlineKeyboard([
                [Markup.button.callback('🔙 Back', 'trade-menu')],
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', initialKeyboard);

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.userOpensChat({ telegram_id });
            if (!response.user) return ctx.reply(response.message, initialKeyboard);

            const keyboard = Markup.inlineKeyboard([[
                ...response.user.wallets.map((wallet, index) => {
                    const linkResponse = telegramService.generateUserIDToken({ telegram_id, wallet_address: wallet.address });
                    const urlHost = getUrlForDomainTrade({ token: linkResponse.token?? "", wallet: wallet.address?? "", type: 'limit_swap'});
                    return Markup.button.webApp(` Wallet ${index+1}`, urlHost);
                })],
                [Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'trade-menu')],
            ]);

            const { text, entities } = MessageTemplete.generateWalletEntities(translate.c({
                en: "🐐 GoatBot | Limit Orders 📈\n\n"+
                    "Ready for strategic moves? Place limit buy/sell orders with GoatBot for precise control over your crypto assets.\n\n"+
                    "🔄 How to Set a Limit Order:\n"+
                    "- Click /limit order to initiate.\n"+
                    "- Enter token contract address.\n"+
                    "- Specify pair, amount, and limit price.\n"+
                    "- Confirm & set your limit swap order.\n\n"+
                    "Set your limits! Click /limit order now.\n",
                tch: "🐐 GoatBot | 限價訂單📈\n\n"+
                    "準備好採取策略行動了嗎？使用 GoatBot 下限價買入/賣出訂單，以精確控制您的加密資產。\n\n" +
                    "🔄 如何設定限價單：\n"+
                    "- 點擊/限價訂單啟動。\n"+
                    "- 輸入代幣合約地址。\n"+
                    "- 指定貨幣對、金額和限價。\n"+
                    "- 確認並設定您的限價掉期訂單。\n\n"+
                    "設定您的限制！立即點擊/限價訂單。\n"
            })
            , response.user.wallets, response.user.default_language, false);

            ctx.reply(text, { ...keyboard, entities, disable_web_page_preview: true });
        } catch (err) {
            console.log(err)
        }
    });

    bot.action('view-transaction-history', async (ctx) => {
        try {
            const translate = new Translate()
            const initialKeyboard = Markup.inlineKeyboard([
                [Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'trade-menu')],
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', initialKeyboard);

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.userOpensChat({ telegram_id });
            if (!response.user) return ctx.reply(response.message, initialKeyboard);

            const keyboard = Markup.inlineKeyboard([[
                ...response.user.wallets.map((wallet, index) => {
                    return Markup.button.webApp(`Wallet ${index+1}`, `https://etherscan.io/txs?a=${wallet.address}`);
                })],
                [Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'trade-menu')],
            ]);

            const { text, entities } = MessageTemplete.generateWalletEntities(translate.c({
                en: " 📜 View Transaction History 🔍: Curious about your past maneuvers? Take a stroll down memory lane and review all your trade activities, beautifully documented and easy to understand",
                tch: " 📜 查看交易歷史記錄 🔍：對您過去的操作感到好奇嗎？沿著記憶小徑漫步並回顧您所有的交易活動，記錄精美且易於理解"
            }), response.user.wallets, response.user.default_language);
            ctx.reply(text, { ...keyboard, entities, disable_web_page_preview: true });
        } catch (err) {
            console.log(err)
        }
    });
    
} 

type UrlType = 'market_buy' | 'market_sell' | 'limit_buy' | 'limit_sell' | 'market_swap' | 'limit_swap';

const getUrlForDomainTrade = ({ token, wallet, type }:{ token: string, wallet: string, type: UrlType }) => {
    const url = `${process.env.INTEGRATION_WEB_HOST}/integrations/${type}?token=${token}&wallet_address=${wallet}`;
    return url;
}