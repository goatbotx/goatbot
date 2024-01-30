import TelegramBot from "node-telegram-bot-api";
import { SessionMessage, SessionType } from "../../handler/type";
import { IUser, UserModel } from "../database/models/user";
import WalletRepository from "../wallet/wallet";
const token = '6010824016:AAE9Eohr5_lvNwD0fSTnbaDjjhkmrEhMBKM';
class TelegramBotRepository {
    bot: TelegramBot;
    walletRepository: WalletRepository;
    userModel: typeof UserModel;

    constructor( userModel: typeof UserModel, walletRepository: WalletRepository){
        this.bot = new TelegramBot(token, {polling: true});
        this.walletRepository = walletRepository;
        this.userModel = userModel;
    }

    start = (callback: (data: SessionMessage) => void) => {
        this.bot.onText(/\/start/, async (msg) => {
            const telegram_id = msg.chat.id;
            const user = await UserModel.findOne({ telegram_id });
            if (!user) {
                const wallets = [await this.walletRepository.createWallet()]
    
                const createdUser = await this.userModel.create({ telegram_id, wallets });
                if (!createdUser) return { status: false, message: 'unable to create your account' };
    
                callback({ msg, user: createdUser });
                return;
            }
            if (!user) return this.bot.sendMessage(telegram_id, "Error in retrieving account")
            callback({ msg, user });
        })
    }

    on = (callback: (data: SessionType) => void) => {
        this.bot.on('callback_query', async (query) => {
            const telegram_id = query.message?.chat.id!;
            const user = await UserModel.findOne({ telegram_id });
            if (!user) {
                const wallets = [await this.walletRepository.createWallet()]
    
                const createdUser = await this.userModel.create({ telegram_id, wallets });
                if (!createdUser) return { status: false, message: 'unable to create your account' };
    
                callback({ query, user: createdUser });
                return;
            }
            if (!user) return this.bot.sendMessage(telegram_id, "Error in retrieving account")
            callback({ query, user });
        })
    }
}

export default TelegramBotRepository;