import { Markup, Telegraf } from "telegraf";
import { MessageTemplete } from "../../handler/template/message";
import { LimitMarketModel } from "../database/models/limit";
import { UserModel } from "../database/models/user";
import TradeRepository from './trade';

export const LimitBuySell = async ({ tradeRepository, telegrambot } : { tradeRepository: TradeRepository, telegrambot: Telegraf}) => {
    const limitbuySells = await LimitMarketModel.find();
    console.log('run: ', limitbuySells);

    for (const element of limitbuySells) {
        const limitbuySell = element;

        console.log(limitbuySell);

        const user = await UserModel.findOne({telegram_id: limitbuySell.userId});
        if (!user) continue;

        const wallet = user.wallets.find((wallet) => wallet.address === limitbuySell.walletAddress);
        if (!wallet) continue;

        if (limitbuySell.marketType == 'buy') {
            const currentToken = await tradeRepository.getCoinByContractAddress({ contract_address: limitbuySell.tokenInfo.contractAddress });

            if (!currentToken.contract?.constant_price) {
                continue;
            }

            if (parseFloat(currentToken.contract.constant_price) > limitbuySell.price) {
                continue;
            }
            const response = await tradeRepository.swapEthToToken({
                wallet,
                amount: limitbuySell.amount,
                slippage: limitbuySell.slippage,
                tokenInfo: limitbuySell.tokenInfo,
                gas_fee: 1000000
            }, (data) => {
                telegrambot.telegram.sendMessage(
                    user.telegram_id,
                    MessageTemplete.buyNotificationMessage(user, data, user.default_language),
                    Markup.inlineKeyboard([
                        [ Markup.button.callback('🔙 Back', 'menu') ],
                    ])
                );
              });
            if (response.status) {
                await LimitMarketModel.findByIdAndRemove(limitbuySell._id);
            }
        }

        if (limitbuySell.marketType == 'sell') {
            const currentToken = await tradeRepository.getCoinByContractAddress({ contract_address: limitbuySell.tokenInfo.contractAddress });

            if (!currentToken.contract?.constant_price) {
                continue;
            }

            if (parseFloat(currentToken.contract.constant_price) < limitbuySell.price) {
                continue;
            }

            const response = await tradeRepository.swapTokenToEth({
                wallet,
                amount: limitbuySell.amount,
                slippage: limitbuySell.slippage,
                tokenInfo: limitbuySell.tokenInfo,
                gas_fee: 1000000
            }, (data) => {
                telegrambot.telegram.sendMessage(
                    user.telegram_id,
                    MessageTemplete.buyNotificationMessage(user, data, user.default_language),
                    Markup.inlineKeyboard([
                        [ Markup.button.callback('🔙 Back', 'menu') ],
                    ])
                );
              })
            if (response.status) {
                await LimitMarketModel.findByIdAndRemove(limitbuySell._id);
            }
        }
    }

}

export const continueMarketCheck = async () => {
    try {
        console.log("Initialized Limit buy and sell");
        const YOUR_BOT_TOKEN = process.env.YOUR_BOT_TOKEN!;

        const tradeRepository = new TradeRepository();
        const telegrambot = new Telegraf(YOUR_BOT_TOKEN);

        setInterval(() => {
            LimitBuySell({ tradeRepository, telegrambot });
        }, 1000 * 60 * 5);
    } catch (err) {
        console.log(err);
    }
}