import { Telegraf, Markup } from 'telegraf';
import { MessageTemplete, Translate } from '../../../data/handler/template/message';
import EncryptionRepository from '../../../data/repository/encryption';
import TradeRepository from '../../../data/repository/wallet/trade';
import WalletRepository from '../../../data/repository/wallet/wallet';
import TelegramService from '../telegram.service';

export const useWalletBotRoutes = ({bot, telegramService} : {
    bot: Telegraf,
    walletRepository: WalletRepository,
    tradeRepository: TradeRepository,
    encryptionRepository: EncryptionRepository;
    telegramService: TelegramService
}) => {
    bot.action('wallet-menu', async (ctx) => {
        try {
            const translate = new Translate()
            const keyboard = (translate: Translate) => Markup.inlineKeyboard([
                [   Markup.button.callback(translate.c({en: '➕ Create new wallet', tch: '➕ 建立新錢包'}), 'create-wallet-menu'),
                    Markup.button.callback(translate.c({en: '⬇️ Import wallet', tch: '⬇️導入錢包'}), 'import-wallet-menu')
                ],
                [   Markup.button.callback(translate.c({en: '📤 Export wallet', tch: '📤 導出錢包'}), 'export-wallet-menu'),
                    Markup.button.callback(translate.c({en: '🗑️ Delete wallet', tch: '🗑️刪除錢包'}), 'remove-wallet-menu')
                ],
                [   Markup.button.callback(translate.c({en: '💼 Send Token', tch: '💼 發送令牌'}), 'send-token-menu'),
                    Markup.button.callback(translate.c({en: '💼 Wallet balance', tch: '💼 錢包餘額'}), 'wallet-balance-menu')
                ],
                [Markup.button.callback(translate.c({en: '🔙 Back to menu', tch: '🔙 返回選單'}), 'menu')]
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', keyboard(translate));

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.userOpensChat({ telegram_id });
            if (!response.user) return ctx.reply(response.message, keyboard(translate));

            translate.changeLanguage(response.user.default_language);

            const { text, entities } = MessageTemplete.generateWalletEntities(translate.c({
                en: "Wallet Hub 📔: Your crypto command center! View, Create, import, manage wallets, send/receive & peek at those 💰 balances",
                tch: "錢包中心 📔：您的加密貨幣指揮中心！查看、建立、匯入、管理錢包、發送/接收和查看這些 💰 餘額"
            }), response.user.wallets, response.user.default_language)

            ctx.reply(text, { ...keyboard(translate), entities, disable_web_page_preview: true });
        } catch (err) {
            console.log(err)
        }
    });
    

    bot.action('create-wallet-menu', async (ctx) => {
        try {
            const translate = new Translate()
            const keyboard = Markup.inlineKeyboard([
                Markup.button.callback('Add New', 'adding-new-wallet'),
                Markup.button.callback('🔙 Back 🔄', 'wallet-menu'),
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', keyboard);

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.userOpensChat({ telegram_id });
            if (!response.user) return ctx.reply(response.message, keyboard);

            ctx.reply(MessageTemplete.defaultMessage(translate.c({
                en: "Click on 'Add New' to create a new wallet",
                tch: "點擊“新增”以建立新錢包"
            }), response.user.default_language), keyboard);
        } catch (err) {
            console.log(err)
        }
    });

    bot.action('adding-new-wallet', async (ctx) => {
        try {
            const translate = new Translate()
            const keyboard = (translate: Translate) => Markup.inlineKeyboard([
                [   Markup.button.callback(translate.c({en: '➕ Create new wallet', tch: "➕ 建立新錢包"}), 'create-wallet-menu'),
                    Markup.button.callback(translate.c({en: '⬇️ Import wallet', tch: '⬇️導入錢包'}), 'import-wallet-menu')
                ],
                [   Markup.button.callback(translate.c({en: '📤 Export wallet', tch: '📤 導出錢包'}), 'export-wallet-menu'),
                    Markup.button.callback(translate.c({en: '🗑️ Delete wallet', tch: '🗑️刪除錢包'}), 'remove-wallet-menu')
                ],
                [   Markup.button.callback(translate.c({en: '💼 Send Token', tch: '💼 發送令牌'}), 'send-token-menu'),
                    Markup.button.callback(translate.c({en: '💼 Wallet balance', tch: '💼 錢包餘額'}), 'wallet-balance-menu')
                ],
                [Markup.button.callback(translate.c({en: '🔙 Back to menu', tch: '🔙 返回選單'}), 'menu')]
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', keyboard(translate));

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.userAddsWallet({ telegram_id });
            if (!response.user) return ctx.reply(response.message, keyboard(translate));
            translate.changeLanguage(response.user.default_language);

            const { text, entities } = MessageTemplete.generateWalletEntities(translate.c({
                en: 'Wallet Hub 📔: Your crypto command center! View, Create, import, manage wallets, send/receive & peek at those 💰 balances',
                tch: '錢包中心📔：您的加密貨幣指揮中心！ 查看、建立、匯入、管理錢包、發送/接收和查看這些 💰 餘額'
            }), response.user.wallets, response.user.default_language)

            ctx.reply(text, { ...keyboard(translate), entities, disable_web_page_preview: true });
        } catch (err) {
            console.log(err)
        }
    });

    bot.action('import-wallet-menu', async (ctx) => {
        try {
            const translate = new Translate()
            const keyboard = Markup.inlineKeyboard([
                Markup.button.callback('Try again', 'import-new-wallet'),
                Markup.button.callback('🔙 Back', 'wallet-menu'),
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', keyboard);

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.generateUserIDToken({ telegram_id });
            if (!response.token) return ctx.reply(response.message!, keyboard);

            const urlHost = getUrlForDomainWallet({ token: response.token, type: 'import_wallet'});

            const userResponse = await telegramService.userAddsWallet({ telegram_id });
            if (!userResponse.user) return ctx.reply(userResponse.message, keyboard);

            translate.changeLanguage(userResponse.user.default_language);

            const modifiedKeyboard = Markup.inlineKeyboard([
                Markup.button.webApp(translate.c({en: 'Click here to import', tch: '點此導入'}), urlHost),
                Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'wallet-menu'),
            ]);

            ctx.reply(MessageTemplete.defaultMessage(translate.c({
                en: "Enter the wallet private key and send to add wallet",
                tch: "輸入錢包私鑰並發送添加錢包",
            }), userResponse.user.default_language), modifiedKeyboard);
        } catch (err) {
            console.log(err)
        }
    });
    
    bot.action('export-wallet-menu', async (ctx) => {
        try {
            const translate = new Translate()
            const keyboard = Markup.inlineKeyboard([
                Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'wallet-menu'),
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', keyboard);

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.userOpensChat({ telegram_id });
            if (!response.user) return ctx.reply(response.message, keyboard);

            translate.changeLanguage(response.user.default_language);

            const { text, entities } = MessageTemplete.generateExportWalletEntities({wallets: response.user.wallets}, response.user.default_language)
            ctx.reply(text, { ...keyboard, entities, disable_web_page_preview: true });
        } catch (err) {
            console.log(err)
        }
    });

    bot.action('remove-wallet-menu', async (ctx) => {
        try {
            const translate = new Translate()
            const initialKeyboard = Markup.inlineKeyboard([
                [Markup.button.callback(translate.c({en: 'Buy', tch: '買'}), 'remove-wallet-menu')],
                [Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'wallet-menu')],
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', initialKeyboard);

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.userOpensChat({ telegram_id });
            if (!response.user) return ctx.reply(response.message, initialKeyboard);

            translate.changeLanguage(response.user.default_language);

            const keyboard = Markup.inlineKeyboard([[
                ...response.user.wallets.map((_wallet, index) => {
                    return Markup.button.callback(translate.c({en: `Wallet ${index+1}`, tch: `錢包 ${index+1}`}), `delete-wallet-${index+1}`);
                })],
                [Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'wallet-menu')],
            ]);

            const { text, entities } = MessageTemplete.generateWalletEntities(translate.c({en: "Select the wallet to remove", tch: "選擇要刪除的錢包"}), response.user.wallets, response.user.default_language);
            ctx.reply(text, { ...keyboard, entities, disable_web_page_preview: true });
        } catch (err) {
            console.log(err)
        }
    });

    [ 1, 2, 3 ].forEach((data, wallet_number) => {
        bot.action( `delete-wallet-${wallet_number+1}`, async (ctx) => {
            const translate = new Translate()
            try {
                const initialKeyboard = Markup.inlineKeyboard([
                    [Markup.button.callback(translate.c({en: 'try again', tch: '再試一次'}), `delete-wallet-${wallet_number+1}`)],
                    [Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'wallet-menu')],
                ]);

                if (!ctx.chat) return ctx.reply('unable to delete', initialKeyboard);

                const telegram_id = ctx.chat.id.toString();
                const response = await telegramService.userOpensChat({ telegram_id });
                if (!response.user) return ctx.reply(response.message, initialKeyboard);


                translate.changeLanguage(response.user.default_language);

                const keyboard = Markup.inlineKeyboard([
                    [Markup.button.callback(translate.c({en: 'Confirm Delete', tch: '確認刪除'}), `delete-wallet-confirm-${wallet_number}`)],
                    [Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'wallet-menu')],
                ]);

                ctx.reply(MessageTemplete.defaultMessage(translate.c({
                    en: `Click on "Confirm Wallet ${wallet_number}" if you really want to remove this wallet ${response.user?.wallets[wallet_number]?.address}`,
                    tch: `點擊"確認錢包 ${wallet_number}" 如果你真的想刪除這個錢包 ${response.user?.wallets[wallet_number]?.address}`
                }), response.user.default_language), keyboard);
            } catch (err) {
                console.log(err)
            }
        });
    });

    [ 1, 2, 3 ].forEach((data, wallet_number) => {
        bot.action( `delete-wallet-confirm-${wallet_number+1}`, async (ctx) => {
            try {
                const translate = new Translate()
                const initialKeyboard = Markup.inlineKeyboard([
                    [Markup.button.callback(translate.c({en: 'try again', tch: '再試一次'}), `delete-wallet-${wallet_number+1}`)],
                    [Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'wallet-menu')],
                ]);

                if (!ctx.chat) return ctx.reply('unable to confirm delete', initialKeyboard);

                const telegram_id = ctx.chat.id.toString();
                const response = await telegramService.userDeleteWallet({ telegram_id, wallet_number });
                if (!response.user) return ctx.reply(response.message, initialKeyboard);

                translate.changeLanguage(response.user.default_language);

                const keyboard = Markup.inlineKeyboard([[
                    ...response.user.wallets.map((_wallet, index) => {
                        return Markup.button.callback(translate.c({en: `Wallet ${index+1}`, tch: `錢包 ${index+1}`}), `wallet-menu`);
                    })],
                    [Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'wallet-menu')],
                ]);

                const { text, entities } = MessageTemplete.generateWalletEntities(translate.c({
                    en: '"Select the wallet to remove"',
                    tch: '選擇要刪除的錢包'
                }), response.user.wallets, response.user.default_language);

                ctx.reply(text, { ...keyboard, entities, disable_web_page_preview: true });
            } catch (err) {
                console.log(err)
            }
        });
    });

    bot.action('wallet-balance-menu', async (ctx) => {
        try {
            const translate = new Translate()
            const initialKeyboard = Markup.inlineKeyboard([
                [Markup.button.callback('Buy', 'remove-wallet-menu')],
                [Markup.button.callback('🔙 Back', 'wallet-menu')],
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', initialKeyboard);

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.userOpensChat({ telegram_id });
            if (!response.user) return ctx.reply(response.message, initialKeyboard);

            translate.changeLanguage(response.user.default_language);

            const keyboard = Markup.inlineKeyboard([[
                ...response.user.wallets.map((_wallet, index) => {
                    return Markup.button.callback(translate.c({en: `Wallet ${index+1}`, tch: `錢包 ${index+1}`}), `wallet-balance-${index+1}`);
                })],
                [Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'wallet-menu')],
            ]);

            ctx.reply(MessageTemplete.defaultMessage(translate.c({en: "Check wallet balance", tch: "查看錢包餘額"}), response.user.default_language), keyboard);
        } catch (err) {
            console.log(err)
        }
    });

    [ 1, 2, 3 ].forEach((data, wallet_number) => {
        bot.action( `wallet-balance-${wallet_number+1}`, async (ctx) => {
            try {
                const translate = new Translate()
                const initialKeyboard = Markup.inlineKeyboard([
                    [Markup.button.callback('try again', `wallet-balance-${wallet_number+1}`)],
                    [Markup.button.callback('🔙 Back', 'wallet-menu')],
                ]);

                if (!ctx.chat) return ctx.reply('unable to delete', initialKeyboard);

                const telegram_id = ctx.chat.id.toString();
                const response = await telegramService.getGeneralBalance({ telegram_id, wallet_number });
                if (!response.tokens) return ctx.reply(response.message!, initialKeyboard);

                const keyboard = Markup.inlineKeyboard(
                    // ...response.tokens.map((balance, index) => {
                    //     return Markup.button.callback(`Wallet ${index+1}`, `wallet-balance-${index+1}`);
                    // })],
                    [Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'wallet-menu')],
                );

                const userResponse = await telegramService.userOpensChat({ telegram_id });
                if (!userResponse.user) return ctx.reply(userResponse.message, keyboard);

                translate.changeLanguage(userResponse.user.default_language);

                const { text, entities } = MessageTemplete.generateWalletBalanceEntities({balances: response.tokens }, userResponse.user.default_language)
                ctx.reply(text, { ...keyboard, entities, disable_web_page_preview: true });
            } catch (err) {
                console.log(err)
            }
        });
    });

    bot.action('send-token-menu', async (ctx) => {
        try {
            const translate = new Translate()
            const initialKeyboard = Markup.inlineKeyboard([
                [Markup.button.callback('Try again', 'send-from-wallet')],
                [Markup.button.callback('🔙 Back', 'wallet-menu')],
            ]);

            if (!ctx.chat) return ctx.reply('unable to process message', initialKeyboard);

            const telegram_id = ctx.chat.id.toString();
            const response = await telegramService.userOpensChat({ telegram_id });
            if (!response.user) return ctx.reply(response.message, initialKeyboard);


            translate.changeLanguage(response.user.default_language);

            const keyboard = Markup.inlineKeyboard([[
                ...response.user.wallets.map((wallet, index) => {
                    const linkResponse = telegramService.generateUserIDToken({ telegram_id, wallet_address: wallet.address });
                    const urlHost = getUrlForDomainWallet2({ token: linkResponse.token?? "", type: 'transfer_token', wallet: wallet.address });
                    console.log(urlHost);
                    return Markup.button.webApp(translate.c({en: `Wallet ${index+1}`, tch: `錢包 ${index+1}`}), urlHost);
                })],
                [Markup.button.callback(translate.c({en: '🔙 Back', tch: '🔙 返回'}), 'wallet-menu')],
            ]);

            const { text, entities } = MessageTemplete.generateWalletEntities(translate.c({
                en: "Send token to another wallet address",
                tch: "將代幣發送到另一個錢包地址"
            }), response.user.wallets, response.user.default_language);

            ctx.reply(text, { ...keyboard, entities, disable_web_page_preview: true });
        } catch (err) {
            console.log(err)
        }
    });
} 

type UrlTypeWallet = 'import_wallet' | 'transfer_token' | 'transfer_etherium';

const getUrlForDomainWallet2 = ({ token, wallet, type }:{ token: string, wallet: string, type: UrlTypeWallet }) => {
    const url = `${process.env.INTEGRATION_WEB_HOST}/integrations/${type}?token=${token}&wallet_address=${wallet}`;
    return url;
}

const getUrlForDomainWallet = ({ token, type }:{ token: string, type: UrlTypeWallet }) => {
    const url = `${process.env.INTEGRATION_WEB_HOST}/integrations/${type}?token=${token}`;
    return url;
}

