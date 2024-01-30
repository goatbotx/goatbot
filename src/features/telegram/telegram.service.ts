import { IUser, IWallet, Language, UserModel } from '../../data/repository/database/models/user';
import EncryptionRepository from '../../data/repository/encryption';
import TradeRepository from '../../data/repository/wallet/trade';
import WalletRepository from '../../data/repository/wallet/wallet';

class TelegramService {
    userModel: typeof UserModel
    encryptionRepository: EncryptionRepository
    walletRepository: WalletRepository;
    tradeRepository: TradeRepository;


    constructor({ userModel, walletRepository, tradeRepository, encryptionRepository } : {
        userModel: typeof UserModel
        walletRepository: WalletRepository
        tradeRepository: TradeRepository;
        encryptionRepository: EncryptionRepository
    }) {
        this.userModel = userModel;
        this.walletRepository = walletRepository;
        this.tradeRepository = tradeRepository;
        this.encryptionRepository = encryptionRepository;
    }

    changeLanguage = async ( { telegram_id, langauge }: { telegram_id: string; langauge: Language } ) => {
        try {
            const user = await this.userModel.findOneAndUpdate({ telegram_id }, { default_language: langauge });
            if (!user) return { status: false, message: 'unable to get current user' };

            return { status: true, user: {...((user as any)._doc as IUser) } };
        } catch (err) {
            return { status: false, message: 'error please send "/start" request again' };
        }
    }

    userOpensChat = async ( { telegram_id }: { telegram_id: string } ) => {
        try {
            const { user } = await this.getCurrentUser(telegram_id);
            if (!user) return { status: false, message: 'unable to get current user' };
            const wallets: IWallet[] = [];

            for (const element of user.wallets) {
                const wallet = await this.walletRepository.getWallet(element);
                wallets.push(wallet);
            }

            return { status: true, user: {...((user as any)._doc as IUser), wallets} };
        } catch (err) {
            return { status: false, message: 'error please send "/start" request again' };
        }
    }

    userAddsWallet = async ( { telegram_id }: { telegram_id: string } ) => {
        try {
            const { user } = await this.getCurrentUser(telegram_id);
            if (!user) return { status: false, message: 'unable to get current user' };
            const wallets: IWallet[] = [];

            if (user.wallets.length >= 3) return { status: false, message: 'delete a wallet before adding one' };

            for (const element of user.wallets) {
                const wallet = await this.walletRepository.getWallet(element);
                wallets.push(wallet);
            }

            const wallet = await this.walletRepository.createWallet();
            if (!wallet) return { status: false, message: 'error please send "/start" request again' };

            wallets.push(wallet);
            user.wallets = wallets;
            await user.save()

            return { status: true, user: {...((user as any)._doc as IUser), wallets} };
        }catch (err) {
            return { status: false, message: 'error please send "/start" request again' };
        }
    }

    generateUserIDToken = ( { telegram_id, wallet_address }: { telegram_id: string; wallet_address?: string } ) => {
        try {
            const token = this.encryptionRepository.encryptToken({ telegram_id, wallet_address });

            return { status: true, token };
        } catch (err) {
            return { status: false, message: 'error please send "/start" request again' };
        }
    }

    generateUserIDTokenAndWallet = async ( { telegram_id, wallet_number }: { telegram_id: string, wallet_number: number } ) => {
        try {
            const { user } = await this.getCurrentUser(telegram_id);
            if (!user) return { status: false, message: 'unable to get current user' };

            const wallet = user.wallets[wallet_number];
            if (!wallet) return { status: false, message: 'unable to get current wallet' };

            const token = this.encryptionRepository.encryptToken({ telegram_id, wallet_address: wallet.address });

            return { status: true, token, wallet_address: wallet.address };
        } catch (err) {
            return { status: false, message: 'error please send "/start" request again' };
        }
    }

    userImportWallet = async ( { telegram_id, private_key }: { telegram_id: string, private_key: string } ) => {
        try {
            const { user } = await this.getCurrentUser(telegram_id);
            if (!user) return { status: false, message: 'unable to get current user' };

            if (!private_key) return { status: false, message: 'invalid private key' };

            const wallets: IWallet[] = [];
            for (const element of user.wallets) {
                const wallet = await this.walletRepository.getWallet(element);
                wallets.push(wallet);
            }

            const wallet = await this.walletRepository.importWallet(private_key);
            if (!wallet) return { status: false, message: 'invalid private key' };
            wallets.push(wallet);
            
            user.wallets = wallets;
            const updatedUser = await user.save();

            return { status: true, user: {...updatedUser, wallets} };
        } catch (err) {
            return { status: false, message: 'error please send "/start" request again' };
        }
    }

    userDeleteWallet = async ({ telegram_id, wallet_number }: { telegram_id: string, wallet_number: number }) => {
        try {
            const { user } = await this.getCurrentUser(telegram_id);
            if (!user) return { status: false, message: 'unable to get current user' };

            const wallets: IWallet[] = [];
            for (const element of user.wallets) {
                if (user.wallets.indexOf(element) === wallet_number) continue;
                const wallet = await this.walletRepository.getWallet(element);
                console.log(element);
                wallets.push(wallet);
            }
            user.wallets = wallets;
            const updatedUser = await user.save();

            return { status: true, user: {...updatedUser, wallets} };
        }catch (err) {
            return { status: false, message: 'error please send "/start" request again' };
        }
    }

    getGeneralBalance = async ({ telegram_id, wallet_number }: { telegram_id: string, wallet_number: number }) => {
        try {
            const { user } = await this.getCurrentUser(telegram_id);
            if (!user) return { status: false, message: 'unable to get current user' };

            const wallet = await this.walletRepository.getWallet(user.wallets[wallet_number]);
            return {status: true, tokens: wallet.others};
        }catch (err) {
            return { status: false, message: 'error please send "/start" request again' };
        }
    }

    getCurrentUser = async (telegram_id: string) => {
        const user = await this.userModel.findOne({ telegram_id });
        if (!user) {
            const wallets = [await this.walletRepository.createWallet()]
            const user = await this.userModel.create({ telegram_id, wallets, referal: {
                referalCode: this.encryptionRepository.generateRandomStringCode(6),
                totalReferrals: 0,
                totalEarnings: 0,
                claimableEarnings: 0,
                totalGoatHeld: 0,
            }});
            if (!user) return { message: 'unable to create your account' };
            return { user };
        }
        if (!user?.referal?.referalCode) {
            user.referal = {
                referalCode: this.encryptionRepository.generateRandomStringCode(6),
                totalReferrals: 0,
                totalEarnings: 0,
                claimableEarnings: 0,
                totalGoatHeld: 0,
            };
            await user.save();
        }
        return { user };
    }

    claimReferral = async ( { telegram_id }: { telegram_id: string } ) => {
        try {
            const { user } = await this.getCurrentUser(telegram_id);
            if (!user) return { status: false, message: 'unable to get current user' };
            const wallets: IWallet[] = [];

            for (const element of user.wallets) {
                const wallet = await this.walletRepository.getWallet(element);
                wallets.push(wallet);
            }

            return { status: true, user: {...((user as any)._doc as IUser), wallets} };
        } catch (err) {
            return { status: false, message: 'error please send "/start" request again' };
        }
    }

}

export default TelegramService;